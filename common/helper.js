var urlParse = require('url-parse');

module.exports = function (Helper) { 
    Helper.sanitizeUrl = function (url, domainUrl, maintainProt) {
        var urlp = new urlParse(url);
        var domainUrlp = new urlParse(domainUrl);

        //find & remove protocol (http, ftp, etc.) and get domain

        if (urlp.protocol != 'http:' && urlp.protocol != 'https:' && url.indexOf('//') != 0) {
            if (!urlp.protocol && url.indexOf('./') == -1 && url.indexOf('/') != 0) urlp = new urlParse('./' + url);
            urlp.set('hostname', domainUrlp.hostname);
        }
        if ((urlp.protocol == 'https:' && maintainProt !== true) || !urlp.protocol) {
            urlp.set('protocol', 'http:');
        }
        return urlp.href;
    }
}