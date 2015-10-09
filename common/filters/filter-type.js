var _ = require('underscore');
var log = require('winston');

module.exports = function (FilterType) {
    FilterType = function (obj, $, options) {
        if (!obj.sitename) {
            if ($("meta").is("[property='og:type']")) {
                obj.type = $("meta[property='og:type']").attr('content');
            } else {
                obj.type = 'website';
            }
        }

        return obj;
    }
}