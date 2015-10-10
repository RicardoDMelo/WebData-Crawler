var request = require('request');
var cheerio = require('cheerio');
var q = require('q');
var urlLib = require('url');
var urlParse = require('url-parse');
var http = require('http');
var sizeOf = require('image-size');
var _ = require('underscore');
var log = require('winston');

//TODO sanitize img urls

module.exports = function (HtmlCrawl) {



    //http://localhost:3000/api/HtmlCrawl/opengraph?url=&imgarr=
    HtmlCrawl.getData = function (url, imgarr, generic, callback) {
        var deferred = undefined;

        var sendData = function (og) {
            if (og.image && og.image.constructor === Array) {
                og.image = _.uniq(og.image);
            }
            callback(null, og);
            log.info('Data parsed, returning openGraph');
        };

        //Get image properties
        var getImageSize = function (chunks) {
            var buffer = Buffer.concat(chunks);
            var img = sizeOf(buffer);
            return img;
        };

        //Get array of images
        var getArrImage = function (og, $, url) {
            //Find greatest image
            $("img").each(function (i, elem) {
                var imgUrl = $(this).attr('src');
                if (imgUrl) {
                    imgUrl = sanitizeUrl(imgUrl, url, true);
                    if (!og.image) og.image = [];
                    og.image.push(imgUrl);
                }
            });
        }

        //Get single image
        var getOgImage = function (og, $, url) {
            var areaMax = 0;
            var imgMax = undefined;
            var imgCount = 0;
            var imgQtd = $("img").length;
            deferred = q.defer();
            $("img").each(function (i, elem) {
                var imgUrl = $(this).attr('src');
                if (imgUrl) {
                    imgUrl = sanitizeUrl(imgUrl, url);
                    var options = urlLib.parse(imgUrl);

                    // Use a regular expression to trim everything before final dot
                    var extension = imgUrl.replace(/^.*\./, '');
                    if (extension == imgUrl) {
                        extension = '';
                    } else {
                        extension = extension.toLowerCase();
                    }
                    switch (extension) {
                    case 'jpg':
                    case 'jpeg':
                    case 'png':
                    case 'gif':
                    case 'bmp':
                        var req = http.get(options, function (response) {
                            var chunks = [];
                            response.on('data', function (chunk) {
                                chunks.push(chunk);
                            }).on('end', function () {
                                try {
                                    var ppc = 0;
                                    var img = getImageSize(chunks);

                                    var area = img.width * img.height;

                                    //Check bigger image
                                    if (area >= areaMax) {
                                        imgMax = imgUrl;
                                        areaMax = area;

                                        if (img.width > img.height)
                                            ppc = img.width / img.height;
                                        else
                                            ppc = img.height / img.width;

                                        //Maximum 5:1 relationship
                                        if (ppc <= 5)
                                            og.image = imgUrl;
                                    }

                                } catch (ex) {
                                    //log.error(imgCount + '(' + extension + '): ' + imgUrl);
                                    //log.error('Image type unsupported.');
                                }

                                imgCount++;
                                if (imgCount == imgQtd) {
                                    if (!og.image) og.image = imgMax;
                                    deferred.resolve();
                                }
                            });
                        });
                        req.on('error', function (e) {
                            imgCount++;
                            log.error(e);
                            if (imgCount == imgQtd) {
                                if (!og.image) og.image = imgMax;
                                deferred.resolve();
                            }
                        });
                        break;
                    default:
                        imgCount++;
                        if (imgCount == imgQtd) {
                            if (!og.image) og.image = imgMax;
                            deferred.resolve();
                        }
                        break;
                    }
                } else {
                    imgCount++;
                    if (imgCount == imgQtd) {
                        if (!og.image) og.image = imgMax;
                        deferred.resolve();
                    }
                }
            });
        }

        log.info('Getting data from ' + url);

        //Sanitize Url
        if (url && !url.match(/^http([s]?):\/\/.*/)) {
            url = 'http://' + url;
        }

        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    log.info('Data caught, parsing html');
                    var og = {
                        title: '',
                        type: '',
                        image: undefined,
                        url: '',
                        description: ''
                    };

                    if (generic === undefined) generic = true;

                    //Load JQuery
                    $ = cheerio.load(body);

                    if (icon)
                        og.icon = sanitizeUrl(icon, url, true);


                    //Populate with generics
                    log.info('Verifying generic data');
                    if (!og.image) {
                        if (!imgarr) {
                            if (generic) {
                                log.info('Getting biggest image');
                                getOgImage(og, $, url);
                            }
                        } else {
                            log.info('Getting array of images');
                            getArrImage(og, $, url);
                        }
                    }
                    if (og.image)
                        og.image = sanitizeUrl(og.image, url, true);
                    //Send Object
                    if (deferred)
                        deferred.promise.then(function () {
                            sendData(og);
                        });
                    else
                        sendData(og);

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

    //http://localhost:3000/api/HtmlCrawl/images?url=
    HtmlCrawl.getImages = function (url, callback) {

        var getArrImage = function ($, url) {
            var imgArr = [];
            log.info('Getting images');
            //Find images
            $("img").each(function (i, elem) {
                var imgUrl = $(this).attr('src');
                if (imgUrl) {
                    imgUrl = sanitizeUrl(imgUrl, url, true);
                    imgArr.push(imgUrl);
                }
            });

            imgArr = _.uniq(imgArr);
            return imgArr;
        }


        log.info('Getting data from ' + url);

        //Sanitize Url
        if (url && !url.match(/^http([s]?):\/\/.*/)) {
            url = 'http://' + url;
        }

        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    log.info('Data caught, parsing html');
                    //Load JQuery
                    $ = cheerio.load(body);
                    response = getArrImage($, url);
                    log.info('Data parsed, returning images');
                    callback(null, response);
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