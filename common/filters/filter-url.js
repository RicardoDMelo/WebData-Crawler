var _ = require('underscore');
var log = require('winston');

module.exports = function (obj, $, options) {
    log.info('Starting url filter.');
    if (!obj.url) {
        obj.url = '';

        if ($("meta").is("[property='og:url']")) {
            obj.url = $("meta[property='og:url']").attr('content');
        } else if ($("meta").is("[property='twitter:url']")) {
            obj.url = $("meta[property='twitter:url']").attr('content');
        } else if ($("link").is("[rel='canonical']")) {
            obj.url = $("link[rel='canonical']").attr('href');
        }else{
			obj.url = options.url;
		}
    }

    return obj;

}
