var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var _ = require('underscore');
var log = require('winston');
var DataFinder = require('../data-finder');
var Helper = require('../helper');

//TODO sanitize img urls

module.exports = function (HtmlCrawl) {
    HtmlCrawl.getData = function (url, imgarr, generic, callback) {
        log.info('Getting data from ' + url);
        url = Helper.changeHttp(url);
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    log.info('Data caught, parsing html');
                    if (generic === undefined) generic = true;
                    //Load JQuery
                    $ = cheerio.load(body);
                    var options = {
                        generic: generic,
                        imgarr: imgarr,
                        url: url
                    };

                    DataFinder.createObject($, options).then(function (data) {
                        callback(null, data);
                        log.info('Data parsed, returning object');
                    });
                } catch (ex) {
                    log.error('Error on parsing data.', ex);
                    callback(null, 'Error on parsing data.');
                }
            } else {
                log.error('Error on making request to ' + url, error);
                callback(null, 'Error on making request to ' + url);
            }
        })
    };

    HtmlCrawl.getImages = function (url, callback) {
        log.info('Getting data from ' + url);
        url = Helper.changeHttp(url);
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    log.info('Data caught, parsing html');
                    //Load JQuery
                    $ = cheerio.load(body);
                    var options = {
                        imgarr: true,
                        url: url
                    };


                    DataFinder.useFilter('filter-image', $, options).then(function (data) {
                        callback(null, data);
                        log.info('Data parsed, returning object');
                    });

                } catch (ex) {
                    log.error('Error on parsing data.', ex);
                    callback(null, 'Error on parsing data.');
                }
            } else {
                log.error('Error on making request to ' + url, error);
                callback(null, 'Error on making request to ' + url);
            }
        })
    };

    HtmlCrawl.remoteMethod(
        'getData', {
            http: {
                path: '/webdata',
                verb: 'get'
            },
            accepts: [
                {
                    arg: 'url',
                    type: 'string'
                },
                {
                    arg: 'imgarr',
                    type: 'boolean'
                },
                {
                    arg: 'generic',
                    type: 'boolean'
                }
            ],
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
