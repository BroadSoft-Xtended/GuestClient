/*
 * Copyright 2014, BroadSoft, Inc.
 * 
 * USS API Client Library
 * 
 * @author ptalekar@broadsoft.com
 * @modified kdey@broadsoft.com
 */
( function ( window ) {
	var USSClass = function ( config ) {
		if(this.destroyed) return;
		this.logLevel = 0;
		this.ussUrl = config.ussUrl; // 'wss://10.99.5.120:8443/uss';
		this.jid = config.jid;
		this.bwu = config.bwu;
		this.bwp = config.bwp;
		this.bcu = config.bcu;
		this.bcp = config.bcp;
		this.name = config.name;
		this.ownerid = null;
		this.capacity = config.capacity;
		this.viewScreenShareCanvasId = config.viewScreenShareCanvasId;
		this.role = ( config.roomID ) ? USSClass.prototype.ROLE.PARTICIPANT : USSClass.prototype.ROLE.FLOOR_HOLDER;
		this.isOwner = ( config.roomID ) ? false : true;

		this.roomID = config.roomID;
		this.createRoomOnlyAction = config.createRoomOnlyAction;
		// var username = 'bkamaraj@chndev.com';
		// var bwp = '111111';
		// var bcu = 'bkamaraj@migums1.chn.broadsoft.com';
		// var bcp = '11111111';

		this.uss = null;
		this.shareId = null;
		this.elementPrefixId = null;
		this.revision = 0;
		this.timeoutId = null;
		this.width = 0;
		this.height = 0;
		this.originalContext = null;
		this.updatedContext = null;
		this.deltaContext = null;
		this.video = null;
		this.originalCanvas = null;
		this.updatedCanvas = null;
		this.deltaCanvas = null;

		this.FREQUENCY = 500;
		this.BASE_IMAGE_FREQUENCY = 120;
		this.iteration = this.BASE_IMAGE_FREQUENCY;
		this.localstream = null;
        this.reconnectCount = -1;
		this.imageQuality = 0.75;
		this.gridSize = 128;
		this.imageFormat = 'image/jpeg';
		this.clientImageCaps = ['webp','jpg','png'];
		
		this.ussWorker = null;
		this.lastFloorHolderRequestId = null;
		this.isPaused = false;
		this.sessionToken = null;
		this.isGraceFullyShareEnded = false;
        this.currentSharer = null;
        this.floorHolder = null;
        
        this.destroyed = false;
		// callbacks
		this.onStarted = function ( self ) {};
		this.onBaseImage = function ( imageFormat, imageData, dimension ) {	};
		this.onImageDeltas = function ( imageFormat, imageDeltas, imageData ) {};
		this.onCursorImage = function ( imageformat, imageData, posX, posY ) {};
		this.onDisconnect = function ( refThis ) {};
		this.onShareStartStop = function ( refThis, isShareStarted, src, lastSharer, floorHolder ) {};
		this.onStartError = function ( refThis, errorCode ) {};
		
		this.useDesktopShareExtension = isChrome();
		 //used with chrome extension  
		 
		this.setDesktopShareExtensionListener = function(){
			
			var self = this;
		  	//console.log("USS:iFrame listeners to be added");
		  	window.addEventListener('message', function (event) {
		  		if(self.destroyed){
		  			return;
		  		}
		  		console.log("USS :: screenshare response :: " + event.data.response);
				    
			    if(event.data.responseFrom == "cgcframe") {
			    	
			    	
			    	 if(self.isFloorHolder() && event.data.response == "deltaImage") {
			    		var deltas = event.data.deltas;
				  		var imageData = event.data.image;
				  		var isAppResized = event.data.isAppResized;
				  		
				  		if(isAppResized) {
				  			self.iteration = self.BASE_IMAGE_FREQUENCY; // Reset it to Base image to start with resized images. 
				  			self.sendUpdate(); // Call sendUpdate() to start the next iteration in calling the extension to get latest image
				  			return;
				  		}
				  
				  		if( imageData) {
					  		self.postUSSMessage('shareDelta', {
					  	          src : self.jid,
					  	          share : self.shareId,
					  	          rev : ++self.revision,
					  	          deltas : deltas
					  	        });
					  		self.postUSSMessage('shareImage', {
					  	          src : self.jid,
					  	          share : self.shareId,
					  	          imageData : imageData,
					  	          rev : self.revision,
					  	          hasDelta : true
					  	        });
				  		}
				  		
				  		self.sendUpdate(); // Call sendUpdate() to start the next iteration in calling the extension to get latest image
					    
			    	} else if(self.isFloorHolder() && event.data.response == "baseImage") {
			    		
			    		var w = event.data.w;
			  		    var h = event.data.h;
			  	        var imageData = event.data.image;
			  	        
				  	    self.postUSSMessage('shareBase', {
				  	        src : self.jid,
				  	        share : self.shareId,
				  	        rev : ++self.revision,
				  	        hasDelta : false,
				  	        screenRect : {
				  	          l : 0,
				  	          t : 0,
				  	          w : w,
				  	          h : h
				  	        }
				  	      });
				  	      
				  	  self.postUSSMessage('shareImage', {
				  	        src : self.jid,
				  	        share : self.shareId,
				  	        imageData : imageData,
				  	        rev : self.revision,
				  	        hasDelta : false
				  	      });
				  	      
				  	  self.sendUpdate(); // Call sendUpdate() to start the next iteration in calling the extension to get latest image
				  	    
			    	} else if(event.data.response == "shareStarted") {
			    		console.log("USS:Start Share:: " + event.data.response);
					    self._startShare();
					    
			    	} else if(event.data.response == "shareOnend") {
			    		console.log("USS:ShareOnended:: " + event.data.response);
			    		self.stopShare();
					    
					  	document.getElementById("cgcframe").contentWindow.postMessage({ requestFrom: "collaborate", requestReason : "endShare"}, "*");
					    
			    	} else if(event.data.response == "shareFailed") {
			    		console.log("USS:DesktopSharefailed:: " + event.data.response);
					    self.stop();
					    
					    document.getElementById("cgcframe").contentWindow.postMessage({ requestFrom: "collaborate", requestReason : "endShare"}, "*");
					    
			    	} else if(event.data.response == "extensionInitialized" && event.data.responseStatus == "success") {
			    		console.log("USS:extensionInitialized:: " + event.data.response);
			    		document.getElementById("cgcframe").contentWindow.postMessage({ requestFrom: "collaborate", requestReason : "extensionStart"}, "*");
			    	}
			    	
			    }
		  		
		  	});
			  	
		};
		if(this.useDesktopShareExtension) {
			this.setDesktopShareExtensionListener();  		
		}

        this._onRoleChanged = function ( changeToFloorHolder ) {
			var self = this;
			if ( changeToFloorHolder == this.isFloorHolder() ) {
				//already in that state. duplicate state change message.
				//no need to process further.
				return;
			}
			if ( changeToFloorHolder == true ) {

				this.role = USSClass.prototype.ROLE.FLOOR_HOLDER;
                if ( this.isAParticipant()  || ( this.isAOwner() && this.lastFloorHolderRequestId == this.jid)){
                    
                    this.start();
                }
			} else {
                clearTimeout( this.timeoutId );
                this.stopShare();
				this.role = USSClass.prototype.ROLE.PARTICIPANT;

			}
		};
		
		this._init = function () {

			var self = this;

			if ( this.isFloorHolder() ) {
				this.shareId = this.guid();
				var ussContainer = document.getElementById( 'uss' );
				this.video = document.createElement( "video" );
				this.video.id = 'video_' + this.shareId;
				this.video.style.display = 'none';
				this.video.autoplay = true;
				ussContainer.appendChild( this.video );

				this.originalCanvas = document.createElement( "canvas" );
				this.originalCanvas.style.display = 'none';
				this.originalCanvas.id = 'originalCanvas_' + this.shareId;
				ussContainer.appendChild( this.originalCanvas );

				this.updatedCanvas = document.createElement( "canvas" );
				this.updatedCanvas.style.display = 'none';
				this.updatedCanvas.id = 'updatedCanvas_' + this.shareId;

				ussContainer.appendChild( this.updatedCanvas );

				this.deltaCanvas = document.createElement( "canvas" );
				this.deltaCanvas.style.display = 'none';
				this.deltaCanvas.id = 'deltaCanvas_' + this.shareId;
				ussContainer.appendChild( this.deltaCanvas );

				this.video.onloadedmetadata = function () {
					self.width = this.videoWidth;
					self.height = this.videoHeight;
					if ( self.width > self.height ) {
						self.gridSize = self.width / 4;
					} else {
						self.gridSize = self.height / 4;
					}
					self.originalCanvas.width = self.width;
					self.originalCanvas.height = self.height;
					self.originalContext = self.originalCanvas.getContext( '2d' );

					self.updatedCanvas.width = self.width;
					self.updatedCanvas.height = self.height;
					self.updatedContext = self.updatedCanvas.getContext( '2d' );

					self.deltaCanvas.width = self.width;
					self.deltaCanvas.height = self.height;
					self.deltaContext = self.deltaCanvas.getContext( '2d' );
				};

			}

		};

		

	};
	
	USSClass.prototype.setOwnerId= function(uid){
		this.ownerid = uid;
		if(this.jid != this.ownerid){
			this.isOwner = false;
		}
	};
	
	USSClass.prototype.getOwnerId= function(uid){
		return this.ownerid;
	};

	USSClass.prototype.guid = function () {
		return '{xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx}'.replace( /[xy]/g, function ( c ) {
			var r = Math.random() * 16 | 0, v = c === 'x' ? r : ( r & 0x3 | 0x8 );
			return v.toString( 16 );
		} );
	};

	USSClass.prototype.start = function () {
		if(this.destroyed || this.shareId){
            //This instance is destroyed or already in sharing mode. so nothing to do. 
            //In case, it is destroyed, the instance should be thrown away.
            return;
        }  
		this.isPaused = false;
		if ( this.isFloorHolder() && this.createRoomOnlyAction != true ) {
			
			//for chrome extension
			if(this.useDesktopShareExtension == true){
				this.shareId = this.guid();
				var desktopShareFrame = document.getElementById("cgcframe");
				if(desktopShareFrame != null) {
					desktopShareFrame.contentWindow.postMessage({ requestFrom: "collaborate", requestReason : "isExtensionInitialized", imageDataFormat : this.imageFormat}, "*");
				}
		    	return;
		    }
			
			
            this._init();
			var self = this;
			chrome.desktopCapture.chooseDesktopMedia( [
					'screen', 'window'
			], function ( id ) {
				if ( id ) {
					navigator.webkitGetUserMedia( {
						audio : false,
						video : {
							mandatory : {
								chromeMediaSource : 'desktop',
								chromeMediaSourceId : id,
								maxWidth : 1280,
								maxHeight : 720
							}
						}
					}, function ( stream ) {
						self.video.src = URL.createObjectURL( stream );
						self.localstream = stream;
						stream.onended = function () {
							self.stopShare();
							

						};

						self._startShare();

					}, function () {
						if ( self.logLevel > 0 ) {
							console.log( 'USS: getUserMedia() failed.' );
						}
						self.stop();
					} );

				} else {
					self.stop();
				}
			} );
		} else {
            if(!this.ussWorker){
                this.initUssWorker();
            }
		}
	};

	USSClass.prototype.transferFloorTo = function ( floorHolderRequesterId ) {
        floorHolderRequesterId = floorHolderRequesterId.split("/")[0];
        if(!this.lastFloorHolderRequestId){

            this.lastFloorHolderRequestId = floorHolderRequesterId;
            this.createRoomOnlyAction = null;
            return true
        }
        return false;
        

	};

	USSClass.prototype.giveFloor = function ( toJid) {
        toJid = toJid.split("/")[0];
		if ( this.isFloorHolder() || this.isOwner ) {
            if(this.isAOwnerAndFloorHolder() && toJid == this.jid){
                this.lastFloorHolderRequestId = null;
                this.createRoomOnlyAction = null;
                this.start();
            }else if ( ( toJid == this.jid && this.isOwner ) 
                    || ( this.lastFloorHolderRequestId && ( toJid == this.lastFloorHolderRequestId  || toJid.startsWith(this.lastFloorHolderRequestId+"/")))
                    || (!this.lastFloorHolderRequestId) ) {
                this.lastFloorHolderRequestId = toJid;
                this.createRoomOnlyAction = null;
				this.postUSSMessage( 'giveFloor', {
					src : this.jid,
					to : toJid,
                    stopmyshare : (this.currentSharer == src)
				} );
				
                return true;
			}
		}
        return false;

	};
    USSClass.prototype._shiftFloorOnUserJoined = function ( toJid) {
		if ( this.isFloorHolder() || this.isOwner ) {
           if ( ( toJid == this.jid && this.isOwner ) 
                    || ( this.lastFloorHolderRequestId && ( toJid == this.lastFloorHolderRequestId  || this.lastFloorHolderRequestId.startsWith(toJid  + "/")))
                    || (!this.lastFloorHolderRequestId) ) {
                this.lastFloorHolderRequestId = toJid;
                this.createRoomOnlyAction = null;
				this.postUSSMessage( 'giveFloor', {
					src : this.jid,
					to : toJid
				} );
				
                return true;
			}
		}
        return false;

	};
    
	USSClass.prototype.pause = function () {
		if ( this.isFloorHolder() ) {
			this.isPaused = true;
			this.postUSSMessage( 'pause', {
				src : this.jid,
				share : this.shareId
			} );
			clearTimeout( this.timeoutId );
		}
	};

	USSClass.prototype.resume = function () {
		this.isPaused = false;
		this.postUSSMessage( 'resume', {
			src : this.jid,
			share : this.shareId
		} );
		
		this.iteration = this.BASE_IMAGE_FREQUENCY; // to reinitiate with base image
		this.sendUpdate(); // Call sendUpdate() to start the next iteration in calling the extension to get latest image without any delay
	};
	
	USSClass.prototype.stopShare = function () {
		this.isPaused = true;
		if ( this.isFloorHolder() && this.ussWorker ) {
            if(this.shareId){
                this.postUSSMessage( 'stopShare', {
                    src : this.jid,
                    share : this.shareId
                } );
            }
            this.clearShareCaptureElements();
		}

	};	

	USSClass.prototype.leaveRoom = function () {
		this.stopShare();
		this.postUSSMessage( 'leaveRoom', {
			src : this.jid
		} );
	};
	USSClass.prototype.reconnect = function () {
		var self = this;
        this.reconnectCount = this.reconnectCount + 1;
        if(this.reconnectCount < 3){
            console.log( 'USS: Trying ' + (this.reconnectCount + 1) + ' time to reconnect the USS session.' );
            this.isPaused = true;
            this.iteration = this.BASE_IMAGE_FREQUENCY; 
            setTimeout(function(){
            	self.postUSSMessage( 'reconnect' );	
            	
            },500);
             

        }else{
            console.log( 'USS:Failed to reconnect the USS session.Stopping the session.' );
            this.onShareStartStop( self, false, self.jid, self.currentSharer, self.floorHolder );
            this.end();
        }
        
	};
	USSClass.prototype.stop = function () {
		this.isPaused = true;
		clearTimeout( this.timeoutId );

		if ( this.ussWorker ) {
        
			this.postUSSMessage( 'stopSession', {
				src : this.jid,
				share : this.shareId,
				isOwner : this.isAOwner(),
                isFloorHolder:this.isFloorHolder()
			} );
		}

	};

	// called by framework when screen share has ended

	USSClass.prototype.end = function () {
		console.log( "USS: End the USS session" );
		this.destroyed = true;
		this.isPaused = true;
		if ( this.ussWorker ) {
			this.postUSSMessage( 'terminating');			
			this.ussWorker.terminate();
			this.ussWorker = null;
		}

		this.clearShareCaptureElements();

		this.viewScreenShareCanvasId = null;
		this.roomID = null;
		this.sessionToken = null;
		this.onDisconnect( this );
		this.shareId = null;

	};
	USSClass.prototype.clearShareCaptureElements = function () {
		clearTimeout( this.timeoutId );
		var desktopShareFrame = document.getElementById("cgcframe");
		if(desktopShareFrame != null) {
			desktopShareFrame.contentWindow.postMessage({ requestFrom: "collaborate", requestReason : "endShare"}, "*");
		}
		if ( this.video ) {

			this.video.pause();
			this.video.src = '';

			this.video.parentNode.removeChild( this.video );

			this.video = null;

		}

		if ( this.localstream !== null ) {
			this.localstream.stop();
			this.localstream = null;
		}

		if ( this.originalCanvas ) {
			this.originalCanvas.parentNode.removeChild( this.originalCanvas );
		}
		if ( this.updatedCanvas ) {
			this.updatedCanvas.parentNode.removeChild( this.updatedCanvas );
		}
		if ( this.deltaCanvas ) {
			this.deltaCanvas.parentNode.removeChild( this.deltaCanvas );
		}
		this.shareId = null;
		this.originalCanvas = null;
		this.updatedCanvas = null;
		this.deltaCanvas = null;

		this.revision = 0;
		this.timeoutId = null;
		this.width = 0;
		this.height = 0;
		this.originalContext = null;
		this.updatedContext = null;
		this.deltaContext = null;

		this.iteration = this.BASE_IMAGE_FREQUENCY;

	};
	USSClass.prototype.sendBaseImage = function () {
		//for chrome extension
		if(this.useDesktopShareExtension == true){
			var desktopShareFrame = document.getElementById("cgcframe");
			desktopShareFrame.contentWindow.postMessage({ requestFrom: "collaborate", requestReason : "getBaseImage"}, "*");
			return
		}
		
		if ( this.originalContext !== null && this.updatedContext !== null ) {
			this.originalContext.drawImage( this.video, 0, 0 );
			this.updatedContext.putImageData( this.originalContext.getImageData( 0, 0, this.width, this.height ), 0, 0 );
			var imageData = this.originalCanvas.toDataURL( this.imageFormat, this.imageQuality );
			this.postUSSMessage( 'shareBase', {
				src : this.jid,
				share : this.shareId,
				rev : ++this.revision,
				hasDelta : false,
				screenRect : {
					l : 0,
					t : 0,
					w : this.width,
					h : this.height
				}
			} );
			this.postUSSMessage( 'shareImage', {
				src : this.jid,
				share : this.shareId,
				imageData : imageData,
				rev : this.revision,
				hasDelta : false
			} );

		}
	};

	USSClass.prototype.sendDeltaImages = function () {
		//for chrome extension
		if(this.useDesktopShareExtension == true){
			var desktopShareFrame = document.getElementById("cgcframe");
			desktopShareFrame.contentWindow.postMessage({ requestFrom: "collaborate", requestReason : "getDeltaImage"}, "*");
			return;
		}
		
		if ( this.originalContext !== null && this.updatedContext !== null ) {

			// move updated to original
			this.originalContext.putImageData( this.updatedContext.getImageData( 0, 0, this.width, this.height ), 0, 0 );

			// draw video on updated
			this.updatedContext.drawImage( this.video, 0, 0 );

			var result = {
				width : 0,
				height : 0,
				deltas : []
			};
			this.getDeltaImages( this.originalContext, this.updatedContext, 0, 0, this.width, this.height, result );
			if ( result.deltas.length > 0 ) {
				this.deltaCanvas.width = result.width;
				this.deltaCanvas.height = result.height;
				var left = 0;
				for ( var i = 0; i < result.deltas.length; i++ ) {
					this.deltaContext.putImageData( this.updatedContext.getImageData( result.deltas[ i ].l, result.deltas[ i ].t, result.deltas[ i ].w, result.deltas[ i ].h ), left, 0 );
					left += result.deltas[ i ].w;
				}

				var imageData = this.deltaCanvas.toDataURL( this.imageFormat, this.imageQuality );
				this.postUSSMessage( 'shareDelta', {
					src : this.jid,
					share : this.shareId,
					rev : ++this.revision,
					deltas : result.deltas
				} );
				this.postUSSMessage( 'shareImage', {
					src : this.jid,
					share : this.shareId,
					imageData : imageData,
					rev : this.revision,
					hasDelta : true
				} );

			}
		}
	};

	USSClass.prototype.sendUpdate = function () {
		
		if(this.isPaused){
			return;
		}
		
		if ( this.iteration >= this.BASE_IMAGE_FREQUENCY ) {
			this.sendBaseImage();
			this.iteration = 0;
		} else {
			this.sendDeltaImages();
		}
		// this.startTimer();
		this.iteration++;

	};

	USSClass.prototype.startTimer = function () {
		if(this.isPaused){
			return;
		}
		var self = this;
		this.timeoutId = setTimeout( function () {
			self.sendUpdate();
		}, this.FREQUENCY );
	};

	/**
	 * Recursively divide image in four tiles until width or height is <= 128
	 * pixels. Then check if the updated region (tile) is different than the
	 * original. If so, then calculate the smallest region containing the
	 * difference.
	 * 
	 * @param originalContext -
	 *          the original canvas context
	 * @param updatedContext -
	 *          the updated canvas context
	 * @param left -
	 *          left co-ordinate of region to inspect
	 * @param top -
	 *          top co-ordinate of region to inspect
	 * @param right -
	 *          right co-ordinate of region to inspect
	 * @param bottom -
	 *          bottom co-ordinate of region to inspect
	 * @param result -
	 *          regions that are different are stored here. { w: the overall width
	 *          of the delta image, h: the overall height of the delta image,
	 *          deltas: [array of {l:left, t:top, w:width, h:height}]}
	 */
	USSClass.prototype.getDeltaImages = function ( originalContext, updatedContext, left, top, right, bottom, result ) {
		var width = right - left + 1;
		var height = bottom - top + 1;
		if ( width <= this.gridSize || height <= this.gridSize ) {
			// stop and process
			originalImageData = originalContext.getImageData( left, top, width, height );
			updatedImageData = updatedContext.getImageData( left, top, width, height );
			var length = originalImageData.data.length / 4;
			var isDelta = false;
			// reverse left, top, right, bottom so we can find smallest region
			// that's different
			var l = right;
			var t = bottom;
			var r = left;
			var b = top;
			for ( var i = 0; i < length; i++ ) {
				// RGBA difference
				var dr = originalImageData.data[ i * 4 + 0 ] - updatedImageData.data[ i * 4 + 0 ];
				var dg = originalImageData.data[ i * 4 + 1 ] - updatedImageData.data[ i * 4 + 1 ];
				var db = originalImageData.data[ i * 4 + 2 ] - updatedImageData.data[ i * 4 + 2 ];
				var da = originalImageData.data[ i * 4 + 3 ] - updatedImageData.data[ i * 4 + 3 ];
				if ( dr | dg | db | da ) {
					isDelta = true;
					var x = left + ( i % width );
					var y = top + Math.floor( i / width );
					// this pixel (x, y) is different, store it's co-ordinates if
					// it's the left-most, top-most, right-most, bottom-most
					if ( x < l ) {
						l = x;
					}
					if ( x > r ) {
						r = x;
					}
					if ( y < t ) {
						t = y;
					}
					if ( y > b ) {
						b = y;
					}
				}
			}
			if ( isDelta ) {
				var delta = {
					l : l,
					t : t,
					w : r - l + 1,
					h : b - t + 1
				};
				result.deltas.push( delta );
				// the overall delta image is a collage of differences laid out left
				// to right, so it gets wider as we keep adding tiles. the height
				// remains fixed to the tallest difference.
				result.width += delta.w;
				if ( delta.h > result.height ) {
					result.height = delta.h;
				}
			}
		} else {
			// divide in 4 and recurse
			width = Math.floor( width / 2 );
			height = Math.floor( height / 2 );
			this.getDeltaImages( originalContext, updatedContext, left, top, left + width - 1, top + height - 1, result );
			this.getDeltaImages( originalContext, updatedContext, left + width, top, right, top + height - 1, result );
			this.getDeltaImages( originalContext, updatedContext, left, top + height, left + width - 1, bottom, result );
			this.getDeltaImages( originalContext, updatedContext, left + width, top + height, right, bottom, result );
		}
	};

	USSClass.prototype._startShare = function () {
		//if already initialized and available, then start the shareProcess.
		if ( this.ussWorker) {
			if(this.isFloorHolder() ){
				this.postUSSMessage( 'initShare', {
					src : this.jid,
					share : this.shareId,
					baseQuality : 75,
					deltaQuality : 60,
					colordepth : 'high'
				} );
			}
			this.onStarted( this );
			
			return;
		} else {
			this.initUssWorker();
		}
	}
	USSClass.prototype.initUssWorker = function () {
		var self = this;

		// create new USS worker
		this.ussWorker = new Worker( './uss-api-1.0.js?build='+window.cgcConfig.build );

		// add suspend listener
		/*chrome.runtime.onSuspend.addListener( function () {
			if ( self.ussWorker ) {
				self.ussWorker.terminate();
			}
			;
		} );*/

		this.ussWorker.addEventListener( 'message', function ( e ) {
			switch ( e.data.type ) {
				case 'onConnected':
					
					if(e.data.data.imageFormats) {
                        var serverImageCaps = e.data.data.imageFormats;
                        var imgType = null;
                        for(var i = 0; i < self.clientImageCaps.length; i++) {
                            imgType = self.clientImageCaps[i];
                            if(serverImageCaps.indexOf(imgType)>=0){
                                imgType = (imgType == 'jpg')?'jpeg':imgType;
                                self.imageFormat = 'image/'+imgType;
                                break;
                            }
                        }
					}

					if ( self.roomID ) {
						self.postUSSMessage( 'joinRoom', {
							src : self.jid,
							share : self.shareId,
							name : self.name,
							roomID : self.roomID,
							token : self.sessionToken
						} );
					} else {
						self.postUSSMessage( 'createRoom', {
							src : self.jid,
							name : self.name,
							capacity : self.capacity,
							bwu : self.bwu,
							bwp : self.bwp,
							bcu : self.bcu,
							bcp : self.bcp
						} );
					}
					break;
                case 'channelReconnected':
                    console.log( 'USS:Reconnected successfully to the USS session. Trying to join the room.' );
                    break;
				case 'onDisconnect':
                    if(e.data.data && e.data.data.forcedCloseRequested == false){
                        self.reconnect();
                    }else{
                        self.end();
                    }
					break;
				case 'onStopShare':
					self.isGraceFullyShareEnded = true;
                    
					self.onShareStartStop( self, false, e.data.data.src, self.currentSharer, self.floorHolder );
                    
                    //owner closes the USS room if no more share pending
                    if(!self.isFloorHolder() 
                        && self.isAOwner() && !self.lastFloorHolderRequestId 
                        && ( !self.currentSharer || self.currentSharer == e.data.data.src) ){
                        
                        self.stop();
                    }
                    
                    
					break;
				case 'onRoleChanged':
                    
                    if ( e.data.data.removeRoles && e.data.data.removeRoles.indexOf( 'floorholder' ) > -1 ){
                    	self.floorHolder = null;
                        if ( self.isFloorHolder() && e.data.data.uid == self.jid) {
                            self._onRoleChanged( false );
                        }
                    }else if(e.data.data.addRoles && e.data.data.addRoles.indexOf( 'floorholder' ) > -1){
                    	self.floorHolder = e.data.data.uid;
						if ( e.data.data.uid == self.jid ) {
							self._onRoleChanged( true );
						}
                        

					}
                    
                    
					break;
				case 'onRoomClosed':
					self.isGraceFullyShareEnded = true;
					self.end();

					break;
				case 'onCreateRoomResult':
					if ( e.data.data.errorCode === 0 ) {
						self.isGraceFullyShareEnded = false; //reset it
						self.roomID = e.data.data.roomID;
						self.sessionToken = e.data.data.token;
						if ( !self.createRoomOnlyAction ) {
							self.postUSSMessage( 'initShare', {
								src : self.jid,
								share : self.shareId,
								baseQuality : 75,
								deltaQuality : 60,
								colordepth : 'high'
							} );
						}
						self.onStarted( self );
					} else {
						self.onStartError( self, e.data.data.errorCode );
                        self.end( );
					}

					break;

				case 'onJoinRoomResult':
					if ( e.data.data.errorCode === 0 || e.data.data.errorCode == 409) {
                        self.sessionToken = e.data.data.token;
                        if(self.reconnectCount>-1){
                            console.log( 'USS:Joined the room successfully after reconneting.' );
                            if ( self.isFloorHolder() ) {
                                console.log( 'USS:Start sharing desktop after rejoining.' );
                                self.reconnectCount = -1;
                                self.isPaused = false;
                                self.iteration = self.BASE_IMAGE_FREQUENCY;
                                self.sendUpdate();
                                
                            }   
                        }else{
                            self.isGraceFullyShareEnded = false; //reset it
                            self.sessionToken = e.data.data.token;
                            /*if(self.isFloorHolder() && self.roomID){
                              self.postUSSMessage('initShare', {
                                src : self.jid,
                                share : self.shareId,
                                baseQuality : 75,
                                deltaQuality : 60,
                                colordepth : 'high'
                              });
                            }*/
                            self.onStarted( self );
                        }
					} else {
                        if(self.reconnectCount>-1){
                            self.onShareStartStop( self, false, e.data.data.src, self.currentSharer, self.floorHolder );
                            
                        }else{
                            self.onStartError( self, e.data.data.errorCode );
                        }
                        self.end( );
					}

					break;

				case 'onStartShare':
					self.isGraceFullyShareEnded = false; //
                    if(self.lastFloorHolderRequestId && self.lastFloorHolderRequestId == e.data.data.src){
                        self.lastFloorHolderRequestId = null;
                    }                    
                    
					self.onShareStartStop( self, true, e.data.data.src, self.currentSharer, self.floorHolder );
					self.currentSharer = e.data.data.src;
					break;

				case 'onSetActiveShare':

					if ( self.isFloorHolder() ) {
						if ( e.data.data.share && e.data.data.share == self.shareId ) {
							self.isPaused = false;
                            self.iteration = self.BASE_IMAGE_FREQUENCY;
                            self.sendUpdate();
						}
					} 
					break;

				case 'onShareBaseUpdate':
					self.onBaseImage( e.data.data.format, e.data.data.imageData, e.data.data.shareMessage.screenRect );

					// var imageBase = document.createElement('img');

					// var imageCanvas = self.viewScreenShareCanvasId;

					// imageBase.onload = function() {
					// imageCanvas.width = this.width;
					// imageCanvas.height = this.height;
					// var context = imageCanvas.getContext('2d');
					// context.drawImage(this, 0, 0);
					// };

					// imageBase.src = 'data:image/jpg;base64,' + e.data.data.imageData;
					break;

				case 'onDeltaUpdate':
					self.onImageDeltas( e.data.data.format, e.data.data.shareMessage, e.data.data.imageData );
					// var image = document.createElement('img');
					// image.src = 'data:image/jpg;base64,' + e.data.data.imageData;
					// image.onload = function() {
					// var imageCanvas = self.viewScreenShareCanvasId;
					// var context = imageCanvas.getContext('2d');
					// var sl = 0;
					// var shareMessage = e.data.data.shareMessage;
					// for ( var i = 0; i < shareMessage.deltas.length; i++) {
					// context.drawImage(image, sl, 0, shareMessage.deltas[i].w,
					// shareMessage.deltas[i].h,shareMessage.deltas[i].l,
					// shareMessage.deltas[i].t, shareMessage.deltas[i].w,
					// shareMessage.deltas[i].h);
					// sl = sl + shareMessage.deltas[i].w;
					// }
					// };
					break;
				case 'onShareCursorUpdate':
					self.onCursorImage( e.data.data.format, e.data.data.imageData, e.data.data.posX, e.data.data.posY );
					break;
				case 'onUserJoined':
					if ( e.data.data.uid != self.jid ) {
                        if( self.lastFloorHolderRequestId 
                            && ( e.data.data.uid == self.lastFloorHolderRequestId || self.lastFloorHolderRequestId.startsWith(e.data.data.uid+"/"))  ){
                            self._shiftFloorOnUserJoined( e.data.data.uid );
                        }
					}
					if(e.data.data.roles && e.data.data.roles.indexOf('owner') >= 0){
						self.setOwnerId(e.data.data.uid);
					}
					
					break;
                case 'onDataQueueFailed':
                    self.pause();
                    setTimeout(function(){
                        self.resume();
                    }, 500);
                    break;                    
			}
		}, false );

		self.postUSSMessage( 'init', {
			ussUrl : self.ussUrl,
			src : self.jid,
			share : self.shareId,
			isSafari : isSafari(),
			isIE : isIE(),
			isEdge : isEdge()
		} );
	};

	USSClass.prototype.postUSSMessage = function ( cmd, message ) {
		this.ussWorker.postMessage( {
			cmd : cmd,
			message : message
		} );
	};

	USSClass.prototype.ROLE = {
		OWNER : "owner",
		PARTICIPANT : "participant",
		FLOOR_HOLDER : "floor_holder"
	}

	USSClass.prototype.isFloorHolder = function () {
		return ( this.role == USSClass.prototype.ROLE.FLOOR_HOLDER );
	}

	USSClass.prototype.isAOwner = function () {
		return ( this.isOwner === true );
	}

	USSClass.prototype.isAParticipant = function () {
		return ( this.isOwner === false );
	}

	USSClass.prototype.isAOwnerAndFloorHolder = function () {
		return ( this.isOwner == true && this.role == USSClass.prototype.ROLE.FLOOR_HOLDER );
	}

	USSClass.prototype.isAParticipantAndFloorHolder = function () {
		return ( this.isOwner == false && this.role == USSClass.prototype.ROLE.FLOOR_HOLDER );
	}
	window.USSClass = USSClass;

}( window ) );
