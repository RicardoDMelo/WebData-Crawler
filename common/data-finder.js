var log = require('winston');
var path = require('path');
var q = require('q');
var _ = require('underscore');

module.exports = {
    createObject: function ($, options) {
        var obj = {};
        var filters = {};
        var filterpath = __dirname + '\\filters';
        var pArr = [];

        require('fs').readdirSync(filterpath).forEach(function (file) {
            var filterName = path.basename(file, '.js');
            filters[filterName] = require(path.join(filterpath, file));
            pArr.push(q.when(filters[filterName](obj, $, options)));
        });
        
        return q.all(pArr).then(function (data) {
            return data[0];
        });
    },
    useFilter: function (filter, $, options) {
        var obj = {};
        var filters = {};
        var filterpath = __dirname + '\\filters';
        var pArr = [];

        require('fs').readdirSync(filterpath).forEach(function (file) {
            var filterName = path.basename(file, '.js');
            if (filter == filterName || (filter.constructor === Array && _.contains(filter, filterName))) {
                filters[filterName] = require(path.join(filterpath, file));
                pArr.push(q.when(filters[filterName](obj, $, options)));
            }
        });
        
        return q.all(pArr).then(function (data) {
            return data[0];
        });
    }
};
