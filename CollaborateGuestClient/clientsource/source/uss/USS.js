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
		this.ownerJid = config.ownerJid;
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
		this.onScreenShareExtensionActiveDeactive = function ( isSuccess ) {};
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
		  	
		  	window.addEventListener('message', function (event) {
		  		if(self.destroyed){
		  			return;
		  		}
                
		  		if(LOGGER.API.isDevDebug())	LOGGER.API.devDebug("USS", "Event from Screenshare extension", event);  
                
			    if(event.data.responseFrom == "ContentScript") {
			    	
			    	if(LOGGER.API.isDevDebug()){
                        LOGGER.API.devDebug("USS", "EventResponse received for new frame from Screenshare extension ");
                    }
                    
			    	 if(self.isFloorHolder() && event.data.response == "deltaImage") {
			    		 if(!self.destroyed){
			    			 	if(LOGGER.API.isDevDebug()){
		                            LOGGER.API.devDebug("USS", "New packet received for deltaImage for new frame from Screenshare extension ", event.data.deltas );
		                        }
		                    
			    			 	var deltas = event.data.deltas;
						  		var imageData = event.data.image;
						  		var isAppResized = event.data.isAppResized;
						  		
						  		if(isAppResized) {
						  			self.iteration = self.BASE_IMAGE_FREQUENCY; // Reset it to Base image to start with resized images. 
						  			self.sendUpdate(); // Call sendUpdate() to start the next iteration in calling the extension to get latest image
						  			return;
						  		}
						  		
			    			 	if(!event.data.image || !event.data.deltas){
			                        LOGGER.API.info("USS", "No change noted in screen share. Waiting for next delta." );
			    			 		self.startTimer();
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
							   
					   }
                         
			    	} else if(self.isFloorHolder() && event.data.response == "baseImage") {
			    		 if(!self.destroyed){
			    			 if(LOGGER.API.isDevDebug()){
		                            LOGGER.API.devDebug("USS", "New packet received for baseImage from Screenshare extension " );
		                        }
			    			 
			    			 	if(!event.data.image){
			                        LOGGER.API.warn("USS", "No valid base packet received from Screenshare extension. Wait for next packet." );
			    			 		self.startTimer();
			    			 		return;
			    			 	}
					    		var w = event.data.w;
					  		    var h = event.data.h;
					  	        var imageData = event.data.image;
					  	        
					  	        //Only send the base if it is not minimized.
					  	        if(w>10 || h>10){
					  	        	
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
					  	        }
						  	    
						  	      
						  	  self.sendUpdate(); // Call sendUpdate() to start the next iteration in calling the extension to get latest image
						  	    
			    		 }
			    		
			    	} else if(event.data.response == "shareStarted") {
                        if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Screenshare extension ready to send data " );
                        }
                        self.onScreenShareExtensionActiveDeactive(true);	
					    self._startShare();
					    
			    	} else if(event.data.response == "shareOnend") {
                        if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Screenshare extension stops sending data " );
                        }
                        
			    		
			    		self.stopShare();
			    		self.onScreenShareExtensionActiveDeactive(false);
			    		
			    		window.postMessage({ requestFrom: "USS-Client", 
		    				requestReason: "endShare"}, 
		    				window.location.origin);
			    		
					    
			    	} else if(event.data.response == "shareFailed") {
			    		if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Screenshare extension failed to send data " );
                        }
			    		self.onScreenShareExtensionActiveDeactive(false);	
					    self.stop();
					    
					    
					    window.postMessage({ requestFrom: "USS-Client", 
		    				requestReason: "endShare"}, 
		    				window.location.origin);
					    
					   
					    
			    	} else if(event.data.response == "extensionInitialized" && event.data.responseStatus == "success") {
			    		if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Screenshare extension initialized successfully " );
                        }
			    		
			    		window.postMessage({ requestFrom: "USS-Client", 
			    				requestReason: "extensionStart"}, 
			    				window.location.origin);
			    		
			    	}
			    	
			    }else{
			    	if(event.data.requestFrom != "USS-Client" && event.data.requestFrom != "GuestClient"){
			    		LOGGER.API.warn("USS", "Dataframe reeived from unknown source", event );
			    	}
                    
                }
		  		
		  	});
			  	
		};
		if(this.useDesktopShareExtension) {
			this.setDesktopShareExtensionListener();  		
		}

        this._onRoleChanged = function ( changeToFloorHolder ) {
            if(LOGGER.API.isInfo()){
                LOGGER.API.info("USS", "process role change event for floorholder " + changeToFloorHolder );
            }
			var self = this;
			if ( changeToFloorHolder == this.isFloorHolder() ) {
                if(LOGGER.API.isDebug()){
                    LOGGER.API.debug("USS", "Already a floorHolder" );
                }

			}
			

			/*
			 * It might be conflicting case where the user
			 * floor holder status was not changed previously and
			 * this is a duplicate floor holder update.
			 * 
			 * So lets continue with the flow
			 */
			
			if ( changeToFloorHolder == true ) {
				this.floorHolder = true;

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
            if(LOGGER.API.isDebug()){
                LOGGER.API.debug("USS", "Duplicate call. User is already sharing the screen" );
            }
            return;
        }  
        if(LOGGER.API.isInfo()){
                LOGGER.API.info("USS", "Initializing USS Session" );
        }
		this.isPaused = false;
		if ( this.isFloorHolder() && this.createRoomOnlyAction != true ) {

            this.shareId = this.guid();
            window.postMessage({ requestFrom: "USS-Client", 
                		requestReason: "isExtensionInitialized", 
                		imageDataFormat : this.imageFormat}, 
                		window.location.origin);
                
            
            
			
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
        if(LOGGER.API.isInfo()){
                    LOGGER.API.info("USS", "Stopping the share " + this.shareId);
        }
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
            if(LOGGER.API.isInfo()){
                    LOGGER.API.info("USS", (this.reconnectCount + 1) + ' time to reconnect the USS session.');
            }
            
            this.isPaused = true;
            this.iteration = this.BASE_IMAGE_FREQUENCY; 
            setTimeout(function(){
            	self.postUSSMessage( 'reconnect' );	
            	
            },500);
             

        }else{
            if(LOGGER.API.isInfo()){
                    LOGGER.API.info("USS", ' Failed to reconnect the USS session.Stopping the session.');
            }

            this.onShareStartStop( self, false, self.jid, self.currentSharer, self.floorHolder );
            this.end();
        }
        
	};
	USSClass.prototype.stop = function () {
        if(LOGGER.API.isInfo()){
                    LOGGER.API.info("USS", ' Stopping the USS session.');
        }
        this.destroyed = true;
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
		this.role = USSClass.prototype.ROLE.PARTICIPANT;
	};

	// called by framework when screen share has ended

	USSClass.prototype.end = function () {
        if(LOGGER.API.isInfo()){
            LOGGER.API.info( "USS","Terminating USS session" );
        }
        this.role = USSClass.prototype.ROLE.PARTICIPANT;
		this.destroyed = true;
		this.isPaused = true;
		if ( this.ussWorker ) {
			this.postUSSMessage( 'terminating');			
			this.ussWorker.terminate();
			this.ussWorker = null;
		}

		this.floorHolder = false;
		this.clearShareCaptureElements();

		this.viewScreenShareCanvasId = null;
		this.roomID = null;
		this.sessionToken = null;
		this.onDisconnect( this );
		this.shareId = null;

	};
	
	USSClass.prototype.clearShareCaptureElements = function () {
		clearTimeout( this.timeoutId );
		
		window.postMessage({ requestFrom: "USS-Client", 
			requestReason: "endShare"}, 
			window.location.origin);


		this.onScreenShareExtensionActiveDeactive(false);	
		
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
        if(LOGGER.API.isDevDebug()){
            LOGGER.API.devDebug( "USS","Request Screenshare for baseimage" );
        }
        
        window.postMessage({ requestFrom: "USS-Client", 
    		requestReason: "getBaseImage"}, 
    		window.location.origin);
        
        
      
	};

	USSClass.prototype.sendDeltaImages = function () {
        if(LOGGER.API.isDevDebug()){
            LOGGER.API.devDebug( "USS","Request Screenshare for deltaImage" );
        }
		//for chrome extension
        window.postMessage({ requestFrom: "USS-Client", 
        		requestReason: "getDeltaImage"}, 
        		window.location.origin);
        
        
 
	};

	USSClass.prototype.sendUpdate = function () {
		
		if(this.isPaused){
			return;
		}
		
		if ( this.iteration >= this.BASE_IMAGE_FREQUENCY ) {
            if(LOGGER.API.isDevDebug()){
                LOGGER.API.devDebug( "USS","Send baseImage to USS websocket worker" );
            }        
			this.sendBaseImage();
			this.iteration = 0;
		} else {
            if(LOGGER.API.isDevDebug()){
                LOGGER.API.devDebug( "USS","Send deltaImage to USS websocket worker" );
            }    
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



	USSClass.prototype._startShare = function () {
		//if already initialized and available, then start the shareProcess.
		if ( this.ussWorker) {
			if(this.isFloorHolder() ){
                if(LOGGER.API.isDebug()){
                    LOGGER.API.debug( "USS","Starting the share process" );
                } 
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
        if(LOGGER.API.isInfo()){
                LOGGER.API.info("USS", "Initializing USS websocket" );
        }
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
					if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "USS websocket connected successfully", e.data );
                    }
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
                    if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Reconnected successfully to the USS session. Trying to join the room." );
                    }
                    
                    break;
				case 'onDisconnect':
                    if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Websocket disconnected." , e.data);
                    }
                    if( e.data.data && e.data.data.forcedCloseRequested == false && !self.isFloorHolder()){
                    	//in some asynchronous cases, the onDisconnect happens but the USS session is already stopped
                    	if(self.destroyed){
                    		//send the signal again
                    	        
                			self.postUSSMessage( 'terminating' );
                    	}else{
                    		 self.reconnect();
                    	}
                       
                    }else{
                    	//self.isGraceFullyShareEnded = true;
                        self.end();
                    }
					break;
				case 'onStopShare':
                    if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Current share is stopped.", e.data );
                    }
					self.isGraceFullyShareEnded = true;
                    
					self.onShareStartStop( self, false, e.data.data.src, self.currentSharer, self.floorHolder );
                    
                    //owner closes the USS room if no more share pending
                    if(!self.isFloorHolder() 
                        && self.isAOwner() && !self.lastFloorHolderRequestId 
                        && ( !self.currentSharer || self.currentSharer == e.data.data.src) ){
                        
                        self.stop();
                    }
                    
                    //remove current sharer if that is the source of stopping share
                    if(e.data.data.src == self.currentSharer && e.data.data.src != self.ownerJid){
                    	if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Stopping the USS session as the current user is the floor holder and stopped the desktop share." );
                    	}
                    	self.stop();
                    	self.currentSharer = null;
                    }
                    
					break;
				case 'onUserLeft':
					 
					 if(e.data.data.uid == self.floorHolder){
						 if(LOGGER.API.isInfo()){
	                         LOGGER.API.info("USS", "Stopping USS session as the floor holder has left the share room.", e.data.data );
						 }
	                    	self.currentSharer = null;
	                    	self.stop();
	                 }
					break;
				case 'onRoleChanged':
                    if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Current Role changed.", e.data );
                    }
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
                    if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Share room is closed.", e.data );
                    }
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
                            if(LOGGER.API.isInfo()){
                                    LOGGER.API.info("USS", "Joined the USS room successfully after reconneting.", e.data );
                            }
                            
                            if ( self.isFloorHolder() ) {
                                if(LOGGER.API.isInfo()){
                                        LOGGER.API.info("USS", "Start sharing desktop after rejoining.", e.data );
                                }
                                
                                self.reconnectCount = -1;
                                self.isPaused = false;
                                self.iteration = self.BASE_IMAGE_FREQUENCY;
                                self.sendUpdate();
                                
                            }   
                        }else{
                            if(LOGGER.API.isInfo()){
                                    LOGGER.API.info("USS", "Joined the USS room successfully.", e.data );
                            }
                            self.isGraceFullyShareEnded = false; //reset it
                            self.sessionToken = e.data.data.token;
                            self.onStarted( self );
                        }
					} else {
                        if(self.reconnectCount>-1){
                            self.onShareStartStop( self, false, e.data.data.src, self.currentSharer, self.floorHolder );
                            
                        }else{
                            LOGGER.API.warn("USS", "Failed to join USS session.", e.data );

                            self.onStartError( self, e.data.data.errorCode );
                        }
                        self.end( );
					}

					break;

				case 'onStartShare':
                    if(LOGGER.API.isInfo()){
                            LOGGER.API.info("USS", "Share started.", e.data );
                    }                    
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
                            if(LOGGER.API.isInfo()){
                                LOGGER.API.info("USS", "Share by guest is set active at USS room.", e.data );
                            }  
							self.isPaused = false;
                            self.iteration = self.BASE_IMAGE_FREQUENCY;
                            self.sendUpdate();
						}
					} 
					break;

				case 'onShareBaseUpdate':
					if(!self.destroyed ){
						
	                    if(LOGGER.API.isDevDebug()){
	                        LOGGER.API.devDebug("USS", "Received base image", e.data );
	                    }
						self.onBaseImage( e.data.data.format, e.data.data.shareMessage, e.data.data.imageData );
					}
					break;

				case 'onDeltaUpdate':
					if(!self.destroyed ){
	                    if(LOGGER.API.isDevDebug()){
	                        LOGGER.API.devDebug("USS", "Received delta image", e.data );
	                    }
						self.onImageDeltas( e.data.data.format, e.data.data.shareMessage, e.data.data.imageData );
					}
					break;
				case 'onShareCursorUpdate':
					if(!self.destroyed ){
						self.onCursorImage( e.data.data.format, e.data.data.imageData, e.data.data.posX, e.data.data.posY );
					}
					break;
				case 'onUserJoined':
					if ( e.data.data.uid != self.jid ) {
                        if( self.lastFloorHolderRequestId 
                            && ( e.data.data.uid == self.lastFloorHolderRequestId || self.lastFloorHolderRequestId.startsWith(e.data.data.uid+"/"))  ){
                            self._shiftFloorOnUserJoined( e.data.data.uid );
                        }
					}
					if(e.data.data.roles ){
						
						if(e.data.data.roles.indexOf('owner') >= 0){
							self.setOwnerId(e.data.data.uid);
							if(LOGGER.API.isInfo()){
		                        LOGGER.API.info("USS", "USS owner is set to ", e.data.data.uid );
							}
						}
						
						if(e.data.data.roles.indexOf('floorholder') >= 0){
							self.floorHolder = e.data.data.uid;
							if(LOGGER.API.isInfo()){
		                        LOGGER.API.info("USS", "USS floorholder is set to ", e.data.data.uid );
							}
						}
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
			isEdge : isEdge(),
			logLevel:LOGGER.Level
		} );
	};

	USSClass.prototype.postUSSMessage = function ( cmd, message ) {
		if(this.ussWorker){
			this.ussWorker.postMessage( {
				cmd : cmd,
				message : message
			} );
		}else{
			if(LOGGER.API.isInfo()){
                LOGGER.API.info("USS", "Could not post message to USS as the ussWorker not available=> command=" +  cmd );
			}
		}
		
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
