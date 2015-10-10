var _ = require('underscore');
var log = require('winston');

module.exports = function (obj, $, options) {
    if (!obj.icon) {
        obj.icon = '';
        if ($("link").is("[rel='icon']")) {
            obj.icon = $("link[rel='icon']").attr('href');
        } else if ($("link").is("[rel='shortcut icon']")) {
            obj.icon = $("link[rel='shortcut icon']").attr('href');
        }
    }

    return obj;

}