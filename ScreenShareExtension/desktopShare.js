var timeoutId = null;
var width = 0;
var height = 0;
var originalContext = null;
var updatedContext = null;
var deltaContext = null;
var video = null;
var originalCanvas = null;
var updatedCanvas = null;
var deltaCanvas = null;
var localstream = null;
var imageQuality = 0.75;
var gridSize = 128;
var imageFormat = 'image/jpeg';
var desktopMediaRequestId = 0;
var extStatus = "noninit";


chrome.runtime.onConnect.addListener(function(port) {
	
	port.onMessage.addListener(function(msg) {
	
		if(msg.requestFrom == "cgcframe") {
			
			if(msg.requestReason == "getDeltaImage") {
				console.log("==>Request for delta image");
				getImageData("deltaImage", port);
				
			} else if(msg.requestReason == "getBaseImage") {
                console.log("==>Request for Base image");
				getImageData("baseImage", port);
				
			}if(msg.requestReason == "extensionStart") {
				startDesktopShare(port);
			
			} else if(msg.requestReason == "endShare") {
				stop();
			
			}else if(msg.requestReason == "isExtensionInitialized") {
				initializeExtension(msg, port);
			
			} else if(msg.requestReason == "isExtensionInstalled") {
				
				port.postMessage({action : "extensionInstall", status : "success"});
			}
			
		}
		
	});
	
});

function guid() {
	return '{xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx}'.replace(/[xy]/g,
			function(c) {
				var r = Math.random() * 16 | 0, v = c === 'x' ? r
						: (r & 0x3 | 0x8);
				return v.toString(16);
			});
}

function initializeExtension(msg, port) {
	
	if(extStatus == "noninit") {
		video = document.createElement('video');
		video.id = video;
		video.autoplay = true;
				
		video.onloadedmetadata = function() {
			
				width = this.videoWidth;
				height = this.videoHeight;

				if (width > height) {
					gridSize = width / 4;
				} else {
					gridSize = height / 4;
				}
				
				originalCanvas = document.createElement('canvas');
				originalCanvas.id = originalCanvas;
				originalCanvas.width = width;
				originalCanvas.height = height;
				document.body.appendChild(originalCanvas);
				originalContext = originalCanvas.getContext('2d');
				
				updatedCanvas = document.createElement('canvas');
				updatedCanvas.id = updatedCanvas;
				updatedCanvas.width = width;
				updatedCanvas.height = height;
				document.body.appendChild(updatedCanvas);
				updatedContext = updatedCanvas.getContext('2d');
				
				deltaCanvas  = document.createElement('canvas');
				deltaCanvas.id = deltaCanvas
				deltaCanvas.width = width;
				deltaCanvas.height = height;
				document.body.appendChild(deltaCanvas);
				deltaContext = deltaCanvas.getContext('2d');
				
		};
	}
	
	imageFormat = msg.imageDataFormat;
	extStatus = "init";
	port.postMessage({action : "initialize", status : "success"});
	
	console.log('shareext:startDesktopShare::initializeExtension::Extension initialized');
}

function startDesktopShare(port) {
	console.log('shareext:startDesktopShare::extStatus::' + extStatus);
	if(extStatus == "init") {
		desktopMediaRequestId = chrome.desktopCapture.chooseDesktopMedia([ 'screen', 'window' ], function(
				id) {
			
			if (id) {
				navigator.webkitGetUserMedia({
					audio : false,
					video : {
						mandatory : {
							chromeMediaSource : 'desktop',
							chromeMediaSourceId : id,
							maxWidth : 1280,
							maxHeight : 720
						}
					}
				}, function(stream) {
					video.src = URL.createObjectURL(stream);
					localstream = stream;
					stream.getVideoTracks()[0].onended = function() {
						console.log('stream onended.');
						stop();
						port.postMessage({action : "start", status : "error", reason : "onended"});
					};
					
					setTimeout(function() {
						console.log('start share success');
						extStatus = "started";
						port.postMessage({action : "start", status : "success"});
					}, 3000);
					
				}, function() {
					console.log('getUserMedia() failed.');
					stop();
					port.postMessage({action : "start", status : "error", reason : "usermediafail"});
				});
			} else {
				console.log('Desktop capture cancelled (or) failed.');
				stop();
				port.postMessage({action : "start", status : "error", reason : "capturestopped"});
			}
		});
	
	}
}

