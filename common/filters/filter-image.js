var log = require('winston');
var Helper = require('../helper');
var q = require('q');
var _ = require('underscore');

module.exports = function(obj, $, options) {
	log.info('Starting image filter.');
	if (!obj.image) {
		if (options.imgarr !== 'true') {
			obj = getImgByTag(obj, $, options);
		} else {
			obj.image = [];
			obj = getImgArr(obj, $, options);
		}
	}

	return obj;
}

function getGenericImage(obj, $, options) {
	var areaMax = 0;
	var imgMax = undefined;
	var imgCount = 0;
	var imgQtd = $("img").length;
	var checkCount = function() {
		imgCount++;
		if (imgCount == imgQtd) {
			if (!obj.image) obj.image = imgMax;
			deferred.resolve(obj);
		}
	};
	var deferred = q.defer();
	if (imgQtd == 0) deferred.resolve(obj);

	$("img").each(function(i, elem) {
		var imgUrl = $(this).attr('src');
		if (imgUrl) {
			imgUrl = Helper.sanitizeUrl(imgUrl, options.url, true);
			if (!obj.image) {
				obj.image = imgUrl;
				deferred.resolve(obj);
			}
		}
	});
	return deferred.promise;
};

var getImgByTag = function(obj, $, options) {
	var deferred = q.defer();

	obj.image = getUrlFromTag($, options);

	if (!obj.image) {
		if (options.generic) {
			getGenericImage(obj, $, options).then(function(res) {
				if (res.image)
					res.image = Helper.sanitizeUrl(res.image, options.url, true);
				deferred.resolve(res);
			}).catch(function(res) {
				res.image = '';
				deferred.resolve(res);
			});
		} else {
			obj.image = '';
			deferred.resolve(obj);
		}
	} else {
		obj.image = Helper.sanitizeUrl(obj.image, options.url, true);
		deferred.resolve(obj);
	}

	return deferred.promise;
};

var getUrlFromTag = function($, options) {
	if ($("meta").is("[property='og:image']")) {
		return $("meta[property='og:image']").attr('content');
	} else if ($("meta").is("[property='twitter:image']")) {
		return $("meta[property='twitter:image']").attr('content');
	} else if ($("link").is("[rel='img_src']")) {
		return $("link[rel='image_src']").attr('href');
	} else if ($("link").is("[rel='apple-touch-icon']")) {
		return $("link[rel='apple-touch-icon']").attr('href');
	} else if ($("link").is("[rel='apple-touch-icon-precomposed']")) {
		return $("link[rel='apple-touch-icon-precomposed']").attr('href');
	} else if ($("meta").is("[name='msapplication-TileImage']")) {
		return $("meta[name='msapplication-TileImage']").attr('content');
	} else if ($("article").has("img").length && options.generic) {
		return $("article").find("img").first().attr('src');
	}
	return '';
}


var getImgArr = function(obj, $, options) {

	var firstUrl = getUrlFromTag($, options);
	if (firstUrl != '') {
		if (!obj.image) obj.image = [];
		obj.image.push(Helper.sanitizeUrl(firstUrl, options.url, true));
	}

	$("img").each(function(i, elem) {
		var imgUrl = $(this).attr('src');
		if (imgUrl) {
			imgUrl = Helper.sanitizeUrl(imgUrl, options.url, true);
			if (!obj.image) obj.image = [];
			obj.image.push(imgUrl);
		}
	});

	obj.image = _.uniq(obj.image);
	return obj;
};