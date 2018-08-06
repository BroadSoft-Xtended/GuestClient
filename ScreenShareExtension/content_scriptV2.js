
var extensionPort = null;
var CONTENT_SCRIPT = "ContentScript";

//alert(window.location.href);

window.addEventListener("message", function(event) {
	
	//BACKWARD COMPATIBILITY SUPPORT
	if(event.data.requestFrom == "cgcframe" || event.data.responseFrom == "cgcframe"){
		//support to Guest Client Version 4.0.2 and before
		backwardCompatibilitySupport();
		
		
	}
	//Skip own messages and handle messages from GuestClient and USSCliet.
	else if(event.data.requestFrom != "ContentScript" && event.data.responseFrom != "ContentScript"){
		
		// We only accept messages from ourselves
		if (event.source != window || event.origin !== window.location.origin){
			return;
		}
		//effective Guest Client Version  4.0.3

		if(extensionPort == null && event.data.requestFrom == "GuestClient" && event.data.requestReason == "initiateScreenShareExtension"){
			initiateConnectionToExtension();
			
			if(extensionPort == null){
				window.postMessage({ responseFrom :"ContentScript", response :"extensionConnectionProblem"}, window.location.origin);
			}else{
				extensionPort.postMessage({requestFrom: event.data.requestFrom, 
						requestReason: event.data.requestReason});
			}
			
		}else if(extensionPort != null){
			
			
				extensionPort.postMessage({requestFrom: event.data.requestFrom, 
						requestReason: event.data.requestReason, 
						imageDataFormat: event.data.imageDataFormat, 
						desktopShare: event.data.screenImage, 
						imageType: event.data.imageType});
		
				if(event.data.requestReason == "endShare") {
					
					try{
						extensionPort.disconnect();
						extensionPort = null;
					}catch(e){
						extensionPort = null;
					}
					
				}  
				
		
		}else{
			if(event.data.requestFrom == "GuestClient" || event.data.requestFrom == "USS-Client"){
				//console.info(CONTENT_SCRIPT + ":: Communication Port to Screen Share not established! Could not deliver message %o", event);
			}
		}
	}

  }, false);



function initiateConnectionToExtension(){
	
	if(extensionPort == null) {
		
		try{
			extensionPort = chrome.runtime.connect(event.data.extensionId, {name: "ScreenShareExtension"});
			
			extensionPort.onDisconnect.addListener(function(event){
				window.postMessage({ responseFrom: CONTENT_SCRIPT, 
									response: "shareOnend"}, 
									window.location.origin);
				
				extensionPort=null;
			});
			
			extensionPort.onMessage.addListener(function(extResponse) {
			
			
			
				if(extResponse.action == "portReady" && extResponse.status == "success") {
					console.info(CONTENT_SCRIPT + ":: ScreenSharextensioPort ready to receive message");
					
					window.postMessage({ responseFrom :CONTENT_SCRIPT, 
							response :"extensionConnected"}, 
							window.location.origin);
					
				}else if(extResponse.action == "deltaImage") {
					
					window.postMessage({ responseFrom: CONTENT_SCRIPT, 
							response: "deltaImage", 
							image : extResponse.imageContent, 
							deltas : extResponse.deltas, 
							isAppResized : extResponse.isAppResized},
							window.location.origin);

					
					
				} else if(extResponse.action == "baseImage") {
					
					console.debug(CONTENT_SCRIPT + ':: Base image received from ScreenShareExtension');
					
					window.postMessage({ responseFrom: CONTENT_SCRIPT,
							response: "baseImage", 
							image : extResponse.imageContent, 
							w : extResponse.w, 
							h : extResponse.h}, 
							window.location.origin);
					
					
					
				} else if(extResponse.action == "initialize") {
					
					console.info(CONTENT_SCRIPT + ':: Background script is initialized :: ' + extResponse.status);
					
					window.postMessage({ responseFrom: CONTENT_SCRIPT, 
							response: "extensionInitialized", 
							responseStatus: extResponse.status}, 
							window.location.origin);
					
					
					
					
				} else if(extResponse.action == "start") {
					
					if(extResponse.status == "success") {
						console.info(CONTENT_SCRIPT + ':: Share started by ScreenShareExtension :: ' + extResponse.status);
						
						window.postMessage({ responseFrom: CONTENT_SCRIPT, 
								response: "shareStarted"}, 
								window.location.origin);
						
						
						
					} 
					
				} else if(extResponse.action == "stop") {
						
						if(extResponse.reason == "onVideoStreamStopped") {
							console.info(CONTENT_SCRIPT + ':: Share ended by ScreenShareExtension :: ' + extResponse.reason);
							
							window.postMessage({ responseFrom: CONTENT_SCRIPT, 
									response: "shareOnend"}, 
									window.location.origin);
							
						} else {
							console.error(CONTENT_SCRIPT + ':: Share failed by ScreenShareExtension :: ' + extResponse.reason);
							
							window.postMessage({ responseFrom: CONTENT_SCRIPT, 
									response: "shareFailed"}, 
									window.location.origin);
							
						}
						
				}
				
			});
		}catch(e){
			console.error(CONTENT_SCRIPT + ": Error connecting Screen Share extension" + e.message);
		}
	
	}
	

}