function resizeVideo(videoWidth, videoHeight) {
	
	width = videoWidth;
	height = videoHeight;
	if ( width > height ) {
		gridSize = width / 4;
	} else {
		gridSize = height / 4;
	}
	originalCanvas.width = width;
	originalCanvas.height = height;
	/*originalContext = originalCanvas.getContext( '2d' );*/

	updatedCanvas.width = width;
	updatedCanvas.height = height;
	/*updatedContext = updatedCanvas.getContext( '2d' );*/

	deltaCanvas.width = width;
	deltaCanvas.height = height;
	/*deltaContext = deltaCanvas.getContext( '2d' );*/
	
}


function getImageData(imageType, port) {
	var time = new Date();

	
	setTimeout(function() { 
		
		if(imageType == "baseImage") {
		
			try {
				var imageData = getBaseImage();
				var finishTime = new Date();
				console.log(finishTime.toLocaleTimeString() + ":: send Base Image (data length: "+imageData.imageData.length +"), Time taken " + (finishTime.getTime() - time.getTime()));
				port.postMessage({action : "baseImage", imageContent : imageData.imageData, w : imageData.w, h : imageData.h});
				
			} catch (err) {
				console.log(err.message + " :: " + err.stack);
			}
		} else if (imageType == "deltaImage") {
			
			try {
				var imageData = getDelta();
				if(imageData != null) {
					var finishTime = new Date();
					if(imageData.deltas.length>0){
					console.log(finishTime.toLocaleTimeString() + ":: send Delta Image (data length: "+imageData.deltas.length +"), Time taken " + (finishTime.getTime() - time.getTime()));
					}
					port.postMessage({action : "deltaImage", imageContent : imageData.imageData, deltas : imageData.deltas, isAppResized : imageData.isAppResized});
				}
				
			} catch (err) {
				console.log(err.message + " :: " + err.stack);
			}
			
		}

		
	}, 400);
	
}

function getBaseImage() {
	
	if (originalContext != null && updatedContext != null) {
		
		if(width != video.videoWidth || height != video.videoHeight){
			resizeVideo(video.videoWidth, video.videoHeight);
						
		}
		
		var baseImageData = {};
		originalContext.drawImage(video, 0, 0);
		
		var imageData = originalCanvas
				.toDataURL(imageFormat, this.imageQuality);
				
		baseImageData.imageData = imageData;
		baseImageData.w = width;
		baseImageData.h = height;
		return baseImageData;
	}
	
}

function getDelta() {
	if (originalContext != null && updatedContext != null) {
		
		var deltaContent = {
			imageData: null,
			deltas: [],
			isAppResized: false
		};
		
		if(width != video.videoWidth || height != video.videoHeight){
			deltaContent.isAppResized = true;
			return deltaContent;
			
		}
		

		// draw video on updated
		updatedContext.drawImage(video, 0, 0);

		var result = {
			width : 0,
			height : 0,
			deltas : []
		};
		
		getDeltaImages(originalContext, updatedContext, 0, 0, width, height,
                result);
        
        if (result.deltas.length > 0) {
            deltaCanvas.width = result.width;
            deltaCanvas.height = result.height;
            var left = 0;
            for ( var i = 0; i < result.deltas.length; i++) {
                deltaContext.putImageData(updatedContext.getImageData(
                        result.deltas[i].l, result.deltas[i].t,
                        result.deltas[i].w, result.deltas[i].h), left, 0);
                left += result.deltas[i].w;
            }
            var deltaImage = deltaCanvas.toDataURL(imageFormat,
                    this.imageQuality);
                    
            deltaContent.imageData = deltaImage;
            deltaContent.deltas = result.deltas

            // move updated to original
            originalContext.putImageData(updatedContext.getImageData(0, 0, width,	height), 0, 0);

            
        }
        
		return deltaContent;
	}
}

//keep this funciton for future debug purposes.
function compareCanvases(){

    var imageData = originalContext.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    var pixels = imageData.data;

    var imageData2 = updatedContext.getImageData(0, 0, updatedCanvas.width, updatedCanvas.height);
    var pixels2 = imageData2.data;
    var count =0;var mismatchCount =0;
    //console.log(pixels.length + "<> " + pixels2.length);
    for(var i = 0, il = pixels.length; i < il; i++) {
        if(pixels[i] == pixels2[i]){
            count++;
        }else{
           mismatchCount++;
        }
    }
    if(count === pixels.length && count === pixels2.length){
        //console.log("Both the canvases are matching");
        return false;
    }else{
        console.log("!Both the canvases are not matching " + mismatchCount);
        return true;
    }
}




