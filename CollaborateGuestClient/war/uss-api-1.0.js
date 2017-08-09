/*!
 * jquery.base64.js 0.1 - https://github.com/yckart/jquery.base64.js
 * Makes Base64 en & -decoding simpler as it is.
 *
 * Based upon: https://gist.github.com/Yaffle/1284012
 *
 * Copyright (c) 2012 Yannick Albert (http://yckart.com)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 * 2013/02/10
 **/


var Encoder = {};

(function(Encoder){
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", a256 = '', r64 = [
		256
	], r256 = [
		256
	], i = 0;

	var UTF8 = {

		/**
		 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters
		 * (BMP / basic multilingual plane only)
		 *
		 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
		 *
		 * @param {String} strUni Unicode string to be encoded as UTF-8
		 * @returns {String} encoded string
		 */
		encode : function ( strUni ) {
			// use regular expressions & String.replace callback function for better efficiency
			// than procedural approaches
			var strUtf = strUni.replace( /[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
			function ( c ) {
				var cc = c.charCodeAt( 0 );
				return String.fromCharCode( 0xc0 | cc >> 6, 0x80 | cc & 0x3f );
			} ).replace( /[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
			function ( c ) {
				var cc = c.charCodeAt( 0 );
				return String.fromCharCode( 0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f );
			} );
			return strUtf;
		},

		/**
		 * Decode utf-8 encoded string back into multi-byte Unicode characters
		 *
		 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
		 * @returns {String} decoded string
		 */
		decode : function ( strUtf ) {
			// note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
			var strUni = strUtf.replace( /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars
			function ( c ) { // (note parentheses for precence)
				var cc = ( ( c.charCodeAt( 0 ) & 0x0f ) << 12 ) | ( ( c.charCodeAt( 1 ) & 0x3f ) << 6 ) | ( c.charCodeAt( 2 ) & 0x3f );
				return String.fromCharCode( cc );
			} ).replace( /[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars
			function ( c ) { // (note parentheses for precence)
				var cc = ( c.charCodeAt( 0 ) & 0x1f ) << 6 | c.charCodeAt( 1 ) & 0x3f;
				return String.fromCharCode( cc );
			} );
			return strUni;
		}
	};

	while ( i < 256 ) {
		var c = String.fromCharCode( i );
		a256 += c;
		r256[ i ] = i;
		r64[ i ] = b64.indexOf( c );
		++i;
	}

	function code ( s, discard, alpha, beta, w1, w2 ) {
		s = String( s );
		var buffer = 0, i = 0, length = s.length, result = '', bitsInBuffer = 0;

		while ( i < length ) {
			var c = s.charCodeAt( i );
			c = c < 256 ? alpha[ c ] : -1;

			buffer = ( buffer << w1 ) + c;
			bitsInBuffer += w1;

			while ( bitsInBuffer >= w2 ) {
				bitsInBuffer -= w2;
				var tmp = buffer >> bitsInBuffer;
				result += beta.charAt( tmp );
				buffer ^= tmp << bitsInBuffer;
			}
			++i;
		}
		if ( !discard && bitsInBuffer > 0 )
			result += beta.charAt( buffer << ( w2 - bitsInBuffer ) );
		return result;
	}

	base64 = function ( dir, input, encode ) {
		return dir ? null : this;
	};

	btoa = encode = function ( plain, utf8encode ) {
		plain = utf8encode ? UTF8.encode( plain ) : plain;
		plain = code( plain, false, r256, b64, 8, 6 );
		return plain + '===='.slice( ( plain.length % 4 ) || 4 );
	};

	atob = decode = function ( coded, utf8decode ) {
		coded = String( coded ).split( '=' );
		var i = coded.length;
		do {
			--i;
			coded[ i ] = code( coded[ i ], true, r64, a256, 6, 8 );
		} while ( i > 0 );
		coded = coded.join( '' );
		return utf8decode ? UTF8.decode( coded ) : coded;
	};
	
	Encoder.atob = atob;
	Encoder.btoa = btoa;
}(Encoder));



	
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
	// console.log("uss-api command: "+e.data.cmd);
	switch ( e.data.cmd ) {

		case 'init':
			uss = new USS( e.data.message.ussUrl, e.data.message.src, e.data.message.isSafari, e.data.message.isIE, e.data.message.isEdge );

			uss.logLevel = 1;
			uss.onconnected = function (serverCaps) {
				sendMessage( 'onConnected', serverCaps );

			};

			uss.ondisconnected = function (message) {
				sendMessage( 'onDisconnect', message );
			};
            uss.onchannelreconnected = function(){
                sendMessage( 'channelReconnected', '' );
            }
			uss.onmessage = function ( message ) {
				// console.log("uss-api event: "+message.cmd);
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
				}
			};

			uss.onimageupdate = function ( shareMessage, format, imageData ) {
				if ( shareMessage.cmd == 'shareBase' ) {
					sendMessage( 'onShareBaseUpdate', {
						shareMessage : shareMessage,
						format : format,
						imageData : imageData
					} );
				} else {
					sendMessage( 'onDeltaUpdate', {
						shareMessage : shareMessage,
						format : format,
						imageData : imageData
					} );
				}
			};

			uss.oncursorimageupdate = function ( imageData ) {
				if ( this.cursorImageData ) {
					sendMessage( 'onShareCursorUpdate', {
						format : 'image/png',
						imageData : imageData,
						posX : this.cursorImageData.posX,
						posY : this.cursorImageData.posY
					} );
				}

			};
            
            uss.dataqueuefailed= function(){
            
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
			if ( uss ) {
				uss.shareBase( e.data.message.src, e.data.message.share, e.data.message.rev, e.data.message.hasDelta, e.data.message.screenRect );
			}

			break;

		case 'shareImage':
			if ( uss ) {

				uss.shareImage( e.data.message.share, e.data.message.imageData, e.data.message.rev, e.data.message.hasDelta );
			}

			break;

		case 'shareDelta':
			if ( uss ) {

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

	this.logLevel = 1; // higher level means more detailed logging, 0 is off
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
			console.info( LOG_PREFIX, 'Opening WebSocket (reconnect=' + reconnect + ').' );
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
			console.info( LOG_PREFIX, 'Timeout happened while waiting for WebSocket to connect.' );
			localWs.close();
		}, 4000 );

		ws.onopen = function ( event ) {
			console.info( LOG_PREFIX, 'WebSocket opened.' );
			clearTimeout( timeout );
			self.readyState = WebSocket.OPEN;
            if ( reconnect ){
                self.onchannelreconnected();
                reconnect = false;
            }
			if ( self.logLevel > 2 ) {
				console.log( LOG_PREFIX, 'Initiating Sender thread.' );
			}
            self.startSenderThread();
            
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
			console.log( LOG_PREFIX, 'WebSocket closed.' + ' Code:' + event.code + ' Reason:' + event.reason );
            transmitQueue = [];
            clearTimeout( timeout );
            self.stopSenderThread();
            if(forcedCloseRequested){
                self.ondisconnected();
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
			console.error( LOG_PREFIX, 'WebSocket error. ' + event.name + ' ' + event.message );
			self.ondisconnected({forcedCloseRequested:forcedCloseRequested});
			self.clean();

		};
	}

	this.clean = function () {
		if ( ws ) {
			try{ws.close();}catch(e){}
			ws.onopen = null;
			ws.onclose = null;
			ws.onmessage = null;
			ws.onerror = null;
			ws = null;
		}
        ws = null;
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
    
    this.stopSenderThread = function(){
        clearInterval(transmitIntervalId);
        transmitIntervalId = null;
		if ( self.logLevel > 2 ) {
			console.log( LOG_PREFIX, 'sender thread stopped ');
		}

    }
   
    this.startSenderThread = function(){
            if(transmitIntervalId){
                return;
            }
			if ( self.logLevel > 2 ) {
				console.log( LOG_PREFIX, 'sender thread started ');
			}
			// We can't keep dumping data on the WebSocket, have to check the
			// data buffer and only call ws.send() only if it's empty. A
			// transmit queue holds the data that needs to be sent.
			var _ws = ws;
			transmitIntervalId = setInterval( function () {
				if ( self.logLevel > 3 ) {
					console.log( LOG_PREFIX, 'sender thread running. target data size ' +  transmitQueue.length);
				}
				try {
					if ( _ws && _ws.bufferedAmount === 0 && self.readyState == WebSocket.OPEN ) {
                        
                            var data = transmitQueue.shift();
                            if ( data ) {
                                if ( data instanceof Uint8Array ) {
                                    if ( self.logLevel > 3 ) {
                                        console.log( LOG_PREFIX, 'Sending binary data: ', data );
                                    }
                                } else {
                                    if ( self.logLevel > 0 ) {
                                        console.log( LOG_PREFIX, 'Sending: ', data );
                                    }
                                }
                                _ws.send( data );
                            }
                        
					}

					//ensure all queued data is send before closing the socket.
					if ( forcedCloseRequested && transmitQueue.length <= 0 ) {
						_ws.close();
					}else if(transmitQueue.length <= 0){
                        self.stopSenderThread();
                    }
                    
                    
				} catch ( error ) {
					console.log( LOG_PREFIX, 'Error while sending data to websocket', error );
				}
			}, 5 );    
    }
    
        
    this.startImageProcessorThread = function(){
    	var self = this;
        if(!imageProcessorThread){
            imageProcessorThread = setInterval(function(){
                var dataRev = incomingShareDataRevArray.shift();
                if(dataRev){
                	
                    var dataInfo = incomingShareDataRevToDataMap[dataRev];
                    
                    if(dataInfo.isTotalDataReceived){
                    	delete incomingShareDataRevToDataMap[dataRev];
                        if(dataInfo){
                        	processImageData( dataInfo.shareMessage, dataInfo.imageFormat, dataInfo.imageData );
                        }else{
                        	console.error( LOG_PREFIX, 'SSInfo:startImageProcessorThread :share data info not available for rev' + dataRev );
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
		if ( self.logLevel > 2 ) {
			console.log( LOG_PREFIX, 'ImageProcessorThread stopped ');
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
					if ( self.logLevel > 3 ) {
						console.log( LOG_PREFIX, 'Received Binary Data: ', binaryData );
					}
					
					if ( binaryData.command == 0 ) {
						if ( self.logLevel > 2 ) {
							console.log( LOG_PREFIX, "SSInfo:processMessage : processing image for revision, totalblocks, currentBlockIndex " + binaryData.revision +", "  + binaryData.totalBlocks + ", " + binaryData.blockIndex );
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
                                if ( self.logLevel > 2 ) {
                                	console.log( LOG_PREFIX, "SSInfo:processMessage populating image for image.Revision, share.Revision " + binaryData.revision + ", " +data.shareMessage.rev );
                                }
                                this.startImageProcessorThread();
								
							}else{
								 if ( self.logLevel > 2 ) {
									 console.log( LOG_PREFIX, "SSInfo:processMessage wating for more blocks for image revision " + binaryData.revision );
								 }
							}
							
							
						}else{
                            var msg = (data )? ('SSInfo:processMessage populating image Cound not queue binary Data as shareData has differnet revision than the binary image => image.Revision, share.Revision ' + binaryData.revision + ', ' +data.shareMessage.rev) :
                        		'SSInfo:processMessage : Cound not queue binary Data as shareData is missing for image.revision' + binaryData.revision ; 
                            console.error( LOG_PREFIX, msg );
                        }
						
					} else {
						self.cursorImageDataBuffer = binaryData.blockData;
						processCursorImageData();
					}
                    

					
				} else {
					// strip CRLF, bug in USS adds CRLF incorrectly
					var msg = message.data.replace( /[\n\r]/g, '' );
					if ( self.logLevel > 0 && msg && msg.trim().length>0) {
						console.debug( LOG_PREFIX, 'Received: ', msg );
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
							 if ( self.logLevel > 2 ) {
								 console.log( LOG_PREFIX, 'SSInfo:processMessage:  share cmd : ', data.rev );
							 }
						    
                            //remove previous delta's
						    incomingShareDataRevArray = [];
						    incomingShareDataRevToDataMap = {};
						    incomingShareDataRevArray.push(data.rev);
						    incomingShareDataRevToDataMap[data.rev]={shareMessage:data,  imageData:null, isTotalDataReceived:false};
                            break;
						case 'shareDelta':
							 if ( self.logLevel > 2 ) {
								 console.log( LOG_PREFIX, 'SSInfo:processMessage:  share cmd : ', data.rev );
							 }
							incomingShareDataRevArray.push(data.rev);
						    incomingShareDataRevToDataMap[data.rev]={shareMessage:data, imageData:null,isTotalDataReceived:false};

							break;
						case 'shareCursor':
							//if ( data.newImage ) {
								self.cursorImageData = data;
								self.cursorImageDataBuffer = null;
								self.oncursorimageupdate(null);
							//}
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
				console.log( error );
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

		if ( self.logLevel > 2 ) {
			console.log( LOG_PREFIX, 'Sending shareImage for rev ' + shareMessage.rev );
		}
		self.onimageupdate( shareMessage, format, self.isSafari?Encoder.btoa( binary ):btoa( binary ) );
		
	}

	function processCursorImageData () {
		if ( self.logLevel > 3 ) {
			console.log( LOG_PREFIX, 'Processing ' + self.cursorImageDataBuffer.length + ' bytes of cursor image data' );
		}

		var binary = '';
		var len = self.cursorImageDataBuffer.length;
		for ( var i = 0; i < len; i++ ) {
			binary += String.fromCharCode( self.cursorImageDataBuffer[ i ] );
		}
		self.oncursorimageupdate( self.isSafari?Encoder.btoa( binary ):btoa( binary ) );
		self.cursorImageDataBuffer = null;
	}

	function send ( data ) {
        
        self.startSenderThread();
		if ( ws !== null && self.readyState == WebSocket.OPEN && !forcedCloseRequested ) {
			if ( transmitQueue.length <= QUEUE_LIMIT ) {
				if ( self.logLevel > 3 ) {
					console.log( LOG_PREFIX, "queue size: " + transmitQueue.length );
				}
				transmitQueue.push( data );
			} else {
				console.error( LOG_PREFIX, 'Transmit queue limit exceeded. Sender thread present ' + (transmitIntervalId != null) );
                self.dataqueuefailed();
                transmitQueue= [];
			}

			/*
			 * if (data instanceof Uint8Array) { if (self.logLevel > 1) {
			 * console.log(LOG_PREFIX, 'Sending binary data: ', data); }
			 * ws.send(data.buffer); } else { if (self.logLevel > 0) {
			 * console.log(LOG_PREFIX, 'Sending: ', data); } ws.send(data); }
			 */
		}
	}

	this.start = function (reconnect) {
		connect(reconnect);
	};

	this.stop = function ( src, share, isOwner, isFloorHolder) {
		if ( ws && this.readyState == WebSocket.OPEN ) {
			console.log( LOG_PREFIX, ' Force closing WebSocket.' );

			var self = this;
            
            if(isOwner || isFloorHolder){
                this.stopShare( src, share );
            }
			if ( !isOwner ) {
				this.leaveRoom( src );
				
			} else {
				
				self.closeRoom( src );
			}
            forcedCloseRequested = true;
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
        transmitQueue = [];
		send( JSON.stringify( {
			cmd : 'stopShare',
			src : src,
			share : share
		} ) );

		send( JSON.stringify( {
			cmd : 'setActiveShare'
		} ) );
        

	};

	this.shareImage = function ( shareId, imageData, revision, isDelta ) {
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
				if ( self.logLevel > 2) {
					console.log( LOG_PREFIX, 'Queued ' + bytes.length + ' bytes of image data in ' + totalBlocks + ' blocks' );
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