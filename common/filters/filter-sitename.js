var _ = require('underscore');
var log = require('winston');
var urlParse = require('url-parse');

module.exports = function(obj, $, options) {
	if (!obj.sitename) {
		obj.sitename = '';

		if ($("meta").is("[property='og:site_name']")) {
			obj.sitename = $("meta[property='og:site_name']").attr('content');
		} else {
			var urlp = new urlParse(options.url);
			obj.sitename = urlp.hostname;
		}
	}
	return obj;
}
