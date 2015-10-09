var _ = require('underscore');
var log = require('winston');

module.exports = function (FilterIcon) {
    FilterIcon = function (obj, $, options) {
        if (!obj.icon) {
            if ($("link").is("[rel='icon']")) {
                obj.icon = $("link[rel='icon']").attr('href');
            } else if ($("link").is("[rel='shortcut icon']")) {
                obj.icon = $("link[rel='shortcut icon']").attr('href');
            }
        }

        return obj;
    }
}