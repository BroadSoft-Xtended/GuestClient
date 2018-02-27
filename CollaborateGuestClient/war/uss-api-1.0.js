importScripts('util.js', 'log.js', 'jquery.base64.js');


	
/*
 * Copyright 2014, BroadSoft, Inc.
 * 
 * USS API Client Library
 * 
 * @author ptalekar@broadsoft.com
 * @modified kdey@broadsoft.com
 */

var uss = null;
var terminated = false;

self.addEventListener( 'message', function ( e ) {
	
	if(LOGGER.API.isDebug()){
		LOGGER.API.debug("USS-API"," command received from peer: "+e.data.cmd);
	}
	
	switch ( e.data.cmd ) {

		case 'init':
			try{
				LOGGER.Level = e.data.message.logLevel;
				
			}catch(e){}
			
			uss = new USS( e.data.message.ussUrl, e.data.message.src, e.data.message.isSafari, e.data.message.isIE, e.data.message.isEdge );

			
			uss.onconnected = function (serverCaps) {
				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("USS-API","Send message to peer: "+serverCaps);
				}
				sendMessage( 'onConnected', serverCaps );

			};

			uss.ondisconnected = function (message) {
				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("USS-API","Send message to peer: "+message);
				}
				sendMessage( 'onDisconnect', message );
			};
            uss.onchannelreconnected = function(){
            	if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("USS-API","Send message to peer:channelReconnected ");
				}
                sendMessage( 'channelReconnected', '' );
            }
			uss.onmessage = function ( message ) {

				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("USS-API","Send message to peer: ", message);
				}
				switch ( message.cmd ) {
					case 'createRoomResult':
						sendMessage( 'onCreateRoomResult', message );

						break;

					case 'joinRoomResult':
						sendMessage( 'onJoinRoomResult', message );

						break;

					case 'startShare':
						sendMessage( 'onStartShare', message );

						break;

					case 'setActiveShare':
						sendMessage( 'onSetActiveShare', message );

						break;

					case 'stopShare':
						sendMessage( 'onStopShare', message );
						break;

					case 'roomClosed':
						sendMessage( 'onRoomClosed', message );
						break;

					case 'roleChanged':
						sendMessage( 'onRoleChanged', message );
						break;

					case 'userJoined':
						sendMessage( 'onUserJoined', message );
						break;
					case 'userLeft':
						sendMessage( 'onUserLeft', message );
						break;
				}
			};

			uss.onimageupdate = function ( shareMessage, format, imageData ) {
				
				if ( shareMessage.cmd == 'shareBase' ) {
					if(LOGGER.API.isDebug()){
						LOGGER.API.debug("USS-API","[TAG:IMAGE] Send Base image to peer rev= "+ shareMessage.rev, {"shareMessage":shareMessage, "format":format, "imageData":imageData});
					}
					
					sendMessage( 'onShareBaseUpdate', {
						shareMessage : shareMessage,
						format : format,
						imageData : imageData
					} );
				} else {
					if(LOGGER.API.isDebug()){
						LOGGER.API.debug("USS-API","[TAG:IMAGE] Send Delta image to peer rev= "+ shareMessage.rev, {"shareMessage":shareMessage, "format":format, "imageData":imageData});
					}
					sendMessage( 'onDeltaUpdate', {
						shareMessage : shareMessage,
						format : format,
						imageData : imageData
					} );
				}
			};

			uss.oncursorimageupdate = function ( imageData ) {
				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("USS-API","[TAG:IMAGE] Send Cursor image to peer: ", {"imageData":imageData});
				}
				
				if ( this.cursorImageData ) {
					var cursorInfo =  {
								format : 'image/png',
								imageData : imageData,
								posX : this.cursorImageData.posX,
								posY : this.cursorImageData.posY
					};
					if(LOGGER.API.isDevDebug()){
						LOGGER.API.devDebug("USS-API","[TAG:IMAGE] Send cursor imagedata to peer: ", cursorInfo);
						
					}
					sendMessage( 'onShareCursorUpdate', cursorInfo);
				}

			};
            
            uss.dataqueuefailed= function(){
				LOGGER.API.warn("USS-API","Send dataQueue fail notification to peer");
                sendMessage( 'onDataQueueFailed');
            }

			uss.start();
			break;
		case 'reconnect':
            uss.start(true);
            break;
		case 'createRoom':
			if ( uss ) {
				uss.createRoom( e.data.message.src, e.data.message.name, e.data.message.capacity, e.data.message.bwu, e.data.message.bwp, e.data.message.bcu, e.data.message.bcp );
			}
			break;

		case 'initShare':
			if ( uss ) {

				uss.startShare( e.data.message.src, e.data.message.share, e.data.message.baseQuality, e.data.message.deltaQuality, e.data.message.colordepth );
			}else{
                sendMessage( 'onDisconnect', {'forcedCloseRequested':true} );
            }
			break;

		case 'shareBase':
			if ( uss && !uss.isForcedCloseRequested()) {
				uss.shareBase( e.data.message.src, e.data.message.share, e.data.message.rev, e.data.message.hasDelta, e.data.message.screenRect );
			}

			break;

		case 'shareImage':
			if ( uss && !uss.isForcedCloseRequested()) {

				uss.shareImage( e.data.message.share, e.data.message.imageData, e.data.message.rev, e.data.message.hasDelta );
			}

			break;

		case 'shareDelta':
			if ( uss && !uss.isForcedCloseRequested()) {

				uss.shareDelta( e.data.message.src, e.data.message.share, e.data.message.rev, e.data.message.deltas );
			}

			break;
		case 'pause':
			uss.pauseShare( e.data.message.src, e.data.message.share );
			break;

		case 'resume':
			uss.resumeShare( e.data.message.src, e.data.message.share );
			break;

		case 'giveFloor':
			uss.giveFloor( e.data.message.src, e.data.message.share, e.data.message.to, e.data.message.stopmyshare );
			break;

		case 'stopShare':
			if ( uss && e.data.message.share ) {
				uss.stopShare( e.data.message.src, e.data.message.share );
			}else{
                sendMessage( 'onDisconnect', {'forcedCloseRequested':true} );
            }
			break;

		case 'joinRoom':
			uss.joinRoom( e.data.message.src, e.data.message.roomID, e.data.message.name, e.data.message.token );
			break;

		case 'leaveRoom':
			uss.leaveRoom( e.data.message.src, e.data.message.share );
			break;

		case 'stopSession':
            if(uss){
                uss.stop( e.data.message.src, e.data.message.share, e.data.message.isOwner, e.data.message.isFloorHolder );
                uss = null;
            }else{
                sendMessage( 'onDisconnect', {'forcedCloseRequested':true} );
            }
			break;
			
		case 'terminating':
			terminated = true;
			if(uss != null){
				
				uss.clean();
				uss = null;
			}
			break;
	}
}, false );

