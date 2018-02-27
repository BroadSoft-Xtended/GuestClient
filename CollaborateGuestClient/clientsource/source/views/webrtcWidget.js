/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/


enyo
		.kind({
			name : "kind.com.broadsoft.cgc.webrtc",
			classes : "nice-padding cgcViewPanelVideoContainer bsftCallBackground",
			fit : true,
			allowHtml : true,
			published : {
				isActive: false,
				isSelfViewActive : true,
				callSession:null,
				isVideoActive:false,
				isSetToDocker:false,
				aspectRatio:1.333, //(640/480)
				sipController:null,
				remoteMediaSrc:null,
				localMediaSrc:null
			},components:[{
			    tag:"div",
			    name:"videoContainer",
			    classes : "cgcRemoteVideoContainer",
			    allowHtml:true,
				components:[
				   {
					   name: "remoteVideo",
					   tag:"video",
					   allowHtml:true,
					   classes : "cgcRemoteVideo"
				   },
				   {
					   name: "localVideo",
					   tag:"video",
					   allowHtml:true,
					   classes : "cgcLocalVideo bsftPrimarySeparator cgcHide"
					   
				   },
				   {
					   name: "selfViewControl",
					   tag:"img",
					   attributes : {
							title : htmlEscape(jQuery.i18n.prop("cgc.tooltip.selfview.off"))
					   },
					   classes: "cgcSelfView",
					   src	: "branding/assets/self-view_i.svg?ts=" + window.ts,
					   allowHtml:true,
					   ontap:"showHideSelfView",
					   events: {
							onmouseover : "selfViewOnMouseover",
							onmouseout : "selfViewOnMouseout",
							onmousedown: "selfViewOnKeydown",
							onmouseup: "selfViewOnMouseover"
						 },
				   }     
				]
			}],
			create : function() {
				this.inherited(arguments);
				this.$.remoteVideo.setAttribute("autoplay", "autoplay");
				this.$.localVideo.setAttribute("autoplay", "autoplay");
				this.$.localVideo.setAttribute("muted", "true");
				this.setAspectRatio(this.getTranslatedAspectRatio());
				//this.doLayout(true);
			},
			getTranslatedAspectRatio: function(){
				var aspectRatioObj = SIP.Utils.getTranslatedResolution(window.cgcConfig.videoResolution);
				return aspectRatioObj.width/aspectRatioObj.height;
			},
			attachCallSession:function(callsession){
				this.setCallSession(callsession);
				//this.getWebRTCSession().layoutRefresh();
				//this.resized();
			},
			showHideSelfView : function() {
				if(this.getLocalMediaSrc()){
					if(this.getIsSelfViewActive()){
						this.hideSelfView();
					}else{
						this.showSelfView();
					}
				}
				
			},hideSelfView: function(){
				this.$.localVideo.addClass("cgcHide");
				this.$.selfViewControl.setAttribute("title", htmlEscape(jQuery.i18n.prop("cgc.tooltip.selfview.on")));
				this.setIsSelfViewActive(false);

			}, showSelfView: function(){
				this.$.localVideo.removeClass("cgcHide");
				this.$.selfViewControl.setAttribute("title", htmlEscape(jQuery.i18n.prop("cgc.tooltip.selfview.off")));
				this.setIsSelfViewActive(true);
			},hideRemoveVideo: function(){
				this.$.remoteVideo.addClass("cgcHide");
			},showRemoveVideo: function(){
				this.$.remoteVideo.removeClass("cgcHide");
			},
			selfViewOnMouseover : function(inSender, inEvent){
				this.$.selfViewControl.setAttribute('src', 'branding/assets/self-view_h.svg');
			},
			selfViewOnMouseout : function(inSender, inEvent){
				this.$.selfViewControl.setAttribute('src', 'branding/assets/self-view_i.svg');
			},
			selfViewOnKeydown : function(inSender, inEvent){
				this.$.selfViewControl.setAttribute('src', 'branding/assets/self-view_p.svg');
			},
			setVideoSource: function(remoteSrc, localSrc){
					
				
					this.$.localVideo.setAttribute("src", localSrc);
					this.setLocalMediaSrc(localSrc);
			
					this.$.remoteVideo.setAttribute("src", remoteSrc);
					this.setRemoteMediaSrc(remoteSrc);
					
					var localVideo = document.getElementById(this.$.localVideo.id);
					var remoteVideo = document.getElementById(this.$.remoteVideo.id);
					var self = this;
					
					/*if(this.getIsVideoActive()){
						if(this.getIsSelfViewActive()){
							setTimeout(function(){self.showSelfView();},2);
						}
						
					}*/
					
					/*
					 * The VideoPane does not grows based on their parent unless the actual videos 
					 * is not started, and then it shrinks/expands to the expected size. This creates a bad flickering effect
					 * The below code ensures the localVideoPane is shown only when the localVideo stream is present 
					 * and stops the flickering effect.
					 */
					
					
					try{
						
					
						localVideo.addEventListener("loadedmetadata", getLocalMetadata);
						
						if (localVideo.readyState >= 2) {
							getLocalMetadata(localVideo);
						}
	
						function getLocalMetadata(){
							try{
								if(localVideo.videoWidth>0 || localVideo.videoHeight>0){

									if(self.getIsSelfViewActive()){
										self.showSelfView();
									}
										
									
								}
								
								
							}catch(e){}
						}
					}catch(e){}
					
					
					
					
					
					
					/*
					 * currently there are some flickering noticed with the video panel, 
					 * when the incoming resolution is changed by WebRTC/UVS from what has been 
					 * negotiated through ExSip durin the call connection. 
					 * 
					 * To stop that flickering the video is always shown with the negotiated resolution.
					 * 
					 * The below code is commented by purpose 
					 * as it was changing the video pane dimension based on incoming video resolution.
					 */					
					
					
					
					var self = this;
					try{
						
					
						remoteVideo.addEventListener("loadedmetadata", getRemoteMetadata);
						
						if (remoteVideo.readyState >= 2) {
							getRemoteMetadata(remoteVideo);
						}
	
						function getRemoteMetadata(){
							try{
								if(LOGGER.API.isDebug()){
									LOGGER.API.debug("webrtcWidget.js","Incoming video resolution  WxH=>" 
											+ remoteVideo.videoWidth + "x" + remoteVideo.videoHeight 
											+ ", with resolution =" + (remoteVideo.videoWidth / remoteVideo.videoHeight));
								}
								
							
								
								/*The below code is commented by purpose 
								as it was changing the video pane dimension based on incoming video resolution.*/
								/*var videoAspectRatio = (remoteVideo.videoWidth / remoteVideo.videoHeight);
								if(!isNaN(videoAspectRatio) && videoAspectRatio>0 && self.getAspectRatio() != videoAspectRatio){
									self.setAspectRatio(videoAspectRatio ); 
									self.doLayout(true);
								}*/
								
							}catch(e){}
						}
					}catch(e){}
				
					
					
					
				
			},doLayout: function(isForced){

				var videoContainerParent = this;

				if(this.getIsVideoActive() || isForced){
					var aspectRatio = this.getAspectRatio();
					aspectRatio = aspectRatio>0?aspectRatio:this.getTranslatedAspectRatio();
					var videoContainer = this.$.videoContainer;
					var remoteVideo = this.$.remoteVideo;
					try{
							if(aspectRatio>0){
								var height = getHeight(videoContainerParent.id) ;
								var width = getWidth(videoContainerParent.id) ;
								if(!this.getIsSetToDocker()){
									height = height - 60;
								}
								var ratioWidth = aspectRatio * height;
								if(ratioWidth > width){
									height =  width / aspectRatio;
								}else{
									width = ratioWidth;
								}
								if(this.getIsSetToDocker()){
									height = height + 1; //some adjustment to the calculation for the decimal part
								}
								videoContainer.applyStyle("width",width + "px");
								videoContainer.applyStyle("height",height + "px");
								if(isForced){
									videoContainer.render();
								}
							}
					}catch(e){
						LOGGER.API.error("webrtcWidget.js","Error while processing doLayout ", e);
					}
					
					
				}
				
				
				
	
			
			},layoutRefresh: function(){
				
			},resizeHandler : function() {
				this.doLayout(false);
			}, 
			
			//SIP API integration
			initConference:function(isVideo){
				if(this.getCallSession() == null || !this.getCallSession().isCallConnected()){
					this.setIsActive(true);

					this.setSipController(new SIP.Controller());
					
					this._initWebRTCSession();
					this.getSipController().call({
						'number':window.cgcProfile.dialNum,
						'isVideo':isVideo,
						'confId':window.cgcProfile.confId,
						'securityPin':window.cgcProfile.securityPin,
						'confType':window.cgcProfile.confType
					});
					this.setIsVideoActive(isVideo);
					
					
					window.cgcComponent.basePanel.onInitConference();
					
					this.setAspectRatio(this.getTranslatedAspectRatio());
					this.doLayout(true);
					
					
				}
			},
			sendDTMF: function(charKey){
				if(this.getSipController()){
					this.getSipController().sendDTMFToActiveSession(charKey);
				}
			},
			_initWebRTCSession: function() {
				var self = this;
				var sipSessionHandler = this.getSipController().SIPHandler;
				sipSessionHandler.onConnected = function() {
					
				};
				sipSessionHandler.onDisconnected = function(retryLeft) {
					if(self.getIsActive() && retryLeft == 0){
					
						self._handleOnWebRTCEnd();
					}
					
				};
				sipSessionHandler.onNewCallSession = function(callSession) {
					callSession.handler = {
							onFailed : function ( CallSession ) {
								self._handleOnWebRTCEnd();
							},
							onStarted : function ( CallSession ) {
							},
							//called when a call is answered by any party
							onConnected : function ( CallSession ) {
								window.stropheXMPPInterface.sendOnCallPresenceStatus(self.getSipController().getUri());
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
								window.cgcComponent.basePanel.onMuteUnMute(true);
							},
							onUnMute : function ( CallSession ) {
								window.cgcComponent.basePanel.onMuteUnMute(false);
							},
							onResume : function ( CallSession ) {
							},
							onEnd : function ( CallSession ) {
								self._handleOnWebRTCEnd();
								
							},
							onMediaStateUpdate : function ( callSession ) {
								self.setVideoSource(callSession.remoteVideoSrc, callSession.localVideoSrc);
								/*if(callSession.isVideoActive() && !self.getIsVideoActive()){
									window.cgcComponent.basePanel.showVideoConference(callSession);
								}else if(!callSession.isVideoActive() && self.getIsVideoActive()){
									window.cgcComponent.basePanel.hideVideoConference(callSession);
								}*/
							},
							onVolumeChange : function ( volume ) {
							},
				            onDiversion: function(p_asserted_identity, remoteNumber, remoteName){
				                
							}

						};
						self.attachCallSession(callSession);
						
				};

				
				var config  = {
						'wrsAddress': window.cgcConfig.wrsAddressList,
				        'stun_servers': window.cgcConfig.wsStunServer,
				        'stunPort':window.cgcConfig.wsStunPort,
				        'trace_sip': true,
				        'enable_ims': false,
				        'domainTo' : window.cgcConfig.wrsDomainTo,
						'domainFrom' : window.cgcConfig.wrsDomainFrom,
						'enableSendingConfIdAsSipUriHeader':window.cgcConfig.enableSendingConfIdAsSipUriHeader,
						'isVideoAllowed':true,
						'videoSizeText':window.cgcConfig.videoResolution,
						'isOutgoingCallSelected':true

				};

				this.getSipController().init(config);
				

			},
			switchVideo:function(isVideo){
				if (this.getIsActive() && this.getCallSession() != null) {
					this.setIsVideoActive(isVideo);
					var result = this.getCallSession().switchVideo(isVideo);
					if(result.result){
						
						if(isVideo){
							window.cgcComponent.basePanel.showVideoConference();
						}else{
							window.cgcComponent.basePanel.hideVideoConference();
							
							/* Just hide the videos. This shall be relayout  and shown again when the 
							 * actual video stream is available.
							 * This approach is required to resolve any flickering effect.
							 */
							
							this.$.localVideo.addClass("cgcHide");
						}
					}
					
				}
			},
			muteUnMuteWebRTC: function(){
				if (this.getIsActive() && this.getCallSession() != null) {
					if(this.getCallSession().isMuted()){
						this.getCallSession().unmute();
					}else{
						this.getCallSession().mute();
					}
					return true;
				}
				return false;
			},
			isMuted: function(){
				if (this.getIsActive() && this.getCallSession() != null) {
					return this.getCallSession().isMuted();
				}
				return false;
			},
			endWebRTC :function(){
				
				if(this.getIsActive() || this.getCallSession() != null){
					this.setContainer("");
					this.setOwner("");
					this.setIsActive(false);
					this.getSipController().terminate();
					window.stropheXMPPInterface.sendOnCallPresenceStatus(null);
					this.attachCallSession(null);
					this._reset();
				
				}
				
			}, 
			_handleOnWebRTCEnd: function(){
				if(this.getIsActive()){
					if(!this.getCallSession()){
						errorMessage("cgc.error.webrtc",
								window.cgcProfile.conferenceDetailedInformation);
					}
					
					
					try{
						this.setContainer("");
						this.setOwner("");
						window.cgcComponent.basePanel.onEndWebRTC();
						this.setIsActive(false);
						this.getSipController().terminate();
						window.stropheXMPPInterface.sendOnCallPresenceStatus(null);
						this.attachCallSession(null);
						this._reset();
					}catch(e){
						
					}
					
				}
				
			}, _reset: function(){
				
				this.hideSelfView();
				this.setIsSelfViewActive(true);
				this.setCallSession(null);
				
				this.setIsVideoActive(false);
				
				this.setIsSetToDocker(false);
				this.setAspectRatio(this.getTranslatedAspectRatio());
				this.setSipController(null);
				this.setRemoteMediaSrc(null);
				this.setLocalMediaSrc(null);
			}

		})