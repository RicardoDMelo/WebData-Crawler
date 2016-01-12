var urlParse = require('url-parse');

module.exports = {

	sanitizeUrl: function(url, domainUrl, maintainProt) {
		if (url != '') {
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
		} else {
			return '';
		}
	},

	changeHttp: function(url) {
		if (url && !url.match(/^http([s]?):\/\/.*/)) {
			url = 'http://' + url;
		}
		return url;
	},

	isValidUrl: function(url) {
		var urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g;
		return urlRegEx.exec(url);
	}

}