function sendMessage ( type, data ) {
	if(!terminated){
		self.postMessage( {
			type : type,
			data : data
		} );
		
	}
}

function USS ( ussUrl, jid, isSafari, isIE, isEdge) {
	this.isSafari = isSafari;
	this.isIE = isIE;
	this.isEdge = isEdge;
	this.jid = jid;
	this.wsUrl = ussUrl;
	this.readyState = WebSocket.CONNECTING; //OPEN, CLOSED

	this.receivedServerCaps = false;
	
	
	var imageProcessorThread = null;
    var incomingShareDataRevArray = [];
    var incomingShareDataRevToDataMap = {};
    
    
    
	this.cursorImageDataBuffer = null;

	var tries = 0;
	var ws = null;
	var forcedCloseRequested = false;
	var self = this;
	var LOG_PREFIX = 'USS-API|';
	var transmitIntervalId = null;
	var transmitQueue = [];
	var QUEUE_LIMIT = 1000;

	// callbacks
	this.onconnecting = function () {
	};

	this.onconnected = function () {
	};

	this.onimageupdate = function ( shareMessage, imageData ) {
	};

	this.oncursorimageupdate = function ( shareCursorMessage, cursorImageData ) {
	};

	this.onmessage = function ( shareMessage ) {
	};

	this.ondisconnected = function (message) {
	};
    
    this.onchannelreconnected = function(){
    }
    
    this.dataqueuefailed = function(){
    }
	function connect ( reconnect ) {
        this.readyState = WebSocket.CONNECTING;
		if ( reconnect ) {
			if(LOGGER.API.isInfo()){
				LOGGER.API.info( LOG_PREFIX, 'Opening WebSocket (reconnect=' + reconnect + ').' );
			}
		}

		tries++;
		if ( tries > 5 ) {
			tries = 1;
		}
		// self.wsUrl = "wss://uss1.ihs.broadsoft.com:8443/uss";
		ws = new WebSocket( self.wsUrl );
		ws.binaryType = 'arraybuffer';
        if ( !reconnect ){
            self.onconnecting();
        }
        
		var localWs = ws;
		var timeout = setTimeout( function () {
			LOGGER.API.warn( LOG_PREFIX, 'Closing websocket - Timeout (4 second expired) happened while waiting for WebSocket to connect.' );
			localWs.close();
		}, 4000 );

		ws.onopen = function ( event ) {
			
			clearTimeout( timeout );
			
			if(LOGGER.API.isInfo()){
				LOGGER.API.info( LOG_PREFIX, 'Successfully opened the WebSocket.' );
			}
			
			self.readyState = WebSocket.OPEN;
            if ( reconnect ){
                self.onchannelreconnected();
                reconnect = false;
            }
            

            
			
            //self.startSenderThread();
            
            if(self.isSafari || self.isIE || self.isEdge) {
	            send( JSON.stringify( {
					cmd : 'clientCaps',
					src : self.jid,
					protocolVersion : '20',
					imageFormats : [
							'jpg', 'png'
					]
				} ) );
            } else {
				send( JSON.stringify( {
					cmd : 'clientCaps',
					src : self.jid,
					protocolVersion : '20',
					imageFormats : [
							'webp', 'jpg', 'png'
					]
				} ) );
            }

			self.heartBeat();
		};

		ws.onclose = function ( event ) {
			if(LOGGER.API.isInfo()){
				LOGGER.API.info( LOG_PREFIX, 'WebSocket closed.' + ' Code:' + event.code + ' Reason:' + event.reason );
			}
            transmitQueue = [];
            clearTimeout( timeout );
            self.stopSenderThread();
            if(forcedCloseRequested){
                self.ondisconnected({'forcedCloseRequested':forcedCloseRequested});
                self.onmessage( {
                    cmd : 'stopShare'
                } );
            }else{
                self.ondisconnected({'forcedCloseRequested':forcedCloseRequested});
            }
			
			self.clean();
		};

		ws.onmessage = function ( message ) {
			self.processMessage( message );
		};

		ws.onerror = function ( event ) {
            clearTimeout( timeout );
			LOGGER.API.warn( LOG_PREFIX, 'WebSocket error. ' + event.name + ' ' + event.message );
			self.ondisconnected({forcedCloseRequested:forcedCloseRequested});
			self.clean();

		};
	}

	this.stopWS = function(){
		if ( ws ) {
			try{ws.close();}catch(e){}
			ws.onopen = null;
			ws.onclose = null;
			ws.onmessage = null;
			ws.onerror = null;
			ws = null;
		}
        ws = null;
	}
	this.clean = function () {
		this.stopWS();
        tries = 0;
        forcedCloseRequested = false;		

		this.stopSenderThread();
        this.stopImageProcessorThread();
        
        transmitQueue = [];
        
        imageProcessorThread = null;
        incomingShareDataRevArray = [];
        incomingShareDataRevToDataMap = {};
        
        
        receivedServerCaps = false;
        // if (forcedCloseRequested) {
        self.readyState = WebSocket.CLOSED;
            


		this.cursorImageDataBuffer = null;

	};

	this.heartBeat = function () {
		var self = this;
		setTimeout( function () {

			if ( self.readyState === WebSocket.OPEN ) {
				
				if(self.isSafari || self.isIE || self.isEdge) {
					send( JSON.stringify( {
						cmd : 'clientCaps',
						src : self.jid,
						protocolVersion : '20',
						imageFormats : [
								'jpg', 'png'
						]
					} ) );
				} else {
					send( JSON.stringify( {
						cmd : 'clientCaps',
						src : self.jid,
						protocolVersion : '20',
						imageFormats : [
								'webp', 'jpg', 'png'
						]
					} ) );
				}
				self.heartBeat();
			}
		}, 15000 );
	};
    this.isForcedCloseRequested = function(){
    	return forcedCloseRequested;
    };
    this.stopSenderThread = function(){
        clearInterval(transmitIntervalId);
        transmitIntervalId = null;
        if(LOGGER.API.isInfo()){
			LOGGER.API.info( LOG_PREFIX, 'Stopped the USS sender thread' );
		}
		
    }
    

	this.sendDataNow = function() {

		if (LOGGER.API.isInfo()) {
			LOGGER.API.info(LOG_PREFIX, 'Send data now, data left='
					+ transmitQueue.length);
		}

		// We can't keep dumping data on the WebSocket, have to check the
		// data buffer and only call ws.send() only if it's empty. A
		// transmit queue holds the data that needs to be sent.
		var _ws = ws;

		for (; transmitQueue.length > 0;) {

			try {
				if (_ws 
						&& self.readyState == WebSocket.OPEN) {

					var data = transmitQueue.shift();
					if (data) {
						if (LOGGER.API.isDevDebug()) {
							LOGGER.API.devDebug(LOG_PREFIX,
									'Sending data to USS',	data);
						}
						_ws.send(data);
					}

				}

			} catch (error) {
				LOGGER.API
						.error(LOG_PREFIX, 'Error sending data to USS', error);
			}
		}
		transmitQueue= [];
	}
    
   
    this.startSenderThread = function(){
            if(transmitIntervalId){
                return;
            }
            if(LOGGER.API.isInfo()){
				LOGGER.API.info( LOG_PREFIX, 'Started USS sender thread, data left=' +  transmitQueue.length );
			}
			
			// We can't keep dumping data on the WebSocket, have to check the
			// data buffer and only call ws.send() only if it's empty. A
			// transmit queue holds the data that needs to be sent.
			var _ws = ws;
			transmitIntervalId = setInterval( function () {
				
				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug( LOG_PREFIX, 'Sender thread is active. Target data size ' +  transmitQueue.length );
				}
				
				try {
					if ( _ws && _ws.bufferedAmount === 0 && self.readyState == WebSocket.OPEN ) {
                        
                            var data = transmitQueue.shift();
                            if ( data ) {
                                if ( data instanceof Uint8Array ) {
                                	if(LOGGER.API.isDevDebug()){
                    					LOGGER.API.devDebug( LOG_PREFIX, 'Sender thread sending binary image data to USS', data );
                    				}
                    				
                                   
                                } else {
                                	if(LOGGER.API.isDevDebug()){
                    					LOGGER.API.devDebug( LOG_PREFIX, 'Sender thread sending data to USS', data);
                    				}
                    				
                                }
                                _ws.send( data );
                            }
                        
					}else{
        				LOGGER.API.warn( LOG_PREFIX, 'Screen share might be slow. Websocket buffer not free to receive next data' );
					}

					//ensure all queued data is send before closing the socket.
					if ( forcedCloseRequested && transmitQueue.length <= 0 ) {
						_ws.close();
					}else if(transmitQueue.length <= 0){
                        self.stopSenderThread();
                    }
                    
                    
				} catch ( error ) {
    				LOGGER.API.error( LOG_PREFIX, 'Error in Sender Thread while sending data to USS', error );
				}
			}, 5 );    
    }
    
        
    this.startImageProcessorThread = function(){
    	var self = this;
        if(!imageProcessorThread){
        	if(LOGGER.API.isDebug()){
    			LOGGER.API.debug( LOG_PREFIX, 'New ImageProcessorThread started.' );
    		}
            imageProcessorThread = setInterval(function(){

                var dataRev = incomingShareDataRevArray.shift();
                if(dataRev){
                	
                    var dataInfo = incomingShareDataRevToDataMap[dataRev];
                    
                    if(dataInfo.isTotalDataReceived){
                    	delete incomingShareDataRevToDataMap[dataRev];
                        if(dataInfo){
                        	processImageData( dataInfo.shareMessage, dataInfo.imageFormat, dataInfo.imageData );
                        }else{
            				LOGGER.API.warn( LOG_PREFIX, 'ImageProcessorThread reported issue - share data info not yet available for rev ' + dataRev );
                        }
                    }else{
                    	incomingShareDataRevArray.unshift(dataRev);
                    }
                    
                    
                }else if(incomingShareDataRevArray.length <=0){
                    self.stopImageProcessorThread();
                   
                }
            
            }, 5);
        }
    }
    this.stopImageProcessorThread = function(){
    	clearInterval(imageProcessorThread);
        imageProcessorThread = null;
        if(LOGGER.API.isDebug()){
			LOGGER.API.debug( LOG_PREFIX, 'ImageProcessorThread stopped - no image data in queue to be processed' );
		}
    }
    

	this.processMessage = function ( message ) {
        if ( ws == null || self.readyState != WebSocket.OPEN){
            return;
        }
		if ( message ) {
			try {
				if ( message.data instanceof ArrayBuffer ) {
                
					var binaryData = new BinaryData();
					binaryData.load( new Uint8Array( message.data ) );
					if(LOGGER.API.isDevDebug()){
	        			LOGGER.API.devDebug( LOG_PREFIX, 'Received binary data.', binaryData );
	        		}
					
					
					if ( binaryData.command == 0 ) {
						if(LOGGER.API.isDebug()){
		        			LOGGER.API.debug( LOG_PREFIX, "Received image binary data for revision, totalblocks, currentBlockIndex "
		        					+ binaryData.revision +", "  + binaryData.totalBlocks + ", " + binaryData.blockIndex  );
		        		}
						
						
						var imageDataBuffer = null;
						var data = incomingShareDataRevToDataMap[binaryData.revision];
						
						if(data != null && data.shareMessage.rev == binaryData.revision){
							
							
							if ( binaryData.blockIndex == 1 ) {
								imageDataBuffer = binaryData.blockData;
							} else {
								imageDataBuffer = data.imageData;
								var buffer = new Uint8Array( imageDataBuffer.length + binaryData.blockData.length );
								buffer.set( imageDataBuffer );
								buffer.set( binaryData.blockData, imageDataBuffer.length );
								imageDataBuffer = buffer;

							}
							data.imageData = imageDataBuffer;
							if ( binaryData.blockIndex == binaryData.totalBlocks ) {
                                data.imageFormat = binaryData.format
                                data.isTotalDataReceived = true;
                                if(LOGGER.API.isDebug()){
        		        			LOGGER.API.debug( LOG_PREFIX, "Image data completely received for  image.Revision, share.Revision =>" + binaryData.revision + ", " +data.shareMessage.rev  );
        		        		}
                                
                                this.startImageProcessorThread();
								
							}else{
								if(LOGGER.API.isDebug()){
        		        			LOGGER.API.debug( LOG_PREFIX, "Waiting for more image data image.Revision, share.Revision =>" + binaryData.revision + ", " +data.shareMessage.rev  );
        		        		}
								
							}
							
							
						}else{
							
                            var msg = (data )? ('Deleting shareDelta block as the new binary Data  has differnet revision for the shareDelta  revision => image.Revision, share.Revision ' + binaryData.revision + ', ' +data.shareMessage.rev) :
                        		'Cound not queue binary Data as shareData is missing for image.revision' + binaryData.revision ; 
                            LOGGER.API.warn( LOG_PREFIX, msg, {"binary": binaryData, "shareDelta":data} );
                            delete incomingShareDataRevToDataMap[binaryData.revision];
                        }
						
					} else {
						self.cursorImageDataBuffer = binaryData.blockData;
						processCursorImageData();
					}
                    

					
				} else {
					// strip CRLF, bug in USS adds CRLF incorrectly
					var msg = message.data.replace( /[\n\r]/g, '' );
					if ( msg && msg.trim().length>0) {
						if(LOGGER.API.isDebug()){
		        			LOGGER.API.debug( LOG_PREFIX, "Received new message from USS " , msg );
		        		}
						
					}
					var data = JSON.parse( msg );
					switch ( data.cmd ) {
						case 'serverCaps':
							// send clientCaps every 15s to keep the websocket alive
							// this is hack for a USS server issue
							// only call onconnected for the first serverCaps
							if ( !self.receivedServerCaps ) {
								self.onconnected({'imageFormats':data.imageFormats});
							}
							self.receivedServerCaps = true;
							break;
						case 'shareBase':
							
							if(LOGGER.API.isInfo()){
			        			LOGGER.API.info( LOG_PREFIX, "Clear queued image data as a base data received for rev="+data.rev );
			        		}
                            //remove previous delta's
						    incomingShareDataRevArray = [];
						    incomingShareDataRevToDataMap = {};
						    incomingShareDataRevArray.push(data.rev);
						    incomingShareDataRevToDataMap[data.rev]={shareMessage:data,  imageData:null, isTotalDataReceived:false};
                            break;
						case 'shareDelta':
							 
							incomingShareDataRevArray.push(data.rev);
						    incomingShareDataRevToDataMap[data.rev]={shareMessage:data, imageData:null,isTotalDataReceived:false};

							break;
						case 'shareCursor':
							self.cursorImageData = data;
							self.cursorImageDataBuffer = null;
							self.oncursorimageupdate(null);
							break;
						case 'roomClosed':
							self.stopImageProcessorThread();
							incomingShareDataRevArray = [];
						    incomingShareDataRevToDataMap = {};
                            self.forcedCloseRequested = true;
                            self.onmessage( data );
                            break;
						case 'joinRoomResult':
						case 'pauseShare':
						case 'stopShare':
						case 'resumeShare':
						case 'startShare':
						case 'createRoomResult':
						case 'setActiveShare':
						case 'userJoined':
						case 'userLeft':
							self.onmessage( data );
							break;
						case 'roleChanged':
							if ( data.uid == self.jid && data.removeRoles && data.removeRoles.indexOf( 'floorholder' ) > -1 ) {
								self.transmitQueue = [];
							}
							self.onmessage( data );
							break;
					}
				}
			} catch ( error ) {
				LOGGER.API.error("USS-API","Exception wile process message: ",error);
			}
		}
	}

	/*
	 * Convert the imageDataBuffer into a Base64 encoded string and call
	 * onupdate() with it.
	 */
	function processImageData( shareMessage, format, imageData ) {
		

		var binary = '';
		var len = imageData.length;
		for ( var i = 0; i < len; i++ ) {
			binary += String.fromCharCode( imageData[ i ] );
		}

		if ( format == 'J' || format == 'j' ) {
			format = 'image/jpeg';
		} else if ( format == 'P' || format == 'p' ) {
			format = 'image/png';
		} else if ( format == 'W' || format == 'w' ) {
			format = 'image/webp';
		}

		
		self.onimageupdate( shareMessage, format, self.isSafari?Encoder.btoa( binary ):btoa( binary ) );
		
	}

	function processCursorImageData () {
		
		var binary = '';
		var len = self.cursorImageDataBuffer.length;
		for ( var i = 0; i < len; i++ ) {
			binary += String.fromCharCode( self.cursorImageDataBuffer[ i ] );
		}
		self.oncursorimageupdate( self.isSafari?Encoder.btoa( binary ):btoa( binary ) );
		self.cursorImageDataBuffer = null;
	}

	function send ( data ) {
        
		if ( ws !== null && self.readyState == WebSocket.OPEN ) {
			if ( transmitQueue.length <= QUEUE_LIMIT ) {
				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("USS-API","Pushing data to queue ", data);
				}
				
				transmitQueue.push( data );
				if(forcedCloseRequested ){
					self.sendDataNow();
		        }
				else{
					self.startSenderThread();
					
		            
				}
				
			} else {
				
				
				LOGGER.API.error( LOG_PREFIX, 'Data queue failed due to transmit queue limit exceeded. '  );
                self.dataqueuefailed();
                transmitQueue= [];
			}

			/*
			 * if (data instanceof Uint8Array) { if (LOGGER.API.isDevDebug()) {
			 * console.log(LOG_PREFIX, 'Sending binary data: ', data); }
			 * ws.send(data.buffer); } else { if (LOGGER.API.isDevDebug()) {
			 * console.log(LOG_PREFIX, 'Sending: ', data); } ws.send(data); }
			 */
		}else{
			LOGGER.API.error( LOG_PREFIX, 'Data queue failed due to invalid state of websocket. ', ws );
		}
	}

	this.start = function (reconnect) {
		connect(reconnect);
	};

	this.stop = function ( src, share, isOwner, isFloorHolder) {
		if ( ws && this.readyState == WebSocket.OPEN ) {
			if(LOGGER.API.isInfo()){
				LOGGER.API.info(LOG_PREFIX,"stopping the USS session");
			}
			forcedCloseRequested = true;
			var self = this;
            
            if(isOwner || isFloorHolder){
                this.stopShare( src, share );
            }
			if ( !isOwner ) {
				this.leaveRoom( src );
				
			} else {
				
				self.closeRoom( src );
			}
			
			if(LOGGER.API.isInfo()){
				LOGGER.API.info(LOG_PREFIX,"Force closing websocket");
			}
			self.stopWS();
			self.ondisconnected({'forcedCloseRequested':forcedCloseRequested});
			self.clean();
			
			
           
		}
	};

	this.joinRoom = function ( src, room, name, token ) {
        if(token){
            send( JSON.stringify( {
                cmd : 'joinRoom',
                src : src,
                roomID : room,
                name : name,
                token : token
            } ) );
        }else{
            send( JSON.stringify( {
			cmd : 'joinRoom',
			src : src,
			roomID : room,
			name : name
		} ) );
        
        }
	};

	this.leaveRoom = function ( src ) {
		send( JSON.stringify( {
			cmd : 'leaveRoom',
			src : src
		} ) );
	};

	this.closeRoom = function ( src ) {
		send( JSON.stringify( {
			cmd : 'closeRoom',
			src : src
		} ) );
	};

	this.createRoom = function ( src, name, capacity, bwu, bwp, bcu, bcp ) {
		send( JSON.stringify( {
			cmd : 'createRoom',
			src : src,
			name : name,
			capacity : capacity,
			bwu : bwu,
			bwp : bwp,
			bcu : bcu,
			bcp : bcp
		} ) );
	};

	this.startShare = function ( src, share, baseQuality, deltaQuality, colorDepth ) {
        
		send( JSON.stringify( {
			cmd : 'startShare',
			src : src,
			share : share,
			baseQuality : baseQuality,
			deltaQuality : deltaQuality,
			colorDepth : colorDepth
		} ) );

		send( JSON.stringify( {
			cmd : 'setActiveShare',
			src : src,
			share : share
		} ) );
	};

	this.shareBase = function ( src, share, rev, hasDelta, screenRect ) {
		send( JSON.stringify( {
			cmd : 'shareBase',
			src : src,
			share : share,
			rev : rev,
			hasDelta : hasDelta,
			screenRect : screenRect
		} ) );
	};

	this.shareDelta = function ( src, share, rev, deltas ) {
		send( JSON.stringify( {
			cmd : 'shareDelta',
			src : src,
			share : share,
			rev : rev,
			deltas : deltas
		} ) );
	};

	this.pauseShare = function ( src, share ) {
		send( JSON.stringify( {
			cmd : 'pauseShare',
			src : src,
			share : share
		} ) );
	};

	this.resumeShare = function ( src, share ) {
		send( JSON.stringify( {
			cmd : 'resumeShare',
			src : src,
			share : share
		} ) );
	};

	this.giveFloor = function ( src, share, to, stopmyshare ) {
        if(stopmyshare){
            //this.stopShare( src, share );
        }
		send( JSON.stringify( {
			cmd : 'giveFloor',
			src : src,
			uid : to
		} ) );

	};

	this.stopShare = function ( src, share ) {
		if(share){
			transmitQueue = [];
			send( JSON.stringify( {
				cmd : 'stopShare',
				src : src,
				share : share
			} ) );

			
		}
        
		send( JSON.stringify( {
			cmd : 'setActiveShare'
		} ) );

	};

	this.shareImage = function ( shareId, imageData, revision, isDelta ) {
		if(!shareId){
			LOGGER.API.warn("USS-API","Could not send ImageData as shareId is missing");
			return;
		}
		var MAX_BLOCK_SIZE = 2048; //4000;
		var format = 'J';
		if ( imageData.indexOf( 'png;' ) > 0 ) {
			format = 'P';
		} else if ( imageData.indexOf( 'webp;' ) > 0 ) {
			format = 'W';
		}
		imageData = imageData.replace( /^data:image\/(png|jpeg|webp);base64,/, '' );
		var decoder = self.isSafari?Encoder.atob:atob;
		
		var bytes = new Uint8Array( decoder( imageData ).split( '' ).map( function ( c ) {
			return c.charCodeAt( 0 );
		} ) );
		var usableBytesPerBlock = MAX_BLOCK_SIZE - 16 - shareId.length;

		var totalBlocks = Math.floor( bytes.length / usableBytesPerBlock );
		var remainder = bytes.byteLength % usableBytesPerBlock;
		if ( remainder > 0 ) {
			totalBlocks++;
		}
		var blockIndex = 1;
		var block = null;
		while ( blockIndex <= totalBlocks ) {
			block = new BinaryData();
			block.length = MAX_BLOCK_SIZE;
			block.command = 0;
			block.revision = revision;
			block.totalBlocks = totalBlocks;
			block.blockIndex = blockIndex;
			block.isDelta = isDelta;
			block.isLowPriority = false;
			block.format = format;
			block.shareIdLength = shareId.length;
			block.shareId = shareId;
			var i = ( blockIndex - 1 ) * usableBytesPerBlock;
			if ( blockIndex == totalBlocks ) {
				if ( remainder != 0 ) {
					block.length = 16 + shareId.length + remainder;
				}
				block.blockData = bytes.subarray( i );
			} else {
				block.blockData = bytes.subarray( i, i + usableBytesPerBlock );
			}
			var blockData = block.serialize();
			blockIndex++;
			send( blockData );
			if ( totalBlocks > 0 ) {
				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("USS-API",'Queued data to be send to USS ' 
							+ bytes.length + ' bytes of image data in ' + totalBlocks + ' blocks', 
							{shareId:shareId, imageData:imageData, revision:revision, isDelta:isDelta});
				}

			
			}
		}
	};
};

