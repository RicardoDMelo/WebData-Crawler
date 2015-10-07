var request = require('request');
var cheerio = require('cheerio');
var q = require('q');
var urlLib = require('url');
var urlParse = require('url-parse');
var http = require('http');
var sizeOf = require('image-size');
var _ = require('underscore');
var Logger = require('le_node');
var log = new Logger({
  token:'70874635-15a5-42ba-b82a-dbf7c63d0fbd'
});

//TODO sanitize img urls

module.exports = function (HtmlCrawl) {


    var sanitizeUrl = function (url, domainUrl) {
        var urlp = new urlParse(url);
        var domainUrlp = new urlParse(domainUrl);

        //find & remove protocol (http, ftp, etc.) and get domain
        if (urlp.protocol == 'https:') {
            urlp.set('protocol', 'http:');
        } else if (urlp.protocol != 'http:') {
            if (!urlp.protocol && url.indexOf('./') == -1 && url.indexOf('/') != 0) urlp = new urlParse('./' + url);
            urlp.set('hostname', domainUrlp.hostname);
            urlp.set('protocol', 'http:');
        }
        return urlp.href;
    }

    //http://localhost:3000/api/HtmlCrawl/opengraph?url=&imgarr=
    HtmlCrawl.getOpenGraph = function (url, imgarr, callback) {
        var deferred = undefined;


        var sendData = function (og) {
            logger.info('teste');
            if (og.image && og.image.constructor === Array) {
                og.image = _.uniq(og.image);
            }
            callback(null, og);
            log.info('Data parsed, returning openGraph');
            log.info('-----------------------------------------------------------');
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
                    imgUrl = sanitizeUrl(imgUrl, url);
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
                                    imgCount++;

                                } catch (ex) {
                                    imgCount++;
                                    log.error(imgCount + '(' + extension + '): ' + imgUrl);
                                    log.error('Image type unsupported.');
                                }

                                if (imgCount == imgQtd) {
                                    if (!og.image) og.image = imgMax;
                                    deferred.resolve();
                                }
                            });
                        });
                        req.on('error', function (e) {
                            imgCount++;
                        });
                        break;
                    default:
                        imgCount++;
                        break;
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
                    //Load JQuery
                    $ = cheerio.load(body);



                    if ($("meta").is("[property='og:title']") || $("meta").is("[property='og:site_name']")) {
                        //Get OpenGraph
                        log.info('OpenGraph identified');

                        og.title = $("meta[property='og:title']").attr('content') || $("meta[property='og:site_name']").attr('content');
                        og.type = $("meta[property='og:type']").attr('content');
                        if (!imgarr)
                            og.image = $("meta[property='og:image']").attr('content');
                        og.url = $("meta[property='og:url']").attr('content');
                        og.description = $("meta[property='og:description']").attr('content');

                    } else if ($("link").is("[rel='image_src']") && $("link").is("[rel='canonical']")) {
                        //Get Image_Src
                        log.info('Image_src identified');
                        if (!imgarr)
                            og.image = $("link[rel='image_src']").attr('href');

                    } else if ($("link").is("[rel='apple-touch-icon-precomposed']")) {
                        //Get Apple Icon
                        log.info('Apple Icon identified');
                        if (!imgarr)
                            og.image = $("link[rel='apple-touch-icon-precomposed']").attr('href');

                    } else if ($("meta").is("[name='msapplication-TileImage']")) {
                        //Get MSApplication
                        log.info('MSApplication identified');
                        if (!imgarr)
                            og.image = $("meta[name='msapplication-TileImage']").attr('content');
                    }




                    //Populate with generics
                    log.info('Verifying generic data');
                    if (!og.title) og.title = $("meta[name='application-name']").attr('content') || $("title").html() || '';
                    if (!og.description) og.description = $("meta[name='Description']").attr('content') || $("meta[name='description']").attr('content') || '';
                    if (!og.url) og.url = $("link[rel='canonical']").attr('href') || url;
                    if (!og.type) og.type = 'website';
                    if (!og.image) {
                        if (!imgarr)
                            getOgImage(og, $, url);
                        else
                            getArrImage(og, $, url);
                    }
                    //Send Object                  
                    if (deferred)
                        deferred.promise.then(function () {
                            sendData(og);
                        });
                    else
                        sendData(og);

                } catch (ex) {
                    log.error('Error on parsing data.', ex);
                }
            } else {
                log.error('Error on making request to ' + url, error);
            }
        })
    };

    //http://localhost:3000/api/HtmlCrawl/images?url=
    HtmlCrawl.getImages = function (url, callback) {

        var getArrImage = function ($, url) {
            var imgArr = [];
            //Find greatest image
            $("img").each(function (i, elem) {
                var imgUrl = $(this).attr('src');
                if (imgUrl) {
                    imgUrl = sanitizeUrl(imgUrl, url);
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
                    response = getArrImage($, url);;
                    callback(null, response);
                } catch (ex) {
                    log.error('Error on parsing data.', ex);
                }
            } else {
                log.error('Error on making request to ' + url, error);
            }
        })


    };

    HtmlCrawl.remoteMethod(
        'getOpenGraph', {
            http: {
                path: '/opengraph',
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
                }
            ],
            returns: {
                arg: 'openGraph',
                type: 'Object'
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
                type: 'Array'
            }
        }
    );

};