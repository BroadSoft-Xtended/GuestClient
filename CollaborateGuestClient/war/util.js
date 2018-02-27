
/**
 * BroadWorks Copyright (c) 2014 BroadSoft, Inc. All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

/*
 *                                    IMPORTANT
 * 
 * This file is commont utility between web worker and main application.
 * This file should not include any call to document or window object.
 * 
 * 
*/

(function() {
	//String.prototype.endsWith() has been added to the ECMAScript 6 specification
	//and may not be available in all JavaScript implementations yet.
	//refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith#Polyfill
	if (!String.prototype.endsWith){
		String.prototype.endsWith = function(searchStr, Position) {
			// This works much better than >= because
			// it compensates for NaN:
			if (!(Position < this.length))
				Position = this.length;
			else
				Position |= 0; // round position
			return this.substr(Position - searchStr.length,
					searchStr.length) === searchStr;
		};
	}
})();

var getBrowserName = function() {
	var N = navigator.appName;
	var UA = navigator.userAgent;
	var temp;
	var browserName;
	var edgeAgent = UA.match(/(edge)/i);
	if (edgeAgent != null) {
		browserName = "Edge";
	} else {
		var browserVersion = UA
		        .match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
		if (browserVersion && (temp = UA.match(/version\/([\.\d]+)/i)) != null)
			browserVersion[2] = temp[1];
		browserVersion = browserVersion ? [ browserVersion[1],
		        browserVersion[2] ] : [ N, navigator.appVersion, '-?' ];
		browserName = browserVersion[0];
	}
	return browserName;
};

var isFirefox = function() {
	var ua = detect.parse(navigator.userAgent);
	return (/firefox/).test(ua.browser.family.toLowerCase());
};

var isChrome = function() {
	//		var ua = detect.parse(navigator.userAgent);
	//		return (/chrom(e|ium)/).test(ua.browser.family.toLowerCase());
	var browerName = getBrowserName();
	if (browerName == "Chrome") {
		return true;
	}
	return false;

};

var isIE = function() {
	var browerName = getBrowserName();
	if (browerName == "Netscape") {
		return true;
	}
	return false;
};

var isSafari = function() {
	var browerName = getBrowserName();
	if (browerName == "Safari") {
		return true;
	}
	return false;
};

var isEdge = function() {
	var browerName = getBrowserName();
	if (browerName == "Edge") {
		return true;
	}
	return false;
};


function htmlEscape(str) {
	return String(str).replace('&amp;', /&/g).replace('&quot;', /"/g).replace(
	        '&#39;', /'/g).replace('&lt;', /</g).replace('&gt;', />/g);
};

function htmlEncode(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(
	        />/g, '&gt;');
};

var B64 = (function() {
	var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	var obj = {
	    /**
	     * Encodes a string in base64
	     * 
	     * @param {String}
	     *            input The string to encode in base64.
	     */
	    encode : function(input) {
		    var output = "";
		    var chr1, chr2, chr3;
		    var enc1, enc2, enc3, enc4;
		    var i = 0;

		    do {
			    chr1 = input.charCodeAt(i++);
			    chr2 = input.charCodeAt(i++);
			    chr3 = input.charCodeAt(i++);

			    enc1 = chr1 >> 2;
			    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			    enc4 = chr3 & 63;

			    if (isNaN(chr2)) {
				    enc3 = enc4 = 64;
			    } else if (isNaN(chr3)) {
				    enc4 = 64;
			    }

			    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2)
			            + keyStr.charAt(enc3) + keyStr.charAt(enc4);
		    } while (i < input.length);

		    return output;
	    },

	    /**
	     * Decodes a base64 string.
	     * 
	     * @param {String}
	     *            input The string to decode.
	     */
	    decode : function(input) {
		    var output = "";
		    var chr1, chr2, chr3;
		    var enc1, enc2, enc3, enc4;
		    var i = 0;

		    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
		    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		    do {
			    enc1 = keyStr.indexOf(input.charAt(i++));
			    enc2 = keyStr.indexOf(input.charAt(i++));
			    enc3 = keyStr.indexOf(input.charAt(i++));
			    enc4 = keyStr.indexOf(input.charAt(i++));

			    chr1 = (enc1 << 2) | (enc2 >> 4);
			    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			    chr3 = ((enc3 & 3) << 6) | enc4;

			    output = output + String.fromCharCode(chr1);

			    if (enc3 != 64) {
				    output = output + String.fromCharCode(chr2);
			    }
			    if (enc4 != 64) {
				    output = output + String.fromCharCode(chr3);
			    }
		    } while (i < input.length);

		    return output;
	    }
	};

	return obj;
})();
