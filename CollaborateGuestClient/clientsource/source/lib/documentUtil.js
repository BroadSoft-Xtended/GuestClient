(function() {
	var escapeEl = document.createElement('textarea');

	window.escapeHTML = function(html) {
		escapeEl.textContent = html;
		return escapeEl.innerHTML;
	};

	window.unescapeHTML = function(html) {
		escapeEl.innerHTML = html;
		return escapeEl.textContent;
	};
})();

var suppressErrorAlert = true;
window.onerror = function (message, file, line, col, error) {
	 

	   if(!suppressErrorAlert){
		   // Note that col & error are new to the HTML 5 spec and may not be 
		   // supported in every browser.  It worked for me in Chrome.
		   var extra = !col ? '' : '\ncolumn: ' + col;
		   extra += !error ? '' : '\nerror: ' + error;
		   
		   LOGGER.API.error("documentUtil.js", "Error: " + message + "\nurl: " + file + "\nline: " + line + extra);
	   }
	  

	   // TODO: Report this error via ajax so you can keep track
	   //       of what pages have JS issues

	   
	   // If you return true, then error alerts (like in older versions of 
	   // Internet Explorer) will be suppressed.
	   return suppressErrorAlert;

};
window.addEventListener('error', function (evt) {
	   if(!suppressErrorAlert){
		   // You can view the information in an alert to see things working like this:
		   LOGGER.API.error("documentUtil.js", "Error: " , evt);
	   }

	   evt.preventDefault();
});

var getOuterHeight = function(id) {
	var client = document.getElementById(id);
	var value = $(client).outerHeight();
	return value;
};

var getHeight = function(id) {
	var client = document.getElementById(id);
	var value = $(client).height() + "";

	return parseInt(value);
};

var getWidth = function(id) {
	var client = document.getElementById(id);
	var value = $(client).width() + "";
	return parseInt(value);
};

var getOuterWidth = function(id) {
	var client = document.getElementById(id);
	var value = $(client).outerWidth() + "";
	return parseInt(value);
};

var isNullOrEmpty = function(value) {
	if (!value || value.trim() == "") {
		return true;
	}
	return false;
};

var browserName;
var fullVersion;
var majorVersion;
var isSupportedBorwser = function() {

	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	browserName = navigator.appName;
	fullVersion = '' + parseFloat(navigator.appVersion);
	majorVersion = parseInt(navigator.appVersion, 10);
	var nameOffset, verOffset, ix;
	// In Opera 15+, the true version is after "OPR/"
	if ((verOffset = nAgt.indexOf("OPR/")) != -1) {
		browserName = "Opera";
		fullVersion = nAgt.substring(verOffset + 4);
	}
	// In older Opera, the true version is after "Opera" or after "Version"
	else if ((verOffset = nAgt.indexOf("Opera")) != -1) {
		browserName = "Opera";
		fullVersion = nAgt.substring(verOffset + 6);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In Revise version, the true version is after "MSIE" in userAgent
	else if (nAgt.indexOf(".NET") !== -1
	        && (verOffset = nAgt.indexOf("rv")) != -1) {
		browserName = "Internet Explorer";
		fullVersion = nAgt.substring(verOffset + 3).trim();
		fullVersion = fullVersion.substring(0, fullVersion.indexOf(" ") - 1)
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
		browserName = "Internet Explorer";
		fullVersion = nAgt.substring(verOffset + 5);
	}
	// In Edge, the agent "Edge" is present after "Chrome" and so this
	// condition is placed before Chrome
	else if ((verOffset = nAgt.indexOf("Edge")) != -1) {
		browserName = "Edge";
		fullVersion = nAgt.substring(verOffset + 5);
	}
	// In Chrome, the true version is after "Chrome"
	else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
		browserName = "Chrome";
		fullVersion = nAgt.substring(verOffset + 7);
	}
	// In Safari, the true version is after "Safari" or after "Version"
	else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
		browserName = "Safari";
		fullVersion = nAgt.substring(verOffset + 7);
		if ((verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In Firefox, the true version is after "Firefox"
	else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
		browserName = "Firefox";
		fullVersion = nAgt.substring(verOffset + 8);
	}
	// In most other browsers, "name/version" is at the end of userAgent
	else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt
	        .lastIndexOf('/'))) {
		browserName = nAgt.substring(nameOffset, verOffset);
		fullVersion = nAgt.substring(verOffset + 1);
		if (browserName.toLowerCase() == browserName.toUpperCase()) {
			browserName = navigator.appName;
		}
	}
	// trim the fullVersion string at semicolon/space if present
	if ((ix = fullVersion.indexOf(";")) != -1)
		fullVersion = fullVersion.substring(0, ix);
	if ((ix = fullVersion.indexOf(" ")) != -1)
		fullVersion = fullVersion.substring(0, ix);

	majorVersion = parseInt('' + fullVersion, 10);
	if (isNaN(majorVersion)) {
		fullVersion = '' + parseFloat(navigator.appVersion);
		majorVersion = parseInt(navigator.appVersion, 10);
	}

	if (browserName == "Chrome"
	        || (browserName == "Safari" && window.navigator.platform
	                .toLowerCase().indexOf('mac') !== -1)
	        || (browserName == "Internet Explorer" && window.navigator.platform
	                .toLowerCase().indexOf('mac') == -1)
	        || (browserName == "Edge")) {
		if (browserName == "Safari" && parseFloat(fullVersion) >= 7) {
			return true;
		} else if (browserName == "Internet Explorer"
		        && (parseFloat(fullVersion) >= 11)) {
			return true;
		} else if (browserName == "Chrome") {
			return true;
		} else if (browserName == "Edge") {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}

};


var Sound = function() {
	this.soundOut = document.createElement("audio");
	this.soundOutDTMF = document.createElement("audio");
};

Sound.prototype = {
    pause : function() {
	    this.soundOut.pause();
	    this.soundOutDTMF.pause();
    },

    playDtmfRingback : function() {
	    this.playDtmf("media/dtmf-ringback.ogg", {
		    loop : true
	    });
    },

    playRingtone : function() {
	    this.play("media/ringtone.ogg", {
		    loop : true
	    });
    },

    playDtmfTone : function(tone) {
	    this.playDtmf("media/dtmf-" + tone + ".ogg");
    },

    playClick : function() {
	    this.play("media/click.ogg");
    },

    play : function(media, options) {
	    this.playTone(this.soundOut, media, options);
    },

    playTone : function(audioSource, media, options) {
	    // avoid restarting same playing audio
	    if (audioSource.getAttribute("src") === media && !audioSource.paused) {
		    return;
	    }
	    options = options || {};
	    audioSource.setAttribute("src", media);
	    if (options.loop) {
		    audioSource.setAttribute("loop", "true");
	    } else {
		    audioSource.removeAttribute("loop");
	    }
	    
	    var playPromise = audioSource.play();
	    if (playPromise) {
	    	playPromise.then(function() {
	        // Automatic playback started!
	        // Show playing UI.
	    	}).catch(function(error) {
	        // Auto-play was prevented
	        // Show paused UI.
	    	  if(LOGGER.API.isDevDebug()){
	    		  LOGGER.API.devDebug("documentUtil.js", "Play tone thorws error.") ;
	    	  }
	      });
	    }
    },

    playDtmf : function(media, options) {
	    this.playTone(this.soundOutDTMF, media, options);
    }
};
window.Sound = new Sound();
