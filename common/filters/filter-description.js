var _ = require('underscore');
var log = require('winston');

module.exports = function (FilterDescription) {
    FilterDescription = function (obj, $, options) {
        if (!obj.description) {
            if ($("meta").is("[property='og:description']")) {
                obj.description = $("meta[property='og:description']").attr('content');
            } else if ($("meta").is("[property='Description']")) {
                obj.description = $("meta[name='Description']").attr('content');
            } else if ($("meta").is("[property='description']")) {
                obj.description = $("meta[name='description']").attr('content');
            } else {
                obj.description = '';
            }
        }

        return obj;
    }
}