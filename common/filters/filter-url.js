var _ = require('underscore');
var log = require('winston');

module.exports = function (FilterUrl) {
    FilterUrl = function (obj, $, options) {
        if (!obj.url) {
            if ($("meta").is("[property='og:url']")) {
                obj.url = $("meta[property='og:url']").attr('content');
            } else if ($("meta").is("[property='twitter:url']")) {
                obj.url = $("meta[property='twitter:url']").attr('content');
            } else if ($("link").is("[rel='canonical']")) {
                obj.url = $("link[rel='canonical']").attr('href');
            } else {
                obj.url = '';
            }
        }

        return obj;
    }
}