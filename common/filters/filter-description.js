var _ = require('underscore');
var log = require('winston');

module.exports = function (obj, $, options) {
    log.info('Starting description filter.');
    if (!obj.description) {
        obj.description = '';

        if ($("meta").is("[property='og:description']")) {
            obj.description = $("meta[property='og:description']").attr('content');
        } else if ($("meta").is("[name='Description']")) {
            obj.description = $("meta[name='Description']").attr('content');
        } else if ($("meta").is("[name='description']")) {
            obj.description = $("meta[name='description']").attr('content');
        } else if ($("meta").is("[property='Description']")) {
            obj.description = $("meta[property='Description']").attr('content');
        } else if ($("meta").is("[property='description']")) {
            obj.description = $("meta[property='description']").attr('content');
        }
    }

    return obj;
}
