var SIP = SIP || {};
ExSIP.C.USER_AGENT = 'UC-One Communicator Desktop-Chrome - '+ ExSIP.version;

(function(SIP) {
	var Utils;

	Utils= {

	  // Generate a random userid
	  randomUserid: function()  {
						    var chars = "0123456789abcdef";
						    var string_length = 10;
						    var userid = '';
						    for (var i=0; i<string_length; i++)
						    {
						      var rnum = Math.floor(Math.random() * chars.length);
						      userid += chars.substring(rnum,rnum+1);
						    }
						    return userid;
					 },
					 
					 
		parseDTMFTones: function(destination) {
						    if(!destination) {
						      return null;
						    }
						    var dtmfMatch = destination.match(/,[0-9A-D#*,]+/, '');
						    return dtmfMatch ? dtmfMatch[0] : null;
					  },
		getTranslatedResolution : function(videoSizeText){
							var resolution = {width:640, height:480};
							  if(videoSizeText == "R_320x180") {
								  resolution.width = 320;
								  resolution.height = 180;
							  } else if(videoSizeText == "R_320x240") {
								  resolution.width = 320;
								  resolution.height = 240;
							  }else if(videoSizeText == "R_640x360") {
								  resolution.width = 640;
								  resolution.height = 360;
							  }else if(videoSizeText == "R_640x480") {
								  resolution.width = 640;
								  resolution.height = 480;
							  } else if(videoSizeText == "R_960x720") {
								  resolution.width = 960;
								  resolution.height = 720;
							  } else if(videoSizeText == "R_1280x720") {
								  resolution.width = 1280;
								  resolution.height = 720;
							  }else {
								  resolution.width = 640;
								  resolution.height = 480;
							  }

							return resolution;
						}
					 
					 
	};

	SIP.Utils = Utils;
}(SIP));

SIP.Controller = function () {
	
	var MODULE = "exSipController.js";
	var ua = null;
	var isInit = false; //checks if the WRS initialization has started or not.
	var state = 'terminated'; //disconnecting, disconnected, connecting, connected, terminating, terminated
    var lastPublishedConnectionState = "";


    var wrsConfig = {};
	var exSipConfig = null;
        
    var MAX_RECONNECT_ATTEMPT = 2;    
    var reconnectattempt = 0;
    var reconnectTimeOutId = null;
	var lastactivesession = null;
    var isDisconnectRequested = false;
    
    var lastCallDetails;
	
	
	var SIPHandler = {
		onConnected : function () {
		},
		onDisconnected : function (retryLeft) {
		},
		onNewCallSession : function ( callSession ) {
		}
	};


	
	var getExSIPConfig = function(){
		var userid = SIP.Utils.randomUserid();
		var sip_uri = encodeURI(userid);
		if ((sip_uri.indexOf("@") === -1)) {
	        sip_uri = (sip_uri + "@" + wrsConfig.domainFrom);
	    }
		
		var websocketsServers = [];
		var wsAddressListArray = wrsConfig.wrsAddress
				.split(",");
		for (count = 0; count < wsAddressListArray.length; count++) {
			var new_obj = {
				'ws_uri' : wsAddressListArray[count]
			};
			websocketsServers.push(new_obj);
		}

	
	    var config  = {
	        'uri': sip_uri,
	        'authorization_user': userid,
	        'ws_servers': websocketsServers ,
	        'stun_servers': 'stun:' + wrsConfig.stun_servers + ':' + wrsConfig.stunPort,
	        'trace_sip': wrsConfig.trace_sip,
	        'enable_ims': wrsConfig.enable_ims,
	        'register' : false,
	    };

	      return config;
	}
	
	function init ( config) {
		wrsConfig = config;
		exSipConfig = getExSIPConfig();
        connect(exSipConfig);
    }
	function getUri(){
		if(ua)return "" + ua.configuration.uri;
		else if(exSipConfig)return exSipConfig.uri;
		return "";
	}
	function connect(configuration){
        ua = new ExSIP.UA( configuration );
		ua.setRtcMediaHandlerOptions( {
			'reuseLocalMedia' : false,
			'disableICE' : true,
			'RTCConstraints' : {
				'optional' : [
					{
						'DtlsSrtpKeyAgreement' : true
					}
				],
				'mandatory' : {}
			}
		} );

		ua.on( 'connected', function ( e ) {
			if(state != 'connecting')return;
            if(reconnectTimeOutId){
                clearTimeout( reconnectTimeOutId );
                reconnectTimeOutId = null;
            }
            
            if(LOGGER.API.isInfo()){
            	LOGGER.API.info( MODULE, 'Successfully connected to WebRTC Session' );
            }
			state = 'connected';
			_resetReconnectAttempt();
            if(lastPublishedConnectionState != state){
                lastPublishedConnectionState = state;
                SIPHandler.onConnected();
            }
			
            if(lastCallDetails){
            	setTimeout(function(){
            		_processCall(lastCallDetails);
            	},5);
            }
		} );
		ua.on( 'disconnected', function ( e ) {
			if(state == 'terminated')return;
			if(reconnectTimeOutId){
                clearTimeout( reconnectTimeOutId );
                reconnectTimeOutId = null;
            }

            if(LOGGER.API.isInfo()){
            	LOGGER.API.info( MODULE, 'Disconnected from WebRTC Session' );
            }
			if(lastactivesession || state == 'terminated'){
				reconnectattempt = MAX_RECONNECT_ATTEMPT;
			}
			onDisconnect();
		} );
		ua.on( 'newRTCSession', function ( e ) {
			if(state != 'connected')return;

            if(LOGGER.API.isInfo()){
            	LOGGER.API.info( MODULE, 'New Call session created' );
            }
			if(wrsConfig.isOutgoingCallSelected){
                Sound.playDtmfRingback();
            }
			var callSession = new SIP.CallSession( ExSIPSession, e.data );
			callSession.setConferenceDetails({
				isConfCall : true,
				conferenceId : lastCallDetails.confId,
				securityPin : lastCallDetails.securityPin,
				isConfDetailsSent : false,
				enableSendingConfIdAsSipUriHeader : wrsConfig.enableSendingConfIdAsSipUriHeader
				
			});

			SIPHandler.onNewCallSession( callSession );
            
		} );

		ua.on( 'newMessage', function ( e ) {
			if(state == 'terminated')return;

            if(LOGGER.API.isInfo()){
            	LOGGER.API.info( MODULE, 'New SIP Message received ' + e);
            }
			var message = event.data.message;

		} );
		ua.on( 'registered', function ( e ) {
			if(state != 'connected')return;
			
			if(LOGGER.API.isInfo()){
            	LOGGER.API.info( MODULE, 'Device registered' + e);
            }
			
			deviceState = 'registered';
			SIPHandler.onRegistered();
			
		} );

		ua.on( 'unregistered', function ( e ) {
			if(state != 'connected')return;
			if(LOGGER.API.isInfo()){
            	LOGGER.API.info( MODULE, 'Device unregistered' + e);
            }
			deviceState = 'unregistered';
			SIPHandler.onUnregistered();
			register();
		} );

		ua.on( 'registrationFailed', function ( e ) {
			if(state != 'connected')return;
			
			if(LOGGER.API.isInfo()){
            	LOGGER.API.info( MODULE, 'Device registration failed' + e);
            }
			
			deviceState = 'unregistered';
			SIPHandler.onRegistrationFailed();
			register();
		} );

		ua.on( 'onReInvite', function ( e ) {
			if(state != 'connected')return;
			if(LOGGER.API.isInfo()){
            	LOGGER.API.info( MODULE, 'Reinvite received' + e);
            }

			e.data.session.acceptReInvite();
		} );
        state = 'connecting';
        isInit = true;
        if(LOGGER.API.isInfo()){
        	LOGGER.API.info( MODULE, 'SIP:Connecting to WRS' );
        }
        try{
        	
        	ua.start();
        }catch(e){
        	LOGGER.API.warn(MODULE, "Exception while connecting and establishing WebRTC session", e);
        }
	}
	
	function updateWrsConfig(isIncomingCallSelected) {
		wrsConfig.isIncomingCallSelected = isIncomingCallSelected;
	}



	function terminate () {
		if(state == 'terminated')return;
		
		if(LOGGER.API.isInfo()){
			LOGGER.API.info( MODULE, "Terminating WRS connection" );
		}
		
		
		state = 'terminating';
        if(reconnectTimeOutId){
            clearTimeout( reconnectTimeOutId );
            reconnectTimeOutId = null;
        }
        reconnectattempt = 0;
        lastCallDetails = null;
        
        if(lastactivesession) {
            try{
            	lastactivesession.forceTerminate();
            	
            }catch(err){
                LOGGER.API.warn( MODULE, "Error while force terminate ", err );
            }
        }
        lastactivesession = null;
        
        SIPHandler.onConnected = function () {};
        SIPHandler.onDisconnected = function () {};
        SIPHandler.onNewCallSession = function () {};
 
        

        
		try {
			ua.on( 'connected', function ( e ) { } );
			ua.on( 'disconnected', function ( e ) { } );
			ua.on( 'newRTCSession', function ( e ) { } );
			ua.on( 'newMessage', function ( e ) { } );
			ua.on( 'registered', function ( e ) { } );
			ua.on( 'unregistered', function ( e ) { } );
			ua.on( 'registrationFailed', function ( e ) { } );
			ua.on( 'onReInvite', function ( e ) {} );
			ua.stop();
		} catch ( error ) {
		}
		ua = null;
        state = 'terminated';
        wrsConfig = {};
    	exSipConfig = null;
    	isInit = false; //checks if the WRS initialization has started or not.
        lastPublishedConnectionState = "";

        isDisconnectRequested = false;
	}

	//document.addEventListener( 'keypress', onKeyPress );

	function onKeyPress ( e ) {
        var charCode = e.charCode;
        sendDTMFToActiveSession(charCode);
	}
    function sendDTMFToActiveSession(charKey){
		if ( ua && lastactivesession ) {
			if(isValidDTMFInput(charKey)){
				lastactivesession.sendDTMF( charKey, getDTMFOptions() );
			}
		}    
    }
    

	function isValidDTMFInput(charKey) {
		/*
		 * Currently only '#' allowed when DTMF is entered manually to keep the
		 * same behaviour as 3.x.
		 * 
		 * It is to be noted that if * and other numbers are allowed, then a
		 * user can mute/unmute a call by dialling a DTMF as 1. However, there
		 * is no mute/unmute event fired by the framework and hence the mute
		 * button will not reflect the exact state. This is another reason why
		 * the other codes are not allowed for manual DTMF
		 */
		// return charKey && charKey.match(/^[0-9#*]$/, '');
		return charKey && charKey.match(/^[#]$/, '')
	}

    function reconnect(){
    	isDisconnectRequested = false;
    	_resetReconnectAttempt();
    	if(state == 'disconnected' || !ua){
    		reconnectMe();
    	}
        //if the ua is still connected, no need to work on ua, simple call SIPHandler.onConnected to notify the view.
        else if(ua.isConnected()){
            if(lastPublishedConnectionState != state){
                lastPublishedConnectionState = state;
                SIPHandler.onConnected();
            }
    		
    	}
    }
    function _resetReconnectAttempt(){
    	reconnectattempt = 0;
    }
	function reconnectMe () {
		if(state == 'terminated'){
			//return if already in reconnecting state
			return;
		}
		
		if(reconnectTimeOutId){
			//return if already in reconnecting state
			return;
		}
        if ( reconnectattempt >= MAX_RECONNECT_ATTEMPT ) {
        	SIPHandler.onDisconnected(MAX_RECONNECT_ATTEMPT-reconnectattempt);
        	lastCallDetails = null;
        	_resetReconnectAttempt();
        	return;
        }
        var wait = ( Math.pow( 2, reconnectattempt ) * 5000 ) + Math.floor( Math.random() * 11 ) * 1000;

        reconnectattempt++;
        reconnectTimeOutId = setTimeout( function () {
        	if(LOGGER.API.isInfo()){
        		LOGGER.API.info( MODULE, "Reconnect to WRS" );
        	}
            try{
                connect(exSipConfig);
            }catch(e){
            	LOGGER.API.warn( MODULE, "Reconnect failure to WRS due to " + e );
                if(reconnectTimeOutId){
                    clearTimeout( reconnectTimeOutId );
                    reconnectTimeOutId = null;
                }
                reconnectMe();
            }
        }, wait );
		
	}    

	function onDisconnect() {
		var oldState = state;
		
		
		 //if  not terminated, then try to reconnect    
		if(state != 'terminating' && state != 'terminated'){
			state = 'disconnected'; 
			disconnectMe();
            //now reconnect
			if(oldState != 'disconnecting' && !isDisconnectRequested){
				reconnectMe();
			}
            
        }
	}
    
    
	function disconnect(){
		/*It is observed that even though you call ua.stop(), the underlaying webstock actually does not dies immediately.
		 * So when you next time open a new ExSip.UA, you are actually having two and both create a problem resulting into call unavailable.
         The flag isDisconnectRequested does not stops the ua immediately, but waits for the ExSip to detect any network loss and call onDisconnect() handler.
         If the isDisconnectRequested is true, then the ExSipController does not goes for reconnect() immediately but waits for reconnect call from the external.
         If the flag is false, the reconnection logic follows normally.*/
		isDisconnectRequested = true;
		if(lastPublishedConnectionState != state){
            lastPublishedConnectionState = state;
        }
	}
	function disconnectMe() {
		
        if(lastactivesession) {
            try{
            	lastactivesession.forceTerminate();
            	
            }catch(err){
                LOGGER.API.warn( MODULE, "exSipController.js:: Error while force terminate ", err );
            }
        }
        lastactivesession = null;

        if(lastPublishedConnectionState != state){
            lastPublishedConnectionState = state;
            SIPHandler.onDisconnected(3-reconnectattempt);
        }
        
        if(ua){
            try {
                ua.stop();
            } catch ( error ) {
            }
            ua = null;
        }
        

        if(state != 'terminating' && state != 'terminated' && state != 'disconnected'){
            state = 'disconnecting';
        }
	}

	function validateDestination(destination)  {
      if (destination.indexOf("sip:") === -1)
      {
        destination = ("sip:" + destination);
      }
      
      /* if (!this.configuration.allowOutside && !new RegExp("[.||@]"+this.configuration.domainTo).test(destination) )
      {
        this.message(this.configuration.messageOutsideDomain, "alert");
        return(false);
      }*/
      
      if ((destination.indexOf("@") === -1))
      {
        destination = (destination + "@" + wrsConfig.domainTo);
      }
      
      var domain = destination.substring(destination.indexOf("@"));
      if(domain.indexOf(".") === -1) {
        destination = destination + "." + wrsConfig.domainTo;
      }

      // WEBRTC-35 : filter out dtmf tones from destination
      return destination.replace(/,[0-9A-D#*,]+/, '');
    }
	
	function getLastCallSession(){
		return lastactivesession;
	}
	function endLastCall () {
		if(lastactivesession){
			lastactivesession.endCall();
		}
		lastCallDetails = null;
	}
	
	function muteLastCall(){
		if(lastactivesession){
			lastactivesession.mute();
		}
	}
	
	function unMuteLastCall(){
		if(lastactivesession){
			lastactivesession.unmute();
		}
	}
	
	function switchVideoOfLastCall(){
		if(lastactivesession){
			lastactivesession.switchVideo();
		}
	}
	
	function call ( calldetails) {
		if(state == 'connected'){
			endLastCall();
			lastCallDetails = calldetails;
			_processCall(calldetails);
		}else{
			lastCallDetails = calldetails;
		}
		
	}
	
	function _processCall(calldetails){
		
		
		var destination = calldetails.number;
		var isVideo = calldetails.isVideo

		
		if(wrsConfig.enableSendingConfIdAsSipUriHeader){
			var confid = calldetails.confId.replace("#","");
			if(calldetails.confType.toUpperCase()=="UVS"){
				destination = validateDestination(destination+";roomid="+confid)+";user=phone";
			}else{
				destination = validateDestination(destination+";confid="+confid)+";user=phone";
			}
		}else{
			destination = validateDestination(destination);
		}	
		
		if ( ua.isConnected()) {
			try {
	
				
				var rtcSession = ua.call( destination, getExSIPOptions( isVideo ) );
				rtcSession.on( 'failed', function ( event ) {
					
					var cause = (event.data &&  event.data.cause) ? event.data.cause : "Unknown";
					LOGGER.API.warn( MODULE, "Terminating Call Session: call failed for cause "+ cause + "=>", event );
					
					if(reconnectTimeOutId){
		                clearTimeout( reconnectTimeOutId );
		                reconnectTimeOutId = null;
		            }

		           
		            reconnectattempt = MAX_RECONNECT_ATTEMPT;
					onDisconnect();

				});
				return {
					result : true
				};
			} catch ( error ) {
				state = 'onhook';
				return {
					result : false,
					message : error.message
				};

			}
		}
        
        return false;
	}

	function removeCallSession ( callSession ) {

		if ( lastactivesession === callSession ) {
			lastactivesession = null;
		}
	}

	function onCallHold ( callSession ) {
	}



    
	function updateUserMedia ( options ) {
		ua.setRtcMediaHandlerOptions( options );
	}

	function getExSIPOptions ( videoEnabled ) {
		videoEnabled = wrsConfig.isVideoAllowed && videoEnabled;
		
	    var options = {
	      'mediaConstraints' : {
	        'audio' : true,
	        'video' : (videoEnabled ?getResolutionConstraints():false)
	      },
	      'createOfferConstraints' : {
	        'mandatory' : {
                'OfferToReceiveAudio' : true,
                'OfferToReceiveVideo' : videoEnabled
	        }
	      }      
	      
	    };
	    return options;
	  }

	
	function getResolutionConstraints (){
		var videoSizeText = wrsConfig.videoSizeText;
		  var videoWidth, videoHeight;
		  if(videoSizeText == "R_320x180") {
			  videoWidth = 320;
			  videoHeight = 180;
		  } else if(videoSizeText == "R_320x240") {
			  videoWidth = 320;
			  videoHeight = 240;
		  }else if(videoSizeText == "R_640x360") {
			  videoWidth = 640;
			  videoHeight = 360;
		  }else if(videoSizeText == "R_640x480") {
			  videoWidth = 640;
			  videoHeight = 480;
		  } else if(videoSizeText == "R_960x720") {
			  videoWidth = 960;
			  videoHeight = 720;
		  } else if(videoSizeText == "R_1280x720") {
			  videoWidth = 1280;
			  videoHeight = 720;
		  }else {
			  videoWidth = 640;
			  videoHeight = 480;
		  }
		  
       
          if(videoWidth && videoHeight) {
            if(videoHeight <= 480) {
              return { mandatory: { maxWidth: videoWidth, maxHeight: videoHeight }};
            } else {
              return { mandatory: { minWidth: videoWidth, minHeight: videoHeight }};
            }
          } else {
            return false;
          }
        
      }
	
	
	
	function getDTMFOptions () {
		var options = {
			'duration' : 150,
			'interToneGap' : 300
		};
		return options;
	}

	function getUserMedia ( options, success, failure, force ) {
		return ua.getUserMedia( options, success, failure, force );
	}


    
    function isConnected(){
    	return (state == 'connected');
    }
    
 
    
    function isConnectionFailed(){
    	return (isInit && (state == 'disconnected' || state == 'disconnecting'));
    	
    }
  
	// A subset of functionality from the SIP interface which the CallSession
	// class can use.
	ExSIPSession = {
		getLastActiveSession : function () {
			return lastactivesession;
		},
		setLastActiveSession : function ( callSession ) {
			lastactivesession = callSession;
		},
		getExSIPOptions : getExSIPOptions,
		getUserMedia : getUserMedia,
		updateUserMedia : updateUserMedia,
		endCallSession : function ( callSession ) {
			removeCallSession( callSession );
		},
		onCallHold : onCallHold,
        getResolutionConstraints:getResolutionConstraints,
        isVideoAllowed : function(){return wrsConfig.isVideoAllowed;}
	};

	// A subset of funcitonality from the SIP interface which the Client can use.
	return {
		init : init,
		SIPHandler : SIPHandler,
		getUri:getUri,
		call : call,
		endLastCall: endLastCall,
		muteLastCall:muteLastCall,
		unMuteLastCall:unMuteLastCall,
		switchVideoOfLastCall: switchVideoOfLastCall,
		terminate : terminate,
		updateWrsConfig : updateWrsConfig,
		sendDTMFToActiveSession : sendDTMFToActiveSession,
        isConnectionFailed : isConnectionFailed,
        isConnected : isConnected,
        disconnect : disconnect,
        reconnect : reconnect,
        getLastCallSession: getLastCallSession
        
	};

};