/////////////////////////  BACKWARD COMPATIBILITY SUPPORT     //////////////////////////////////////
var port;
function backwardCompatibilitySupport(){
	
	// We only accept messages from ourselves
	if ( event.origin !== window.location.origin){
		return;
	}
	
	if(event.data.responseFrom == "cgcframe"){
		return;
		
		
	}
	
	if(port == null && event.data.requestFrom == "cgcframe" && event.data.requestReason == "isExtensionInitialized") {
		try{
			port = chrome.runtime.connect(event.data.extensionId, {name: "ScreenShareExtension"});
			
			port.onDisconnect.addListener(function(event){
					document.dispatchEvent(new CustomEvent('shareOnend', {detail: {}}));
					
					port=null;
			});
			
			port.onMessage.addListener(function(extResponse) {
			
			
				if(extResponse.action == "deltaImage") {
					
					document.dispatchEvent(new CustomEvent('onDeltaImage', {detail: {
						image: extResponse.imageContent,
						deltas: extResponse.deltas,
						isAppResized: extResponse.isAppResized
					}}));
					
					
				} else if(extResponse.action == "baseImage") {
					
					console.debug(CONTENT_SCRIPT + ':: Base image received from ScreenShareExtension');
					document.dispatchEvent(new CustomEvent('onBaseImage', {detail: {
						
						image: extResponse.imageContent,
						w: extResponse.w,
						h: extResponse.h
					}}));
					
				} else if(extResponse.action == "initialize") {
					
					console.info(CONTENT_SCRIPT + ':: Background script is initialized :: ' + extResponse.status);
					
					document.dispatchEvent(new CustomEvent('extensionInitialized', {detail: {
						extInitialize: extResponse.status
					}}));
					
				} else if(extResponse.action == "start") {
					
					if(extResponse.status == "success") {
						console.info(CONTENT_SCRIPT + ':: Share started by ScreenShareExtension :: ' + extResponse.status);
						document.dispatchEvent(new CustomEvent('shareStart', {detail: {	}}));
						
					} 
					
				} else if(extResponse.action == "stop") {
						
						if(extResponse.reason == "onVideoStreamStopped") {
							console.info(CONTENT_SCRIPT + ':: Share ended by ScreenShareExtension :: ' + extResponse.reason);
							document.dispatchEvent(new CustomEvent('shareOnend', {detail: {}}));
							
						} else {
							console.error(CONTENT_SCRIPT + ':: Share failed by ScreenShareExtension :: ' + extResponse.reason);
							document.dispatchEvent(new CustomEvent('shareFailed', {detail: {}}));
							
						}
						
				}else if(extResponse.action == "extensionInstall") {
					
					console.info('shareext :: Content script listener called back by Background script for installation check :: ' + extResponse.status);
					document.dispatchEvent(new CustomEvent('onCGCFrame', {detail: {
						response : true
					}}));
					
				}
			
			});
		}catch(e){
			console.error(CONTENT_SCRIPT + ": Error connecting Screen Share extension" + e.message);
		}
	
	}
	
	if(port != null) {
		port.postMessage({requestFrom: "USS-Client", 
				requestReason: event.data.requestReason, 
				imageDataFormat: event.data.imageDataFormat, 
				desktopShare: event.data.screenImage, 
				imageType: event.data.imageType});
		
		if(event.data.requestFrom == "endShare") {
			try{
				port.disconnect();
				port = null;
			}catch(e){
				port = null;
			}
			
		}
	}else{
			if(event.data.requestFrom == "cgcframe"){
				//console.info(CONTENT_SCRIPT + ":: Communication Port to Screen Share not established! Could not deliver message %o", event);
			}
	}
	
}









