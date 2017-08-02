var port = null;

window.addEventListener("message", function(event) {
	
	if (event.source != window)
		return;
	
	if(port == null) {
		
		port = chrome.runtime.connect(event.data.extensionId, {name: "desktopShare"});
		
		port.onMessage.addListener(function(extResponse) {
		
		
			if(extResponse.action == "deltaImage") {
				
				document.dispatchEvent(new CustomEvent('onDeltaImage', {detail: {
					image: extResponse.imageContent,
					deltas: extResponse.deltas,
					isAppResized: extResponse.isAppResized
				}}));
				
				
			} else if(extResponse.action == "baseImage") {
				
				console.log('shareext :: Content script listener called back by Background script (getBaseImage) :: ');
				document.dispatchEvent(new CustomEvent('onBaseImage', {detail: {
					
					image: extResponse.imageContent,
					w: extResponse.w,
					h: extResponse.h
				}}));
				
			} else if(extResponse.action == "initialize") {
				
				console.log('shareext :: Content script listener called back by Background script for initialize :: ' + extResponse.status);
				
				document.dispatchEvent(new CustomEvent('extensionInitialized', {detail: {
					extInitialize: extResponse.status
				}}));
				
			} else if(extResponse.action == "start") {
				
				if(extResponse.status == "success") {
					console.log('shareext :: Content script listener called back by Background script for start :: ' + extResponse.status);
					document.dispatchEvent(new CustomEvent('shareStart', {detail: {
						
					}}));
					
				} else if(extResponse.status == "error") {
					
					if(extResponse.reason == "onended") {
						console.log('shareext :: Content script listener called back by Background script for error :: ' + extResponse.reason);
						document.dispatchEvent(new CustomEvent('shareOnend', {detail: {
							
						}}));
						
					} else {
						console.log('shareext :: Content script listener called back by Background script for failed :: ' + extResponse.reason);
						document.dispatchEvent(new CustomEvent('shareFailed', {detail: {
							
						}}));
						
					}
					
				}
				
			} else if(extResponse.action == "extensionInstall") {
				
				console.log('shareext :: Content script listener called back by Background script for installation check :: ' + extResponse.status);
				document.dispatchEvent(new CustomEvent('onCGCFrame', {detail: {
					response : true
				}}));
				
			}
			
			});
	
	}
	
	port.postMessage({requestFrom: event.data.requestFrom, requestReason: event.data.requestReason, imageDataFormat: event.data.imageDataFormat, desktopShare: event.data.screenImage, imageType: event.data.imageType});
	
	if(event.data.requestFrom == "endShare") {
		port.disconnect();
		port = null;
		
	}  
	
}, false);



