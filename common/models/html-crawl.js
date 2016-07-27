var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var _ = require('underscore');
var log = require('winston');
var DataFinder = require('../data-finder');
var Helper = require('../helper');
var Browser = require('zombie');


module.exports = function(HtmlCrawl) {
	HtmlCrawl.getData = function(url, imgarr, generic, callback) {
		log.info('Getting data from ' + url);
		url = decodeURIComponent(url);
		url = Helper.changeHttp(url);
		if (!Helper.isValidUrl(url)) return false;

		var browser = new Browser();
		browser.visit(url, {
			debug: true,
			silent: false
		}, function() {
			log.info('Data caught, parsing html');
			try {
				if (generic === undefined) generic = false;
				//Load JQuery
				$ = cheerio.load(browser.html(), {
					decodeEntities: false
				});
				var options = {
					generic: generic,
					imgarr: imgarr,
					url: url
				};

				DataFinder.createObject($, options).then(function(data) {
					callback(null, data);
					log.info('Data parsed, returning object');
				});
			} catch (ex) {
				log.error('Error on parsing data.', ex);
				callback(null, 'Error on parsing data.');
			}
		});
	};

	HtmlCrawl.getImages = function(url, callback) {
		log.info('Getting images from ' + url);
		url = decodeURIComponent(url);
		url = Helper.changeHttp(url);
		if (!Helper.isValidUrl(url)) return false;

		phantom.create(["--load-images=no", "--ignore-ssl-errors=yes", "--web-security=false"]).then(function(ph) {
			ph.createPage().then(function(page) {
				page.open(url).then(function(status) {
					log.info('Images caught, parsing html');

					function onPageReadyImage() {
						setTimeout(function() {
							page.evaluate(function() {
								return document.documentElement.innerHTML;
							}).then(function(body) {

								try {
									//Load JQuery
									$ = cheerio.load(body);
									var options = {
										imgarr: true,
										url: url
									};
									DataFinder.useFilter('filter-image', $, options).then(function(data) {
										ph.exit();
										callback(null, data.image);
										log.info('Images parsed, returning object');
									});
								} catch (ex) {
									log.error('Error on parsing images.', ex);
									callback(null, 'Error on parsing images.');
								}
							});
						}, 1000);
					}

					function checkReadyStateImage() {
						setTimeout(function() {
							page.evaluate(function() {
								return document.readyState;
							}).then(function(readyState) {
								if ("complete" === readyState) {
									onPageReadyImage();
								} else {
									checkReadyStateImage();
								}
							});
						});
					}

					checkReadyStateImage();
				});
			});
		});
	};

	HtmlCrawl.remoteMethod(
		'getData', {
			http: {
				path: '/webdata',
				verb: 'get'
			},
			accepts: [{
				arg: 'url',
				type: 'string'
			}, {
				arg: 'imgarr',
				type: 'boolean'
			}, {
				arg: 'generic',
				type: 'boolean'
			}],
			returns: {
				arg: 'webdata',
				type: 'object',
				root: true
			}
		}
	);

	HtmlCrawl.remoteMethod(
		'getImages', {
			http: {
				path: '/images',
				verb: 'get'
			},
			accepts: {
				arg: 'url',
				type: 'string',
				http: {
					source: 'query'
				}
			},
			returns: {
				arg: 'imgs',
				type: 'Array',
				root: true
			}
		}
	);

};