/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

	function htmlEscape(str) {
	    return String(str)
	            .replace('&amp;', /&/g)
	            .replace('&quot;', /"/g)
	            .replace('&#39;', /'/g)
	            .replace('&lt;', /</g)
	            .replace('&gt;', />/g);
	}

	function htmlEncode(str) {
		return String(str)
	    .replace(/&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;');
	}

	var getBrowserName = function(){
		var N= navigator.appName;
		var UA= navigator.userAgent;
		var temp;
		var browserName;
		var edgeAgent = UA.match(/(edge)/i);
		if(edgeAgent != null){
			browserName = "Edge";
		} else {
			var browserVersion= UA.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
			if(browserVersion && (temp= UA.match(/version\/([\.\d]+)/i))!= null)
			browserVersion[2]= temp[1];
			browserVersion= browserVersion? [browserVersion[1], browserVersion[2]]: [N, navigator.appVersion,'-?'];
			browserName = browserVersion[0];
		}
		return browserName;
	}; 
	
	var isChrome = function(){
		var browerName = getBrowserName();
		if(browerName=="Chrome"){
			return true;
		}
		return false;
	}

	var isIE = function(){
		var browerName = getBrowserName();
		if(browerName=="Netscape"){
			return true;
		}
		return false;
	}
	
	var isSafari = function(){
		var browerName = getBrowserName();
		if(browerName=="Safari"){
			return true;
		}
		return false;
	}
	
	var isEdge = function(){
		var browerName = getBrowserName();
		if(browerName=="Edge"){
			return true;
		}
		return false;
	}

	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName  = navigator.appName;
	var fullVersion  = ''+parseFloat(navigator.appVersion); 
	var majorVersion = parseInt(navigator.appVersion,10);
	var nameOffset,verOffset,ix;
	// In Opera 15+, the true version is after "OPR/" 
	if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
	 browserName = "Opera";
	 fullVersion = nAgt.substring(verOffset+4);
	}
	// In older Opera, the true version is after "Opera" or after "Version"
	else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
	 browserName = "Opera";
	 fullVersion = nAgt.substring(verOffset+6);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In Revise version, the true version is after "MSIE" in userAgent
	else if (nAgt.indexOf(".NET") !==-1  && (verOffset=nAgt.indexOf("rv"))!=-1) {
	 browserName = "Internet Explorer";
	 fullVersion = nAgt.substring(verOffset+3).trim();
	 fullVersion = fullVersion.substring(0,fullVersion.indexOf(" ")-1)
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
	 browserName = "Internet Explorer";
	 fullVersion = nAgt.substring(verOffset+5);
	}
	// In Edge, the agent "Edge" is present after "Chrome" and so this condition is placed before Chrome 
	else if ((verOffset=nAgt.indexOf("Edge"))!=-1) {
	 browserName = "Edge";
	 fullVersion = nAgt.substring(verOffset+5);
	}
	// In Chrome, the true version is after "Chrome" 
	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
	 browserName = "Chrome";
	 fullVersion = nAgt.substring(verOffset+7);
	}
	// In Safari, the true version is after "Safari" or after "Version" 
	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
	 browserName = "Safari";
	 fullVersion = nAgt.substring(verOffset+7);
	 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
	   fullVersion = nAgt.substring(verOffset+8);
	}
	// In Firefox, the true version is after "Firefox" 
	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
	 browserName = "Firefox";
	 fullVersion = nAgt.substring(verOffset+8);
	}
	// In most other browsers, "name/version" is at the end of userAgent 
	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
	          (verOffset=nAgt.lastIndexOf('/')) ) 
	{
	 browserName = nAgt.substring(nameOffset,verOffset);
	 fullVersion = nAgt.substring(verOffset+1);
	 if (browserName.toLowerCase()==browserName.toUpperCase()) {
	  browserName = navigator.appName;
	 }
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix=fullVersion.indexOf(";"))!=-1)
	   fullVersion=fullVersion.substring(0,ix);
	if ((ix=fullVersion.indexOf(" "))!=-1)
	   fullVersion=fullVersion.substring(0,ix);

	majorVersion = parseInt(''+fullVersion,10);
	if (isNaN(majorVersion)) {
	 fullVersion  = ''+parseFloat(navigator.appVersion); 
	 majorVersion = parseInt(navigator.appVersion,10);
	}
	
	
	var getHeight = function(id) {
		var client = document.getElementById(id);
		var value = $(client).height() + "";

		return parseInt(value);
	}

	var getWidth = function(id) {
		var client = document.getElementById(id);
		var value = $(client).width() + "";
		return parseInt(value);
	}
	
	var isNullOrEmpty = function(value){
		if(!value || value.trim() == ""){
			return true;
		}
		return false;
	}
	
	var isSupportedBorwser = function(){
		if(browserName == "Chrome" || (browserName == "Safari" && window.navigator.platform.toLowerCase().indexOf('mac') !== -1) || (browserName == "Internet Explorer" && window.navigator.platform.toLowerCase().indexOf('mac') == -1)
				|| (browserName == "Edge" )){
			if(browserName == "Safari" && parseFloat(fullVersion) >= 7  ){
				return true;
			}else if(browserName == "Internet Explorer"  && (parseFloat(fullVersion) >= 11) ){
				return true;
			}else if(browserName == "Chrome"){
				return true;
			}else if(browserName == "Edge"){
				return true;
			}else{
				return false;
			}
		}else{
			return false;
		}
		
	}
	
	var B64 = (function () {
	    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	    var obj = {
	        /**
	         * Encodes a string in base64
	         * @param {String} input The string to encode in base64.
	         */
	        encode: function (input) {
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

	                output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
	                    keyStr.charAt(enc3) + keyStr.charAt(enc4);
	            } while (i < input.length);

	            return output;
	        },

	        /**
	         * Decodes a base64 string.
	         * @param {String} input The string to decode.
	         */
	        decode: function (input) {
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
	
	