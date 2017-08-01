// machine for a loader instance
enyo.machine = {
	sheet: function(inPath) {
		var type = "text/css";
		var rel = "stylesheet";
		var isLess = (inPath.slice(-5) == ".less");
		if (isLess) {
			if (window.less) {
				// If client-side less is loaded, insert the less stylesheet
				type = "text/less";
				rel = "stylesheet/less";
			} else {
				// Otherwise, we expect a css file of the same name to exist
				inPath = inPath.slice(0, inPath.length-4) + "css";
			}
		}
		var link;
		if (enyo.runtimeLoading || isLess) {
			link = document.createElement('link');
			link.href = inPath;
			link.media = "screen";
			link.rel = rel;
			link.type = type;
			document.getElementsByTagName('head')[0].appendChild(link);
		} else {
			/* jshint evil: true */
			document.write(
				'<link href="' + inPath + '" media="screen" rel="' +
				rel + '" type="' + type + '" />');
			/* jshint evil: false */
		}
		if (isLess && window.less) {
			window.less.sheets.push(link);
			if (!enyo.loader.finishCallbacks.lessRefresh) {
				enyo.loader.finishCallbacks.lessRefresh = function() {
					window.less.refresh(true);
				};
			}
		}
	},
	script: function(inSrc, onLoad, onError) {
		if (enyo.runtimeLoading) {
			var script = document.createElement('script');
			script.src = inSrc;
			script.onload = onLoad;
			script.onerror = onError;
			script.charset = "utf-8";
			document.getElementsByTagName('head')[0].appendChild(script);
		} else {
			/* jshint evil: true */
			document.write(
				'<scri' + 'pt src="' + inSrc + '"' +
				(onLoad ? ' onload="' + onLoad + '"' : '') +
				(onError ? ' onerror="' + onError + '"' : '') +
				'></scri' + 'pt>');
			/* jshint evil: false */
		}
	},
	inject: function(inCode) {
		/* jshint evil: true */
		document.write('<scri' + 'pt type="text/javascript">' + inCode + "</scri" + "pt>");
		/* jshint evil: false */
	}
};

// create a dependency processor using our script machine
enyo.loader = new enyo.loaderFactory(enyo.machine);

// dependency API uses enyo loader
enyo.depends = function() {
	var ldr = enyo.loader;
	if (!ldr.packageFolder) {
		var tag = enyo.locateScript("package.js");
		if (tag && tag.path) {
			ldr.aliasPackage(tag.path);
			ldr.packageFolder = tag.path + "/";
			//console.log("detected PACKAGEFOLDER [" + ldr.packageFolder + "]");
		}
	}
	ldr.load.apply(ldr, arguments);
};

// Runtime loader
(function() {
	var enyo = window.enyo;
	var runtimeLoadQueue = [];

	var domLoaded = false;
	enyo.ready(function() {
		domLoaded = true;
	});

	/**
		Used to load one or more script, stylesheet, or package.js files at runtime.

		* depends is string or array of string paths to package.js, script, or css to load
		* doneCallback is fired after file or package loading has completed

		If called during load time (before the DOMContentLoaded event), this can only be used
		to load a single script and stylesheet file.  Using it to load a package.js file or
		providing an array of files can disrupt normal package.js handling.
	*/
	enyo.load = function(depends, onLoadCallback) {
		if (domLoaded) {
			runtimeLoadQueue.push(arguments);
			if (!enyo.runtimeLoading) {
				enyo.runtimeLoading = true;
				runtimeLoad();
			}
		} else {
			if (enyo.isArray(depends)) {
				for (var i = 0; i < depends.length; ++i) {
					enyo.loader.require(depends[i]);
				}
			} else {
				enyo.loader.require(depends);
			}
		}
	};
	function runtimeLoad(onLoad) {
		if (onLoad) {
			onLoad(); // Run user callback function
		}
		if (runtimeLoadQueue.length) {
			var args = runtimeLoadQueue.shift();
			var depends = args[0];
			var dependsArg = enyo.isArray(depends) ? depends : [depends];
			var onLoadCallback = args[1];
			enyo.loader.finishCallbacks.runtimeLoader = function(inBlock) {
				// Once loader is done loading a package, we chain a call to runtimeLoad(),
				// which will call the onLoadCallback from the original load call, passing
				// a reference to the depends argument from the original call for tracking,
				// followed by kicking off any additionally queued load() calls
				runtimeLoad(function() {
					if (onLoadCallback) {
						onLoadCallback(inBlock);
					}
				});
			};
			enyo.loader.packageFolder = "./";
			// Kick off next queued call to loader
			enyo.depends.apply(this, dependsArg);
		} else {
			enyo.runtimeLoading = false;
			enyo.loader.packageFolder = "";
		}
	}
})();

// predefined path aliases
enyo.path.addPaths({
	enyo: enyo.args.root,
	lib: "$enyo/../lib"
});