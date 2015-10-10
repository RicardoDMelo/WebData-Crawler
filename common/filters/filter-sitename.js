var _ = require('underscore');
var log = require('winston');

module.exports = function (obj, $, options) {
    if (!obj.sitename) {
        obj.sitename = '';

        if ($("meta").is("[property='og:site_name']")) {
            obj.sitename = $("meta[property='og:site_name']").attr('content');
        }
    }
    return obj;
}
