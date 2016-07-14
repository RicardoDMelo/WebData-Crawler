var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var _ = require('underscore');
var log = require('winston');
var DataFinder = require('../data-finder');
var Helper = require('../helper');
var phantom = require('phantom');


module.exports = function(HtmlCrawl) {
	HtmlCrawl.getData = function(url, imgarr, generic, callback) {
		log.info('Getting data from ' + url);
		url = decodeURIComponent(url);
		url = Helper.changeHttp(url);
		if (!Helper.isValidUrl(url)) return false;

		phantom.create(["--load-images=no", "--ignore-ssl-errors=yes", "--web-security=false"]).then(function(ph) {
			ph.createPage().then(function(page) {
				page.open(url).then(function(status) {
					log.info('Data caught, parsing html');

					function onPageReady() {
						setTimeout(function() {
							page.evaluate(function() {
								return document.documentElement.innerHTML;
							}).then(function(body) {
								try {
									if (generic === undefined) generic = false;
									//Load JQuery
									$ = cheerio.load(body, {
										decodeEntities: false
									});
									var options = {
										generic: generic,
										imgarr: imgarr,
										url: url
									};

									DataFinder.createObject($, options).then(function(data) {
										ph.exit();
										callback(null, data);
										log.info('Data parsed, returning object');
									});
								} catch (ex) {
									log.error('Error on parsing data.', ex);
									callback(null, 'Error on parsing data.');
								}
							});
						}, 1000);
					}

					function checkReadyState() {
						setTimeout(function() {
							page.evaluate(function() {
								return document.readyState;
							}).then(function(readyState) {
								if ("complete" === readyState) {
									onPageReady();
								} else {
									checkReadyState();
								}
							});
						});
					}

					checkReadyState();
				});
			});
		});
	};

	HtmlCrawl.getImages = function(url, callback) {
		log.info('Getting data from ' + url);
		url = decodeURIComponent(url);
		url = Helper.changeHttp(url);
		if (!Helper.isValidUrl(url)) return false;

		phantom.create(["--load-images=no", "--ignore-ssl-errors=yes", "--web-security=false"]).then(function(ph) {
			ph.createPage().then(function(page) {
				page.open(url).then(function(status) {
					log.info('Data caught, parsing html');

					function onPageReady() {
						setTimeout(function() {
							page.evaluate(function() {
								return document.documentElement.innerHTML;
							}).then(function(body) {
								try {
									log.info('Data caught, parsing html');
									//Load JQuery
									$ = cheerio.load(body);
									var options = {
										imgarr: true,
										url: url
									};
									DataFinder.useFilter('filter-image', $, options).then(function(data) {
										ph.exit();
										callback(null, data.image);
										log.info('Data parsed, returning object');
									});
								} catch (ex) {
									log.error('Error on parsing data.', ex);
									callback(null, 'Error on parsing data.');
								}
							});
						}, 1000);
					}

					function checkReadyState() {
						setTimeout(function() {
							var readyState = page.evaluate(function() {
								return document.readyState;
							});

							if ("complete" === readyState) {
								onPageReady();
							} else {
								checkReadyState();
							}
						});
					}

					checkReadyState();
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