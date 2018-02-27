var SIP = SIP || {};




/*
 * Class CallSession This is created in the SIP namespace. A instance of
 * CallSession is created for each call leg from the user SIP end point. The
 * class supports answer, hold, mute, switchVideo and end call functionality from
 * within the instance for the corresponding call leg.
 * 
 * It also throws events when the particular CallLeg or CallSession is started(
 * i.e answered), failed, is remotely or locally held and resumed, audio/video
 * switching and on end call.
 * 
 * 
 * When the CallSession is first created and passed to the client, it should
 * register for the above events to plug-in call specific behavior. It should
 * also provided the remote video and local video placeholder (video tag) before
 * the call is answered.
 * 
 */

( function ( SIP ) {

	function CallSession ( exSipSession, request ) {
		
		this.exSipSession = exSipSession;
        this.request = request;
		this.originator = request.originator;
		this.direction = request.session.direction;
		this.sessionRequest = request.request;
		this.rtcSession = request.session;

		this.remoteVideoSrc = null;
		this.localVideoSrc = null;

		this.isVideo = false;
		this.isRemoteVideo = false;
		this.isLocalVideo = false;
		this.isRemoteHold = false;
		this.isHold = false;
        this.timerPR50559 = null;
        
        this.p_asserted_identity = null;
        this.p_asserted_identity_user = null;
        this.p_asserted_identity_name = null;
        
        this.clearTimerPR50559 = function(){
            //this.rtcSession.status = 9 means confirmation
            //this.rtcSession.status = 6 means waiting for ACK
            /*
             * If a confirmation is received before the timeout, no need to do switchVideo separately.
             * So, clear the timer.
             */            
            if(this.rtcSession.status == 9 && this.timerPR50559 != null){
			    clearTimeout(this.timerPR50559);
                this.timerPR50559 = null;
		    }
        };
        
		if(request.session.rtcMediaHandler.createOfferConstraints){
			this.isLocalVideo = (request.session.rtcMediaHandler.createOfferConstraints 
                                           && request.session.rtcMediaHandler.createOfferConstraints.mandatory.OfferToReceiveVideo);
		}
		this.holdandanswer = false;
		this.sessionState = this.SESSION_STATE.PROGRESS; // progress, failed, started, ending, ended
        
		this.callState = null; // active, remoteheld, holding, held, unholding
        this.endReason = null;
		this.conferenceDetails = {
			isConfCall : false,
			conferenceId : '',
			securityPin : '',
			enableSendingConfIdAsSipUriHeader:false,
			isConfDetailsSent : false
		};
		if(this.request.originator !== 'local' && this.request.request){
			this.isRemoteVideo = this.request.request.body.indexOf('m=video')>-1;
		}
		this.localSteamActive = false;
		this.remoteStreamActive = false;
		this.handler = {
			onFailed : function ( CallSession ) {
			},
			onStarted : function ( CallSession ) {
			},
			//called when a call is answered by any party
			onConnected : function ( CallSession ) {
			},
			onConfCall : function ( CallSession ) {
			},
			onHold : function ( CallSession ) {
			},
			onRemoteHold : function ( CallSession ) {
			},
			onRemoteUnHold : function ( CallSession ) {
			},
			onMute : function ( CallSession ) {
			},
			onUnMute : function ( CallSession ) {
			},
			onResume : function ( CallSession ) {
			},
			onEnd : function ( CallSession ) {
			},
			onMediaStateUpdate : function ( CallSessio ) {
			},
			onVolumeChange : function ( volume ) {
			},
            onDiversion: function(p_asserted_identity, remoteNumber, remoteName){
                if(LOGGER.API.isDebug()){
                    LOGGER.API.debug(this.MODULE, "Call diverted with p_asserted_identity=" + p_asserted_identity + ":: remoteNumber=" +remoteNumber + ":: remoteName="+ remoteName);
                }
			}

		};
		
		this.setVolume = function(volume){
			if(this.handler){
                try{
                	this.handler.onVolumeChange( volume );
                }catch(e){
                    if(LOGGER.API.isDebug()){
                        LOGGER.API.debug( this.MODULE, "Exception while sending volume change request", e);
                    }
                }                 
                
            }
	    };

		this.setConferenceDetails = function ( confDetails ) {
 
			this.conferenceDetails.isConfCall = confDetails.isConfCall ? confDetails.isConfCall : false;

			this.conferenceDetails.conferenceId = confDetails.conferenceId ? (confDetails.conferenceId.endsWith("#")?confDetails.conferenceId : confDetails.conferenceId+"#"):"";
			this.conferenceDetails.securityPin = confDetails.securityPin? (confDetails.securityPin.endsWith("#")?confDetails.securityPin : confDetails.securityPin+"#"):"" ;
			this.conferenceDetails.enableSendingConfIdAsSipUriHeader = confDetails.enableSendingConfIdAsSipUriHeader;
			this.conferenceDetails.isConfDetailsSent = this.conferenceDetails.enableSendingConfIdAsSipUriHeader;

		};

		this.rtcSession.on( 'iceconnected', function ( event ) {
			if(LOGGER.API.isDebug()){
				LOGGER.API.debug( this.MODULE, "Session Description progress for iceconnected");
			}
		}.bind( this ) );
		
		this.rtcSession.on( 'icecompleted', function ( event ) {
			if(LOGGER.API.isDebug()){
				LOGGER.API.debug( this.MODULE, "Session Description progress for icecompleted");
			}
			if(this.sessionState == this.SESSION_STATE.STARTED && this.callState === this.CALL_STATE.ACTIVE && this.conferenceDetails && !this.conferenceDetails.isConfDetailsSent){
				if(this.conferenceDetails && this.conferenceDetails.conferenceId && this.dialConfTimer){
					this.dialConfTimer = setTimeout(function(){
						this.sendDTMF( this.conferenceDetails.conferenceId );
						if(this.conferenceDetails.securityPin){
							this.sendDTMF( this.conferenceDetails.securityPin );
						}
						this.conferenceDetails.isConfDetailsSent = true;
						this.handler.onConfCall( this );
					}.bind(this),2000);
				}
			}else if(this.conferenceDetails.enableSendingConfIdAsSipUriHeader){
				this.handler.onConfCall( this );
				if(this.conferenceDetails && this.conferenceDetails.securityPin && this.dialConfTimer){
					this.dialConfTimer = setTimeout(function(){
							this.sendDTMF( this.conferenceDetails.securityPin );
						
					}.bind(this),2000);
				}
			}

		}.bind( this ) );
		
		this.rtcSession.on( 'iceclosed', function ( event ) {
			if(LOGGER.API.isDebug()){
				LOGGER.API.debug( this.MODULE, "Session Description progress for iceclosed");
			}
		}.bind( this ) );
		

		
		this.rtcSession.on( 'progress', function ( event ) {
			if(LOGGER.API.isDebug()){
				LOGGER.API.debug( this.MODULE, "Session Description progress for " + this.getCallerId() );
			}
			this.sessionState = this.SESSION_STATE.PROGRESS;

			if ( this.direction == 'outgoing' ) {
				this.isVideo = (event.sender.rtcMediaHandler.createOfferConstraints 
                                           && event.sender.rtcMediaHandler.createOfferConstraints.mandatory.OfferToReceiveVideo);
			}

		}.bind( this ) );

		this.rtcSession.on( 'failed', function ( event ) {
			if(LOGGER.API.isDebug()){
				LOGGER.API.debug( this.MODULE, "Session Description: call failed for " + this.getCallerId() );
			}
            Sound.pause();
            if ( this.sessionState != this.SESSION_STATE.ENDED ){
            	this.exSipSession.endCallSession( this );
            }
            this.sessionState = this.SESSION_STATE.FAILED;

			var message = event.data.message;
			var statusCode = -1;
			var reasonPhrase = '';
			if ( message ) {
				statusCode = message.status_code;
				reasonPhrase = message.reason_phrase;

			} else {
				reasonPhrase = 'An unknown error occurred.';
			}

			this.isVideo = false;
            if(this.handler){
                try{
                	this.handler.onFailed( this );
                }catch(e){
                    LOGGER.API.warn( this.MODULE, "Exception while sending onFailed event", e);
                }                 
                
            }
            
            
            

            this.clearSession();

		}.bind( this ) );
		
		this.updateRTCSession = function (event){
			Sound.pause();
            /*
             * If a confirmation is received before the timeout, no need to do switchVideo separately.
             * So, clear the timer.
             */ 
            this.clearTimerPR50559();
            if(LOGGER.API.isDebug()){
            	LOGGER.API.debug( this.MODULE, event.toString() );
            }
			


			var localSDP = event.sender.rtcMediaHandler.peerConnection.localDescription;
			var remoteSDP = event.sender.rtcMediaHandler.peerConnection.remoteDescription;
			
			if(LOGGER.API.isDevDebug()){
				
				var details = "---------------Session Description----------------------\n";
				details = details + "remoteUser =" + this.getRemoteUser() + ":: remoteName=" + this.getRemoteName() + "\n";
				details = details + "reconnect=" + event.data.isReconnect + "\n";
				if ( localSDP ) {
					details = details + "------Local Description ---------\n";
					details = details + " hasVideo =" + localSDP.hasVideo() + "\n";
					details = details + " hasAudio =" + localSDP.hasAudio() + "\n";
					details = details + " videoPort =" + localSDP.videoPort() + "\n";
					details = details + " audioPort =" + localSDP.audioPort() + "\n";
					// details = details + " getAudio =" + localSDP.getAudio() +
					// "\n";
					// details = details + " getVideo =" + localSDP.getVideo() +
					// "\n";
					details = details + " getAudioMedia   =" + localSDP.getAudioMedia() + "\n";
					details = details + " getVideoMedia   =" + localSDP.getVideoMedia() + "\n";
					details = details + " hasActiveVideo    =" + localSDP.hasActiveVideo() + "\n";
					details = details + " hasActiveAudio    =" + localSDP.hasActiveAudio() + "\n";
					details = details + " hasAudioMode    =" + localSDP.getAudioMode() + "\n";
	
				}
				details = details + " getLocalStreams.length    =" + event.sender.getLocalStreams().length + "\n";

			
				if ( remoteSDP ) {
					details = details + "------Remote Description ---------\n ";
					details = details + " hasVideo =" + remoteSDP.hasVideo() + "\n";
					details = details + " hasAudio =" + remoteSDP.hasAudio() + "\n";
					details = details + " videoPort =" + remoteSDP.videoPort() + "\n";
					details = details + " audioPort =" + remoteSDP.audioPort() + "\n";
					// details = details + " getAudio =" + remoteSDP.getAudio() +
					// "\n" ;
					// details = details + "getVideo =" + remoteSDP.getVideo() +
					// "\n" ;
					details = details + "getAudioMedia   =" + remoteSDP.getAudioMedia() + "\n";
					details = details + "getVideoMedia   =" + remoteSDP.getVideoMedia() + "\n";
					details = details + "hasActiveVideo    =" + remoteSDP.hasActiveVideo() + "\n";
					details = details + " hasActiveAudio    =" + remoteSDP.hasActiveAudio() + "\n";
					details = details + " getAudioMode    =" + remoteSDP.getAudioMode() + "\n";
				}
				details = details + " isHeld    =" + this.rtcSession.isHeld() + "\n";
				
				details = details + "getLocalStreams.length    =" + event.sender.getRemoteStreams().length + "\n";
				details = details + "isReconnect=" + event.data.isReconnect + ", reconnecting= "+event.sender.reconnecting+ "\n";
				
				details = details + "exSipController.js:: Ignoring updateRTCSession as  the source is   me \n";

				
			}
			
			
			var s = event.sender;
            var prevRemoteVideoState =  this.isRemoteVideo;
            var changeRemoteHoldStatus = false;
			this.isLocalVideo = localSDP.hasActiveVideo() ;
			this.isRemoteVideo = remoteSDP.hasActiveVideo() ;			
			if(event.data.isReconnect == true && event.sender.reconnecting==true){
				
            	return;
            }
			
			if(event.data.isReconnect == undefined && event.sender.reconnecting==false) {
				// Call is answered first time.
				this.callState = this.CALL_STATE.ACTIVE;
				
				if ( this.exSipSession.getLastActiveSession() && !this.exSipSession.getLastActiveSession().isheld() && this.exSipSession.getLastActiveSession() !== this ) {
					this.exSipSession.getLastActiveSession().hold();
					//this.holdandanswer = true;

				}
				
				this.exSipSession.setLastActiveSession( this );
				this.handler.onConnected( this );
				
				

				if ( this.conferenceDetails.isConfCall ) {
					var me = this;
					setTimeout( function () {
						if(me.sessionState == me.SESSION_STATE.STARTED && !me.conferenceDetails.isConfDetailsSent ){

							me.sendDTMF( me.conferenceDetails.conferenceId );
							me.sendDTMF( me.conferenceDetails.securityPin );
							me.conferenceDetails.isConfDetailsSent = true;
							me.handler.onConfCall( me );
						}else if(me.conferenceDetails && me.conferenceDetails.enableSendingConfIdAsSipUriHeader){
							me.handler.onConfCall( me );
							if(me.conferenceDetails && me.conferenceDetails.securityPin ){
									me.sendDTMF( me.conferenceDetails.securityPin );
							}
						}
					}, 1000 );

				}else if(this.isOutgoing()){
					if(localSDP.hasActiveVideo() && !remoteSDP.hasActiveVideo()){
						var self =this;
						setTimeout(function(){
							
							self.switchVideo(false);
						}, 1000);
					}
					
				}
				this._updateVideoStreams( s.getRemoteStreams(), s.getLocalStreams() );
				
				
				return;

			} 
			
			

           
			if(event.sender.request && event.sender.request.p_asserted_identity){ 
                //set p_asserted_identity only if there is change in the diversion info.

                if(this.p_asserted_identity != event.sender.request["p_asserted_identity"]){
                    this.p_asserted_identity = event.sender.request["p_asserted_identity"];
                    this.p_asserted_identity_user = event.sender.request.p_asserted_identity.uri.user;
                    this.p_asserted_identity_name = event.sender.request.p_asserted_identity.display_name;
                    if(this.handler){
                        this.handler.onDiversion(event.sender.request["p_asserted_identity"], this.p_asserted_identity_user, this.p_asserted_identity_name);
                    }
                }
            }else if(this.p_asserted_identity){
                //reset to null, if there are no more p_asserted_identity field. Not sure when it may happen
                this.p_asserted_identity = null;
                this.p_asserted_identity_user = null;
                this.p_asserted_identity_name = null;
            }
            

			
			if ( remoteSDP.getAudioMode() == "inactive") {
				if ( this.callState !== this.CALL_STATE.HELD && this.callState !== this.CALL_STATE.HOLDING && this.callState !== this.CALL_STATE.UNHOLDING ) {
					this.callState = this.CALL_STATE.REMOTEHELD;
                    if(this.handler){
                    	changeRemoteHoldStatus = true;
                        try{
                        	//if not already in remotehold state, then only set remotehold state and send notification.
                        	if(this.isRemoteHold === false){
                        		this.isRemoteHold = true;
                                if(LOGGER.API.isDevDebug()){
                                    LOGGER.API.devDebug( "exSipCallSession.js", "Sending onRemoteHoldEvent for " + this.getCallerId() );
                                }
                        		this.handler.onRemoteHold( this );
                        	}
                        }catch(e){
                            LOGGER.API.warn( this.MODULE, "Exception while sending onRemoteHold event"+e.stack);
                        }                          
                        
                    }
                    
                    if(LOGGER.API.isDevDebug()){
                    	details = details + "Remote Hold\n";
                    }
                    
					//this.exSipSession.setLastActiveSession( null );
				}
			} else if ( remoteSDP.getAudioMode() != "inactive"  ) {
				if ( this.callState === this.CALL_STATE.REMOTEHELD ) {
                    if(this.handler){
                    	changeRemoteHoldStatus = true;
                        try{
                        	//if not already in remote unhold state, then only unset remotehold state and send notification.
                        	if(this.isRemoteHold === true){
                        		this.isRemoteHold = false;
                        		if(LOGGER.API.isDebug()){
                					LOGGER.API.debug(this.MODULE, "Sending onRemoteUnHold for " + this.getCallerId() );
                				}
                        		
                        		this.handler.onRemoteUnHold( this );
                        	}
                        }catch(e){
                            LOGGER.API.warn( this.MODULE, "Exception while sending onRemoteUnHold event",e);
                        }                         
                        
                    }
                    if(LOGGER.API.isDevDebug()){
                    	details = details + "Remote UnHold\n";
                    
                    }
					this.callState = this.CALL_STATE.ACTIVE;
				}
				

				if ( this.exSipSession.getLastActiveSession() === null ) {
					this.exSipSession.setLastActiveSession( this );
				}

			}
			if(LOGGER.API.isDevDebug()){
				LOGGER.API.devDebug(this.MODULE, "SIP Call session debug details " + details );
			}

			this._updateVideoStreams( s.getRemoteStreams(), s.getLocalStreams() );

            if(this.handler){
                try{
                    
                    if(!event.sender.reconnecting){
                    	//do not send updateUserMedia for own event
                    	if( !changeRemoteHoldStatus && (prevRemoteVideoState !==  this.isRemoteVideo) && !this.conferenceDetails.isConfCall){
                    		var self =this;
                            /*PR-49570 - After upgrading the audio call to video call the audio is becoming one way*/
                            setTimeout(function(){
                            	if(self.sessionState !== self.SESSION_STATE.ENDING && self.sessionState !== self.SESSION_STATE.ENDED){
                            		self.updateUserMedia(self, self.isRemoteVideo);
                            	}
                                
                            }, 1000);

                    	 }
                    }
                	
                    
                }catch(e){
                    LOGGER.API.warn( this.MODULE, "Exception while sending updateRTCSession event", e);
                }               
                
            }

		};

		
		this.rtcSession.on( 'started', function ( event ) {
			if ( this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
				//this state should never occur.
				this.handleInvalidCallSession();
		        
				return;
			}
            if ( this.sessionState == this.SESSION_STATE.PROGRESS ) {
                this.sessionState = this.SESSION_STATE.STARTED;
          
                if(this.handler){
                    try{
                    	
                        this.handler.onStarted( this );
    					
                    }catch(e){
                    	
                        LOGGER.API.warn( this.MODULE, "Exception while sending onStarted event", e);
                    }                        
                    
                }

                if(LOGGER.API.isDebug()){
                	LOGGER.API.debug( this.MODULE, "Call started with " + this.getCallerId() );
                }
            }
            
			this.updateRTCSession(event);

		}.bind( this ) );


		
		this.rtcSession.on( 'resumed', function ( event ) {
			if(LOGGER.API.isDebug()){
            	LOGGER.API.debug( this.MODULE,"Session Description: call resumed for " + this.getCallerId(), event );
			}
			
			
			this.callState = this.CALL_STATE.ACTIVE;

			this.exSipSession.setLastActiveSession( this );
			if ( this.isVideoSupportEnabled() ) {
				var s = event.sender;
			}
            if(this.handler){
                try{
                	this.isHold = false;
                    this.handler.onResume( this );
                }catch(e){
                    LOGGER.API.warn( this.MODULE, "Exception while sending onResume event",e);
                }                          
                
            }

		}.bind( this ) );

		this.rtcSession.on( 'held', function ( event ) {
			if(LOGGER.API.isDebug()){
            	LOGGER.API.debug( this.MODULE,"Session Description: call held for " + this.getCallerId(), event );
			}
			
			this.callState = this.CALL_STATE.HELD;
		}.bind( this ) );

		this.rtcSession.on( 'ended', function ( event ) {
			if(LOGGER.API.isInfo()){
            	LOGGER.API.info( this.MODULE,"Session Description: call ended for " + this.getCallerId(), event );
			}

			this._resetVideoStreams();
            Sound.pause();
            if ( this.sessionState === this.SESSION_STATE.ENDED){
    	        this.handleInvalidCallSession();
                return;
            }
            

            this.isVideo = false;
            if(this.handler){
            	try{
            		this.handler.onEnd( this );
        			
                }catch(e){
                    LOGGER.API.warn( this.MODULE, "Exception while sending onEnd event"+e.stack);
                } 
            	
            }
            

            this.exSipSession.endCallSession( this );
           
            this.clearSession();
	  
		}.bind( this ) );

		this.rtcSession.on( 'newDTMF', function ( event ) {
            
			var digit = event.data.tone;
            
            if(!digit) {
              return;
            }
            
            var file = null;
            if (digit === "*")
            {
              file = "star";
            }
            else if (digit === "#")
            {
              file = "pound";
            }
            else
            {
              file = digit;
            }
            Sound.playDtmfTone(file);

		}.bind( this ) );
	}
	CallSession.prototype.MODULE = "exSipCallSession";
    


    this.callId = "";
    this.remoteUser = "";
    this.displayName = "";
    
    CallSession.prototype.isCallConnected= function(){
    	return (this.callState != null);
    }
    
    CallSession.prototype.getCallId = function () {
    	if(this.rtcSession){
    		this.callId = this.rtcSession.request.call_id;
    	}
    	
    	return this.callId;
	};
	
	CallSession.prototype.getRemoteUser = function () {
	    
	    
        if(this.p_asserted_identity && this.p_asserted_identity_user ){
            this.remoteUser = this.p_asserted_identity_user;
        }else if(this.rtcSession && this.rtcSession.remote_identity){
    		this.remoteUser = this.rtcSession.remote_identity.uri.user;
    	}
    	
    	return this.remoteUser;
    	
	};

	
	
	CallSession.prototype.getRemoteName = function () {

        if(this.p_asserted_identity && this.p_asserted_identity_name ){
            this.displayName = this.p_asserted_identity_name;
        }else if(this.rtcSession && this.rtcSession.remote_identity){
			this.displayName = this.rtcSession.remote_identity.display_name;
		}
		if(this.displayName && this.displayName.indexOf("-")>=0){
			this.displayName = this.displayName.split("-")[0];
		}
		return this.displayName;
		
	};
	
	CallSession.prototype.getCallerId = function () {
        var callerId = this.getRemoteName();
        
        if(this.getRemoteUser()){
        	if(callerId){
                callerId = callerId + " ( " + this.getRemoteUser() +" )";
            }else{
            	callerId =  this.getRemoteUser();
            }
        }
        
        
        
		if(!callerId || callerId == "Unavailable"){
            callerId = "Unknown";
		}
        


		return callerId;
	};

	CallSession.prototype.isOutgoing = function () {
		return ( this.originator === "local" );
	};

	CallSession.prototype.forceTerminate = function () {
		this.endCall();
        if(this.handler){
            try{
                this.handler.onEnd( this );
            }catch(e){
                LOGGER.API.warn( this.MODULE, "Exception while sending onEnd event", e);
            }           
            
        }

	};



	CallSession.prototype.isOnHook = function () {
		return ( this.sessionState === this.SESSION_STATE.FAILED || this.sessionState === this.SESSION_STATE.ENDED );
	};

	CallSession.prototype.isVideoSupportEnabled = function () {
		return ( this.remoteVideoSrc && this.localVideoSrc ) ? true : false;
	};
	
	CallSession.prototype._resetVideoStreams = function(){
		this.remoteVideoSrc = "";
		this.remoteStreamActive = false;
		this.localVideoSrc = "";
		this.localSteamActive = false;
	}

	CallSession.prototype._updateVideoStreams = function ( remoteStreams, localStream ) {
		if( this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
			return;
		}
		var hasStream = false;
		var isMediaUpdate = false;
		hasStream = remoteStreams && remoteStreams.length > 0 && typeof ( remoteStreams[ 0 ] ) !== 'undefined' && remoteStreams[ 0 ].active;
		if ( hasStream ) {
			this.remoteStreamId = remoteStreams[0].id;
			this.remoteVideoSrc = ( window.URL && window.URL.createObjectURL( remoteStreams[ 0 ] ) ) || remoteStreams[ 0 ];
			this.remoteStreamActive = true;
			isMediaUpdate = true;
		} else {
			this.remoteVideoSrc = "";
			this.remoteStreamActive = false;
		}

		hasStream = false;
		hasStream = localStream && localStream.length > 0 && typeof ( localStream[ 0 ] ) !== 'undefined' && localStream[ 0 ].active && !localStream[ 0 ].ended ;
		if ( hasStream ) {
			this.localStream = localStream[0].id;
			this.localVideoSrc = ( window.URL && window.URL.createObjectURL( localStream[ 0 ] ) ) || localStream[ 0 ];
			this.localSteamActive = true;
			isMediaUpdate = true;
		} else {
			this.localVideoSrc = "";
			this.localSteamActive = false;
		}
		if(isMediaUpdate){
			this.handler.onMediaStateUpdate( this );
		}
	};

	CallSession.prototype.isLocalStreamActive = function () {
		return this.localSteamActive;
	};

	CallSession.prototype.isRemoteStreamActive = function () {
		return this.isRemoteStreamActive;
	};

	CallSession.prototype.answer = function ( isAudio ) {
		
		if ( this.sessionState === this.SESSION_STATE.STARTED || this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED) {
           
			
			if(this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
				if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE,"Failed to Answer the call as the callsession is already ended for " + this.getCallerId(), event );
				}
	            this.handleInvalidCallSession();
	        }else{
	        	if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE,"Answer call ignored due to invalid state for " + this.getCallerId(), event );
				}
	        }
            
			return {
				result : false,
				message : "Invalid state for the callSession"
			};

		}
		if ( !this.isOutgoing() && this.sessionState === this.SESSION_STATE.PROGRESS && this.rtcSession ) {

			if ( this.exSipSession.getLastActiveSession() && !this.exSipSession.getLastActiveSession().isheld() && this.exSipSession.getLastActiveSession() !== this ) {
				this.exSipSession.getLastActiveSession().hold();
				this.holdandanswer = true;

			}

			try {
				var hasVideo = isAudio ? false : true;
				if ( hasVideo ) {
					hasVideo = this.rtcSession && this.rtcSession.rtcMediaHandler && this.rtcSession.rtcMediaHandler.peerConnection && this.rtcSession.rtcMediaHandler.peerConnection.remoteDescription
							&& this.rtcSession.rtcMediaHandler.peerConnection.remoteDescription.hasVideo();
				}
				this.rtcSession.answer( this.exSipSession.getExSIPOptions( hasVideo ) );
                
                //stop the ringing sound right after it has been answered
                Sound.pause();
				/*
				 * PR-49542 and PR50559 - statics are coming when call from Uc-one desktop to Uc-One chrome.
				 * Additionall a incoming video call answered in audio mode does not switched to audio, but remains in video mode.
				 * 
				 * There is problem with exSip.js now.
				 * Currently exSip.js copied the remoted sdp to local sdp while answering the call and does not respect the audio/video choice made during answering the call.
				 * The following code forcefully switches the call to original choice after the call is established.
				 * This is an workaround code and need to be removed later on.
                 *
                 * If a confirmation (status code 9) is not recieved within 2 seconds, 
                 * then it assumed to be a incomplere SIP flow and a switchVideo is executed 
                 * to completely establish the call. 
				*/
				this.timerPR50559 = setTimeout(function(){
					
					this.switchVideo(hasVideo);
                    this.timerPR50559 = null;
				}.bind(this), 2000);
				return {
					result : true
				};
			} catch ( error ) {

				return {
					result : false,
					message : error.message
				};
			}

		}

		return {
			result : false,
			message : 'invalid state'
		};

	};

	CallSession.prototype.decline = function () {
		if ( this.sessionState !== this.SESSION_STATE.PROGRESS || this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED) {
            
			
			if(this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
				if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE,"Failed to decline the call as the callsession is already ended for " + this.getCallerId(), event );
				}
	            this.handleInvalidCallSession();
	        }else{
	        	if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE,"Declining call ignored due to invalid state for " + this.getCallerId(), event );
				}
	        }
			return {
				result : false,
				message : "Invalid state for the callSession"
			};

		}
		try {
			this.rtcSession.terminate();
			
			return {
				result : true
			};
		} catch ( error ) {

			return {
				result : false,
				message : error.message
			};
		}

	};

	CallSession.prototype.endCall = function () {
		if ( this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
			if(LOGGER.API.isDebug()){
            	LOGGER.API.debug( this.MODULE,"End call ignored as call is already ended " + this.getCallerId(), event );
			}
			
		    this.handleInvalidCallSession();
			return {result : false	};
		}
		
		this.sessionState = this.SESSION_STATE.ENDING;
		
		this._resetVideoStreams();

		if ( this.exSipSession && this.exSipSession.getLastActiveSession() === this ) {
			this.exSipSession.setLastActiveSession( null );
		}

		
		var localStreams = this.rtcSession.getLocalStreams();
		if ( localStreams ) {

			var localMedia = localStreams[ 0 ];
			
			if(localMedia) {
				if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE,"stopping existing local media stream" );
				}
		        var tracks = localMedia.getTracks();
		        if(tracks){
		        	for (var i = 0; i < tracks.length; i++) {
					  try{
						  tracks[i].enabled = false;
						  tracks[i].stop();
					  }catch(e){}
					}
		        }

		      }
		}
			

		

		
		try {
			this.rtcSession.terminate();
			return {
				result : true
			};
		} catch ( error ) {

			return {
				result : false,
				message : error.message
			};
		}

	};

	CallSession.prototype.getVideoResolutionConstraints = function(){
		var resolution = {width:640, height:480};
		if(this.exSipSession){
			var data = this.exSipSession.getResolutionConstraints();
			if(data && data.mandatory){
				 if(data.mandatory.maxWidth) {
					 
					 resolution= { width: data.mandatory.maxWidth, height:data.mandatory.maxHeight};
		         } else {
		        	 resolution= { width: data.mandatory.minWidth, height:data.mandatory.minHeight};
		         }
			}	
		}

		return resolution;
	};
	
	CallSession.prototype.getReportById = function(reports, id) {
	    for (var i = 0; i < reports.length; i++) {
	      if (reports[i].id === id) {
	        return reports[i];
	      }
	    }
	    return null;
	 };
	  
	CallSession.prototype.stats = function(){
		   var peerConnection = this.rtcSession.rtcMediaHandler.peerConnection;
		   var self = this;
		   peerConnection.getStats(function(stats) {
			      var results = stats.result();
			      var reports = [];
			      for (var i = 0; i < results.length; ++i) {
			        var res = results[i];
			        var report = self.getReportById(reports, res.id);
			        if (!report) {
			          report = {};
			          report.type = res.type;
			          report.id = res.id;
			        }

			        var names = res.names();
			        var values = [];
			        for (var j = 0; j < names.length; j++) {
			          var name = names[j];
			          if (!name) {
			            continue;
			          }
			          var value = res.stat(name);
			          values.push(name);
			          values.push(value);
			        }
			        var valueObj = {};
			        valueObj.timestamp = res.timestamp;
			        valueObj.values = values;
			        report.stats = valueObj;
			        reports.push(report);
			      }
			      var data = {
			        "lid": 1,
			        "pid": sipstack.getSessionId(),
			        "reports": reports
			      };
			      
			      if(LOGGER.API.isDevDebug()){
		            	LOGGER.API.devDebug( this.MODULE,"CallSession statistics " +  JSON.stringfy(data));
			      }
			      //self.statsMod.addStats(data);
			    });

			};


	CallSession.prototype.hold = function () {

		if ( this.sessionState != this.SESSION_STATE.STARTED || this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ) {
            
			
			if(this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
				if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE,"Failed to hold the call already at END state ");
				}
	            this.handleInvalidCallSession();
	        }else{
	        	if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE,"hold call ignored due to invalid state for " + this.getCallerId());
		      }
	        }	
			return {
				result : false,
				message : 'invalid state; call is not active'
			};
		}
		if(!this.isRemoteHold){
			if ( this.isheld() || this.callState === this.CALL_STATE.REMOTEHELD || this.callState === this.CALL_STATE.HELD || this.callState === this.CALL_STATE.HOLDING
					|| this.callState === this.CALL_STATE.UNHOLDING ) {
				
				if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE," Hold call ignored due to invalid" +
						" state for " + this.getCallerId());
				}
				return {
					result : true,
					message : 'invalid state; call is already in hold state'
				};
			}
			var self = this;
			var prevstate = this.callState;
			this.callState = this.CALL_STATE.HOLDING;
            
            //sometimes the success fuunction is not called. This flag is to compensate that.
            var success = true;
            
			this.rtcSession.hold( function () {
				self.callState = self.CALL_STATE.HELD;
				self.exSipSession.onCallHold( self );
				if ( self.exSipSession.getLastActiveSession() === self ) {
					self.exSipSession.setLastActiveSession( null );
				}
				
				
				try{
					self.isHold = true;
					self.handler.onHold( self );
				}catch(e){
					LOGGER.API.warn( this.MODULE, "Exception while sending onHold event", e);
				}  
				
			}.bind(this), function () {
                success = false;
				self.callState = prevstate;
			}.bind(this));
            
            if(success){
               this.callState = self.CALL_STATE.HELD;
            }

		}

	};

	CallSession.prototype.unhold = function () {
		if ( this.sessionState != this.SESSION_STATE.STARTED || this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ) {
            
			
			if(this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
				if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE," UnHold call ignored due to call already at end state for " + this.getCallerId());
				}
	            this.handleInvalidCallSession();
	        }else{
	        	if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE," UnHold call ignored due to invalid" +
						" state for " + this.getCallerId());
				}
	        }	
			return {
				result : false,
				message : "Invalid state for the callSession"
			};

		}

		if ( !this.isheld() || this.callState === this.CALL_STATE.REMOTEHELD || this.callState === this.CALL_STATE.UNHOLDING ) {
			return {
				result : true,
				message : 'invalid state; call is already in unhold state'
			};
		}
		
		if ( this.exSipSession.getLastActiveSession() && !this.exSipSession.getLastActiveSession().isheld() && this.exSipSession.getLastActiveSession() !== this ) {
			this.exSipSession.getLastActiveSession().hold();

		}

		var self = this;
		var prevstate = this.callState;
		
        //sometimes the success fuunction is not called. This flag is to compensate that.
        var success = true;
        
		this.callState = this.CALL_STATE.UNHOLDING;
		this.rtcSession.unhold (function () {
				self.exSipSession.setLastActiveSession( self );
				if ( self.callState === self.CALL_STATE.UNHOLDING ) {
					self.callState = self.CALL_STATE.ACTIVE;
				}
		}.bind(this), function () {
            success = false;
			self.callState = prevstate;
        }.bind(this) );
        
        if(success){
           if ( self.callState === self.CALL_STATE.UNHOLDING ) {
                self.callState = self.CALL_STATE.ACTIVE;
            }
        }
	};

	CallSession.prototype.isheld = function () {
		if ( this.sessionState != this.SESSION_STATE.STARTED || this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ) {
			return false;

		}
		return this.rtcSession.isHeld() || ( this.callState === this.CALL_STATE.HELD );
	};

	CallSession.prototype.isRemoteHeld = function () {
		if ( this.callState === this.CALL_STATE.REMOTEHELD ) {
			return true;

		}
		return false;
	};

	
	CallSession.prototype.mute = function () {
		if ( this.sessionState != this.SESSION_STATE.STARTED || this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ) {
			
				
			if(this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
				if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE," Mute call ignored for the call already at end state." + this.getCallerId());
				}
	            this.handleInvalidCallSession();
	        }                   
	            	
			 
			return {
				result : false,
				message : "Invalid state for the callSession"
			};

		}
		var localStreams = this.rtcSession.getLocalStreams();
		if ( !localStreams ) {
			return {
				result : false
			};
		}
		var localMedia = localStreams[ 0 ];
		if(localMedia){
			var localAudio = localMedia.getAudioTracks()[ 0 ];
			if(localAudio){
				localAudio.enabled = false;
		        if(this.handler){
		            try{
		                this.handler.onMute( this );
		            }catch(e){
		            	
		                LOGGER.API.warn( this.MODULE, "Exception while sending onMute event", e);
		            }         
		            
		        }
		        
		        return {
					result : true
				};
			}
			
		}
		return {
			result : false
		};
		
	};

	CallSession.prototype.unmute = function () {
		if ( this.sessionState != this.SESSION_STATE.STARTED || this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ) {
			
			if(this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
				if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE," UnMute call ignored for the call already at end state." + this.getCallerId());
				}
	            this.handleInvalidCallSession();
	        }
			return {
				result : false,
				message : "Invalid state for the callSession"
			};

		}
		var localStreams = this.rtcSession.getLocalStreams();
		if ( !localStreams ) {
			return {
				result : false
			};
		}
		
		var localMedia = localStreams[ 0 ];
		if(localMedia){
			var localAudio = localMedia.getAudioTracks()[ 0 ];
			if(localAudio){
				localAudio.enabled = true;
		        if(this.handler){
		            try{
		                this.handler.onUnMute( this );
		            }catch(e){
		            	LOGGER.API.warn( this.MODULE, "Exception while sending onUnMute event", e);
		            }         
		            
		        }
		        
		        return {
					result : true
				};
			}
			
		}
		return {
			result : false
		};
		
		
	};

	CallSession.prototype.isMuted = function () {
		var localStreams = this.rtcSession.getLocalStreams();
		if ( localStreams ) {
			var localMedia = localStreams[ 0 ];
			if(localMedia) {
				var localAudio = localMedia.getAudioTracks()[ 0 ];
				return !localAudio.enabled;
			}
		}
		return false;
	};

	CallSession.prototype.switchVideo = function ( video) {

		if ( this.sessionState != this.SESSION_STATE.STARTED 
				|| this.sessionState === this.SESSION_STATE.ENDING
				|| this.sessionState === this.SESSION_STATE.ENDED ) {
            
            if(this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
            	if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE," Switch video attempt ignored for the call already at end state." + this.getCallerId());
				}
            	this.handleInvalidCallSession();
            }else{
            	if(LOGGER.API.isDebug()){
	            	LOGGER.API.debug( this.MODULE," Switch video ignored fdue to invalid state." + this.getCallerId());
				}
            }
			
			return {
				result : false,
				message : "Invalid state for the callSession"
			};

		}
		
        if( video && !this.exSipSession.isVideoAllowed()){
            return {
                    result : false,
                    message : "Video not allowed"
            };
        }
		if(!this.isRemoteHold && !this.isHold){
			var changeState = ( video !== undefined && video !== null ) ? video : !this.isLocalVideo;
			
			//var options =  this.isheld()? {resume:true}:{};
			this.updateUserMedia(this, changeState);
		}
		
		
		return {
            result : true
		};
    
    
		
	};

	CallSession.prototype.updateUserMedia = function (instance, video, options) {
		
		var me = this;
		var result = true;
		var isCurrentlyMuted = this.isMuted();
		this.exSipSession.getUserMedia( this.exSipSession.getExSIPOptions( video ), function ( localStream ) {
			options = options || {};
			options.localMedia = localStream;
			options.createOfferConstraints = 
			{
				'mandatory' : {
					'OfferToReceiveAudio' : true,
					'OfferToReceiveVideo' : video && me.exSipSession.isVideoAllowed()

				}
			};

			me.rtcSession.changeSession( options, function () {
				//me._updateVideoStreams( null, localStream );
				if ( video ) {
					me.localSteamActive = true;
				} else {
					me.localSteamActive = false;
				}
				//            self.handler.onMediaStateUpdate(self);
				result = true;
				options.successCb && options.successCb();
				if(isCurrentlyMuted){
					me.mute();
				}
			}, function () {
				result = false;
				options.failureCb && options.failureCb();
			} );
		}, function () {
			result = false;
			options.failureCb && options.failureCb();
		}, true );
	};


	CallSession.prototype.isVideoActive = function () {
		return  (this.callState == null)?this.isRemoteVideo || this.isLocalVideo //when call is not answered, need to show the both audio and video option
                          : this.isRemoteVideo && this.isLocalVideo; //when call is answered, need to show video pane only if the call is connected in video mode.
	};

	CallSession.prototype.sendDTMF = function ( tone, options ) {
		if ( tone == null || tone == undefined) {
			return;
		}
		if ( true/*this.conferenceDetails.isConfCall && this.conferenceDetails.isConfCall === true */) {
			var dtmfoptions = options || this.defaultDTMFOptions;

			var result = {
				result : true
			};
			if ( dtmfoptions.eventHandlers ) {
				dtmfoptions.eventHandlers.failed = function ( data ) {
					result.result = false;
					result.message = data.cause;
				};
			}

			try {
                
                var toneStr = tone+'';
                if(toneStr){
                	
                	if(LOGGER.API.isDebug()){
                		LOGGER.API.debug(this.MODULE, "Sending DTMF : "+ toneStr  + " for " + this.getCallerId());
                	}
                    this.rtcSession.sendDTMF( toneStr, dtmfoptions );
				}
				return result;

			} catch ( error ) {
				return {
					result : false,
					message : error.message
				};
			}
		}
	};
    CallSession.prototype.getTerminationCause = function(){
        if(this.rtcSession){
            return this.rtcSession.cause;
        }else{
            return this.endReason;
        }
    };
    
    CallSession.prototype.handleInvalidCallSession = function(){
		 if(this.sessionState === this.SESSION_STATE.ENDING || this.sessionState === this.SESSION_STATE.ENDED ){
			if(this.handler){	
		     	try{
		     		this.handler.onEnd( this );
		 			this.clearSession();
		         }catch(e){
		         }	                   
			}    	
	    }
    };
    
    CallSession.prototype.isTerminated = function () {
        return (this.sessionState == this.SESSION_STATE.ENDED || this.sessionState == this.SESSION_STATE.FAILED);
    };
    
	CallSession.prototype.clearSession = function () {
		if(LOGGER.API.isInfo()){
        	LOGGER.API.info( this.MODULE," Clear call session for " + this.getCallerId());
		}
        this.sessionState = this.SESSION_STATE.ENDED; // progress, failed, started,
        this.request = null;
		
		this.originator = null;
		this.direction = null;
		this.sessionRequest = null;
        if(this.rtcSession != null){
        	
    		this.rtcSession.on( 'progress', null);
    		this.rtcSession.on( 'failed', null);
    		this.rtcSession.on( 'started', null);
    		this.rtcSession.on( 'resumed', null);
    		this.rtcSession.on( 'held', null);
    		this.rtcSession.on( 'ended', null);
    		this.rtcSession.on( 'newDTMF', null);
    		
            this.endReason = this.rtcSession.cause;
            
            try{
        		var localStreams = this.rtcSession.getLocalStreams();
        		if ( !localStreams ) {
        			var localMedia = localStreams[ 0 ];
        			if(localMedia != null){
        				var localVideo = localMedia.getVideoTracks()[ 0 ];
        				if(localVideo){localVideo.stop();}
        				var localAudio = localMedia.getAudioTracks()[ 0 ];
        				if(localAudio){localAudio.stop();}
        			}
            		
        		}           	
            }catch(e){}

    		
    		
            
            /*For some reason setting  it to null crashes the application 
             * when an remotely hold call is ended by the remote party.
             * 
             * This still need to be investigated why this happens, till then is not set to null.
             */
            //this.rtcSession = null;
        }
        this.exSipSession = null;
		this.remoteVideoSrc = null;
		this.localVideoSrc = null;

		
		// ended

		this.callState = null; // acti
        
		this.conferenceDetails = null;

		this.localSteamActive = false;
		this.remoteStreamActive = false;
		if(this.handler){
			this.handler.onConnected = null;
			this.handler.onFailed = null;
			this.handler.onStarted = null;
			this.handler.onHold = null;
			this.handler.onConfCall = null;
			this.handler.onRemoteHold = null;
			this.handler.onRemoteUnHold = null;
			this.handler.onMute = null;
			this.handler.onUnMute = null;
			this.handler.onResume = null;
			this.handler.onEnd = null;
			this.handler.onMediaStateUpdate = null;
			this.handler.onDiversion = null;
		}
        this.handler = null;
        
        
	};

	CallSession.prototype.defaultDTMFOptions = {
		duration : 150,
		interToneGap : 300,
		eventHandlers : {}

	};

	CallSession.prototype.SESSION_STATE = {
		PROGRESS : 'progress',
		FAILED : 'failed',
		STARTED : 'started',
		ENDING : 'ending',
		ENDED : 'ended'
	};

	CallSession.prototype.CALL_STATE = {
		ACTIVE : 'active',
		REMOTEHELD : 'remoteheld',
		HOLDING : 'holding',
		HELD : 'held',
		UNHOLDING : 'unholding'
	};

	SIP.CallSession = CallSession;

}( SIP ) );