/**
 * Simple class to handle USS binary data blocks.
 */
function BinaryData () {
	this.length = -1;
	this.command = -1;
	this.revision = -1;
	this.totalBlocks = -1;
	this.blockIndex = -1;
	this.isDelta = false;
	this.isLowPriority = false;
	this.format = '';
	this.shareIdLength = -1;
	this.shareId = '';
	this.blockData = null;

	this.load = function ( rawData ) {
		this.length = ( ( rawData[ 0 ] & 15 ) << 16 ) + ( rawData[ 1 ] << 8 ) + rawData[ 2 ];
		this.command = rawData[ 3 ] & 1;
		if ( this.command == 0 ) {
			// Share Image
			this.revision = ( rawData[ 4 ] << 32 ) + ( rawData[ 5 ] << 16 ) + ( rawData[ 6 ] << 8 ) + rawData[ 7 ];
			this.totalBlocks = ( rawData[ 8 ] << 8 ) + rawData[ 9 ];
			this.blockIndex = ( rawData[ 10 ] << 8 ) + rawData[ 11 ];
			this.isDelta = ( rawData[ 12 ] & 128 ) == 128;
			this.isLowPriority = ( rawData[ 12 ] & 64 ) == 64;
			this.format = String.fromCharCode( rawData[ 13 ] );
			this.shareIdLength = ( rawData[ 14 ] << 8 ) + rawData[ 15 ];
			this.shareId = '';
			for ( var i = 16; i < this.shareIdLength + 16; i++ ) {
				this.shareId = this.shareId + String.fromCharCode( rawData[ i ] );
			}
			this.blockData = rawData.subarray( i );
		} else {
			// Share Cursor Image
			this.shareIdLength = ( rawData[ 4 ] << 8 ) + rawData[ 5 ];
			for ( var i = 6; i < this.shareIdLength + 6; i++ ) {
				this.shareId = this.shareId + String.fromCharCode( rawData[ i ] );
			}
			this.blockData = rawData.subarray( i );
		}
	};

	this.serialize = function () {
		var buffer = new Uint8Array( this.length );
		var view = new DataView( buffer.buffer );
		// First 8 bits are 0101 0000
		view.setUint8( 0, 80 );
		// Length of block <= 4096
		view.setUint16( 1, this.length );
		view.setUint8( 3, this.command );
		view.setUint32( 4, this.revision );
		view.setUint16( 8, this.totalBlocks );
		view.setUint16( 10, this.blockIndex );
		if ( this.isDelta && this.isLowPriority ) {
			view.setUint8( 12, 192 );
		} else if ( this.isDelta ) {
			view.setUint8( 12, 128 );
		} else if ( this.isLowPriority ) {
			view.setUint8( 12, 64 );
		} else {
			view.setUint8( 12, 0 );
		}
		view.setUint8( 13, this.format.charCodeAt( 0 ) );
		view.setUint16( 14, this.shareIdLength );
		for ( var i = 0; i < this.shareIdLength; i++ ) {
			view.setUint8( 16 + i, this.shareId.charCodeAt( i ) );
		}
		for ( var j = 0; j < this.blockData.length; j++ ) {
			view.setUint8( 16 + this.shareIdLength + j, this.blockData[ j ] );
		}
		return buffer;
	};

	this.toString = function () {
		if ( this.command == 0 ) {
			return 'length=' + this.length + ' command=' + this.command + ' revision=' + this.revision + ' totalBlocks=' + this.totalBlocks + ' blockIndex=' + this.blockIndex + ' isDelta='
					+ this.isDelta + ' isLowPriority=' + this.isLowPriority + ' format=' + this.format + ' shareIdLength=' + this.shareIdLength + ' shareId=' + this.shareId;
		} else {
			return 'length=' + this.length + ' command=' + this.command + ' shareIdLength=' + this.shareIdLength + ' shareId=' + this.shareId;
		}
	};
};