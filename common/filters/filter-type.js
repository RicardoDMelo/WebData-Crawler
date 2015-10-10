var _ = require('underscore');
var log = require('winston');

module.exports = function (obj, $, options) {
    if (!obj.type) {
        obj.type = 'website';
        if ($("meta").is("[property='og:type']")) {
            obj.type = $("meta[property='og:type']").attr('content');
        }
    }

    return obj;

}