/**
 * Recursively divide image in four tiles until width or height is <= 128
 * pixels. Then check if the updated region (tile) is different than the
 * original. If so, then calculate the smallest region containing the
 * difference.
 * 
 * @param originalContext -
 *            the original canvas context
 * @param updatedContext -
 *            the updated canvas context
 * @param left -
 *            left co-ordinate of region to inspect
 * @param top -
 *            top co-ordinate of region to inspect
 * @param right -
 *            right co-ordinate of region to inspect
 * @param bottom -
 *            bottom co-ordinate of region to inspect
 * @param result -
 *            regions that are different are stored here. { w: the overall width
 *            of the delta image, h: the overall height of the delta image,
 *            deltas: [array of {l:left, t:top, w:width, h:height}]}
 */
function getDeltaImages(originalContext, updatedContext, left, top, right,
		bottom, result) {
	var width = right - left + 1;
	var height = bottom - top + 1;
	if (width <= gridSize || height <= gridSize) {
		// stop and process
		originalImageData = originalContext.getImageData(left, top, width,
				height);
		updatedImageData = updatedContext
				.getImageData(left, top, width, height);
		var length = originalImageData.data.length / 4;
		var isDelta = false;
		// reverse left, top, right, bottom so we can find smallest region
		// that's different
		var l = right;
		var t = bottom;
		var r = left;
		var b = top;
		
		var dr = null;
		var dg = null;
		var db = null;
		var da = null;
		
		var x =-1;
		var y =-1
		for ( var i = 0; i < length; i++) {
			// RGBA difference
			dr = originalImageData.data[i * 4 + 0]
					- updatedImageData.data[i * 4 + 0];
			dg = originalImageData.data[i * 4 + 1]
					- updatedImageData.data[i * 4 + 1];
			db = originalImageData.data[i * 4 + 2]
					- updatedImageData.data[i * 4 + 2];
			da = originalImageData.data[i * 4 + 3]
					- updatedImageData.data[i * 4 + 3];
			if (dr | dg | db | da) {
				isDelta = true;
				x = left + (i % width);
				y = top + Math.floor(i / width);
				// this pixel (x, y) is different, store it's co-ordinates if
				// it's the left-most, top-most, right-most, bottom-most
				if (x < l) {
					l = x;
				}
				if (x > r) {
					r = x;
				}
				if (y < t) {
					t = y;
				}
				if (y > b) {
					b = y;
				}
			}
		}
		
		if (isDelta) {
			var delta = {
				l : l,
				t : t,
				w : r - l + 1,
				h : b - t + 1
			};
			result.deltas.push(delta);
			// the overall delta image is a collage of differences laid out left
			// to right, so it gets wider as we keep adding tiles. the height
			// remains fixed to the tallest difference.
			result.width += delta.w;
			if (delta.h > result.height) {
				result.height = delta.h;
			}
		}
	} else {
		// divide in 4 and recurse
		width = Math.floor(width / 2);
		height = Math.floor(height / 2);
		getDeltaImages(originalContext, updatedContext, left, top, left + width
				- 1, top + height - 1, result);
		getDeltaImages(originalContext, updatedContext, left + width, top,
				right, top + height - 1, result);
		getDeltaImages(originalContext, updatedContext, left, top + height,
				left + width - 1, bottom, result);
		getDeltaImages(originalContext, updatedContext, left + width, top
				+ height, right, bottom, result);
	}
}


function stop() {
	
	clearTimeout(timeoutId);
	timeoutId = null;
	width = 0;
	height = 0;
	originalContext = null;
	updatedContext = null;
	deltaContext = null;
	if (localstream != null && localstream.active) {
		localstream.getTracks()[0].stop();
		localstream = null;
	}
	
	chrome.desktopCapture.cancelChooseDesktopMedia(desktopMediaRequestId);
	if ( video ) {
		video.pause();
		video.src = '';
		video = null;
	}
	
	if ( originalCanvas ) {
		originalCanvas.parentNode.removeChild( originalCanvas );
	}
	if ( updatedCanvas ) {
		updatedCanvas.parentNode.removeChild( updatedCanvas );
	}
	if ( deltaCanvas ) {
		deltaCanvas.parentNode.removeChild( deltaCanvas );
	}
	originalCanvas = null;
	updatedCanvas = null;
	deltaCanvas = null;
	extStatus = "noninit";
	
}