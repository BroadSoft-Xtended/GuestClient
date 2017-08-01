<!doctype html>
<html>
<head>
<script src="jquery-1.6.4.js" charset="utf-8"></script>
	<script type="text/javascript">

		var shareExtensionId = "";
		
		var onExtensionInitialized = function (event) {
				  window.parent.postMessage({ responseFrom: "cgcframe", response: "extensionInitialized", responseStatus: event.detail.extInitialize}, "*");
				    
				}
				
		var onShareStarted = function (event) {
				  window.parent.postMessage({ responseFrom: "cgcframe", response: "shareStarted"}, "*");
				    
				}
				
		var onShareOnend = function (event) {
				  window.parent.postMessage({ responseFrom: "cgcframe", response: "shareOnend"}, "*");
				    
				}
				
		var onShareFailed = function (event) {
				  window.parent.postMessage({ responseFrom: "cgcframe", response: "shareFailed"}, "*");
				  
				}
		
		var onBaseImage = function (event) {
			  	window.parent.postMessage({ responseFrom: "cgcframe", response: "baseImage", image : event.detail.image, w : event.detail.w, h : event.detail.h}, "*");
					    
				}
				
		var onDeltaImage = function (event) {
			  	window.parent.postMessage({ responseFrom: "cgcframe", response: "deltaImage", image : event.detail.image, deltas : event.detail.deltas, isAppResized : event.detail.isAppResized}, "*");
			  	
			  }
			  
		var frameMessageListener = function (event) {
			if(event.data.requestFrom == "collaborate" ) {
			
				var requestReason = event.data.requestReason;
				 if(requestReason == "getDeltaImage") {
					window.postMessage({ requestFrom: "cgcframe", extensionId : shareExtensionId, requestReason: requestReason}, "*");
				
				} else if(requestReason == "getBaseImage") {
					window.postMessage({ requestFrom: "cgcframe", extensionId : shareExtensionId, requestReason: requestReason}, "*");
				
				} else if(requestReason == "isExtensionInitialized") {
					window.postMessage({ requestFrom: "cgcframe", extensionId : shareExtensionId, requestReason: requestReason, imageDataFormat : event.data.imageDataFormat}, "*");
				
				} else if(requestReason == "extensionStart") {
					window.postMessage({ requestFrom: "cgcframe", extensionId : shareExtensionId, requestReason: requestReason}, "*");
				
				} else if(requestReason == "endShare") {
					window.postMessage({ requestFrom: "cgcframe", extensionId : shareExtensionId, requestReason: requestReason}, "*");
				
				} else if(requestReason == "isExtensionInstalled") {
				
					console.log("cgcframe: isExtensionInstalled :: "+event.data.extensionId);
					var self = this;
					
           $.get("chrome-extension://"+event.data.extensionId+"/content_script.js")
                .done(
                function(script, textStatus) {
        						console.log("cgcframe: Extension is present ");
        						shareExtensionId = event.data.extensionId;
        						window.parent.postMessage({ responseFrom: "cgcframe", response: "extensionInstalled"}, "*");
                } )
                .fail(
                function(jqxhr, settings, exception) {
                    console.log('cgcframe: Extension is not present');
        						window.parent.postMessage({ responseFrom: "cgcframe", response: "extensionNotInstalled"}, "*");
                });
                
				} 
			
			}
			
		}
		
		window.onload = function() {
		
			console.log("cgcframe: onload");
			document.addEventListener('extensionInitialized', onExtensionInitialized);
		  document.addEventListener('shareStart', onShareStarted);
		  	
			document.addEventListener('shareOnend', onShareOnend);
			 	
			document.addEventListener('shareFailed', onShareFailed);
			  	
			document.addEventListener('onBaseImage', onBaseImage);
			  	
		  document.addEventListener('onDeltaImage', onDeltaImage);
		  				
			window.addEventListener('message', frameMessageListener);
			window.parent.postMessage({ responseFrom: "cgcframe", response: "frameReady"}, "*");
			
		}
		
		
	</script>
</head>

<body>
</body>
</html>
