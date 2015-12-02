var _ = require('underscore');
var log = require('winston');

module.exports = function (obj, $, options) {
    if (!obj.title) {
        obj.title = '';

        if ($("meta").is("[property='og:title']")) {
            obj.title = $("meta[property='og:title']").attr('content');
        } else if ($("meta").is("[name='twitter:title']")) {
            obj.title = $("meta[property='twitter:title']").attr('content');
        } else if ($("meta").is("[name='twitter:site']")) {
            obj.title = $("meta[property='twitter:site']").attr('content');
        } else if ($("meta").is("[name='application-name']")) {
            obj.title = $("meta[name='application-name']").attr('content');
        } else if ($("title")) {
            obj.title = $("title").html();
        }
    }

    return obj;
}
