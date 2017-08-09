/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

/**
 * This file constructs the sliding panels for the application
 */
var isErrorSent = false;
var callStarted = false;
var WrsListener= function(){
	
	this.active = true;
	this.onWebRTCConnected = function() {
		if ( !this.active ) return; 
		console
				.log("CollaborateGuestCliet:basepanel:doWebRTCCall():WebRTC Connected");
		window.cgcComponent.basePanel.setIsWebRTCConnected(true);
		
		var destination = window.cgcProfile.dialNum;
		if(window.cgcConfig.enableInBandDTMFSupport){
			var confid = window.cgcProfile.confId.replace("#","");
			if(window.cgcProfile.confType.toUpperCase()=="UVS"){
				destination = window.wrsclient.validateDestination(window.cgcProfile.dialNum+";roomid="+confid)+";user=phone";
			}else{
				destination = window.wrsclient.validateDestination(window.cgcProfile.dialNum+";confid="+confid)+";user=phone";
			}
			
		}
		
		
		window.wrsclient.sipStack.call(destination);
	
	}
	this.onceWebRTCStarted = function(e) {
		if ( !this.active ) return; 
		if(window.wrsclient){
			var phoneId = ""+window.wrsclient.sipStack.ua.configuration.uri;
		 BoshSession.sendOnCallPresenceStatus(phoneId);
		}
		if (!window.cgcComponent.basePanel.getIsWebRTCSessionInitated()) {
			window.cgcComponent.basePanel.setIsWebRTCSessionInitated(true);
			window.cgcComponent.basePanel.endWebRTC();
		}else{
		callStarted = true;
		var dtmfTones = ',,' + window.cgcProfile.confId;
		var securityPin = ',,' + window.cgcProfile.securityPin;
	
		if(!window.cgcConfig.enableInBandDTMFSupport){
			if (e.data && !e.data.isReconnect) {
				window.wrsclient.sipStack.sendDTMF(dtmfTones);
			}
		}
		if (e.data && window.cgcProfile.securityPin) {
			window.wrsclient.sipStack.sendDTMF(securityPin);
		}
		}
	}
	this.onWebRTCEnded = function() {
		if ( !this.active ) return; 
		this.active = false;

		window.cgcComponent.basePanel.endWebRTC();
		
		// BoshSession.sendOnCallPresenceStatus(null);
		
	}
	this.onWebRTCDisconnected = function() {
		if ( !this.active ) return; 
		

		BoshSession.sendOnCallPresenceStatus();
		
		if (!window.cgcComponent.basePanel.getIsEndWebRTCRequested()) {
			window.failedCount++;
			if (window.failedCount === window.wsURLCount) {
	
				this.active = false;
				if(!isErrorSent){
					errorMessage("cgc.error.webrtc",
							window.cgcProfile.conferenceDetailedInformation);
					isErrorSent = true;
					window.cgcComponent.basePanel.endWebRTC();
				}
			}
		}
	}
	this.onWebRTCFailed = function() {
		if ( !this.active ) return; 
		this.active = false;

		BoshSession.sendOnCallPresenceStatus();
		
		if (!window.cgcComponent.basePanel.getIsEndWebRTCRequested()) {
	
				
				if(!isErrorSent && !callStarted){
					errorMessage("cgc.error.webrtc",
							window.cgcProfile.conferenceDetailedInformation);
					isErrorSent = true;
					window.cgcComponent.basePanel.endWebRTC();
				}
		}
	}
}
enyo
		.kind({
			kind : "enyo.FittableColumns",
			id : "com.broadsoft.cgc.BasePanel",
			name : "kind.com.broadsoft.cgc.BasePanel",
			classes : "cgcBasePanel",
			initialRoster : [],
			fit : false,
			published : {
				isFullScreen : true,
				chatPanel : undefined,
				hiddenVideoPanel : undefined,
				screenSharePanel : undefined,
				isWebRTCSessionInitated : false,
				isWebRTCConnected:false,
				isVideo : false,
				isScreenShareOn : false,
				isMute : false,
				isEndWebRTCRequested : false,
				isViewableChat : true
			},

			components : [ {
				kind : "kind.com.broadsoft.cgc.LeftPanel",
				id : "com.broadsoft.cgc.LeftPanel",
				name : "cgcLeftPanel",
				classes : "cgcLeftPanel",
				fit : false
			}, {
				kind : "kind.com.broadsoft.cgc.RightPanel",
				id : "com.broadsoft.cgc.RightPanel",
				name : "cgcRightPanel",
				classes : "cgcRightPanel",
				fit : true
			}, {
				kind : "onyx.Item",
				id : "com.broadsoft.cgc.HiddenVideoPanel",
				name : "HiddenVideoPanel",
				style : "display:none",
				fit : false
			},{kind : "enyo.Signals",
				onkeydown : "keyDown"
				}],
			handlers : {
				unload : "logoutXMPP"
			},
			keyDown : function(inSender, inEvent) {
				var keyCode = inEvent.shiftKey ? inEvent.keyCode - 16: inEvent.keyCode;
				if(inEvent.srcElement.id != "cgcTextArea" && window.wrsclient && keyCode === 35 ){
					window.wrsclient.sipStack.sendDTMF("#");
				}
			},
			rendered : function() {
				this.inherited(arguments);
				this.layoutRefresh(false);
			},
			renderRightPane : function() {
				this.$.cgcRightPanel.renderContainerPane();
			},
			renderLeftPane : function() {
				this.$.cgcLeftPanel.render();
			},
			create : function() {
				this.inherited(arguments);
				
				this.$.cgcLeftPanel.setParent(this);
				this.$.cgcRightPanel.setParent(this);
				this.setChatPanel(new kind.com.broadsoft.cgc.ChatPanel());
				this.$.cgcRightPanel.setChatPanel(this.getChatPanel());

			},
			hidePopup : function(sender,msg){
				this.$.cgcRightPanel.hidePopup(sender,msg);
			},
			showPopup : function(sender,msg){
				this.$.cgcRightPanel.showPopup(sender,msg);
			},
			showScreenSharePanel : function() {
				console.log("basepanel:showScreenSharePanel");
				this.setIsScreenShareOn(true);
				if (this.getIsWebRTCSessionInitated()) {

					if (!this.getIsVideo()) {
						this.$.cgcLeftPanel.showChatPanel(this.getChatPanel());
						this.$.cgcRightPanel.removeChatPanel();
						this.$.cgcLeftPanel.render();
					} else {

						this.$.cgcLeftPanel.showVideo(this.getIsVideo());
					}

				} else {

					this.$.cgcLeftPanel.showChatPanel(this.getChatPanel());
					this.$.cgcRightPanel.removeChatPanel();
				}

				this.$.cgcRightPanel.showScreenSharePanel(new cgc.ScreenArea());
				this.renderRightPane();
				this.layoutRefresh();
				this.reloadWebRTC();
			},
			removeScreenSharePanel : function() {

				this.setIsScreenShareOn(false);
				if (this.getIsWebRTCSessionInitated()) {

					if (!this.getIsVideo()) {
						var webrtc = new kind.com.broadsoft.cgc.webrtc();
						webrtc.setId("hiddenPanelWebRTC");
						this.prepareHiddenVideoPanel(webrtc);
						this.$.cgcRightPanel.showChatPanel(this.getChatPanel());
						this.$.cgcLeftPanel.removeChatPanel();
						this.$.cgcRightPanel.render();
						this.$.cgcLeftPanel.render();
					} else {

						this.$.cgcRightPanel.showVideo(this.getIsVideo());
						this.$.cgcLeftPanel.destroyVideoWidget();
						this.$.cgcLeftPanel.setVideoDisable(true);
						this.renderLeftPane();
						this.$.cgcLeftPanel.layoutRefresh();
					}

				} else {
					this.$.cgcRightPanel.showChatPanel(this.getChatPanel());
					this.$.cgcLeftPanel.removeChatPanel();
					this.render();
				}
			},

			prepareHiddenVideoPanel : function(video) {

				if (this.getHiddenVideoPanel()) {
					this.getHiddenVideoPanel().destroy()
					this.setHiddenVideoPanel(undefined);
				}
				this.setHiddenVideoPanel(video);

				video.setContainer(this.$.HiddenVideoPanel);
				video.setOwner(this.$.HiddenVideoPanel);
				this.$.HiddenVideoPanel.render();
				var webrtc = document.getElementById("hiddenPanelWebRTC");

				window.wrsclient.client.appendTo(webrtc);
				window.wrsclient.video.updateSessionStreams();

			},
			switchVideo : function(isToVideo) {
				if (!this.getIsWebRTCSessionInitated()) {
					console
							.log("CollaborateGuestCliet:switchVideo() is in illegal state. First start the WebRTC session with startWebRTCVideo call.");
					return;
				}

				if (isToVideo == this.getIsVideo) {
					console
							.log("CollaborateGuestCliet:switchVideo() call is ignored. Already video is in "
									+ isToVideo + " mode");
					return;
				}

				if (this.getIsScreenShareOn()) {

					this.$.cgcLeftPanel.showVideo(isToVideo);
					this.$.cgcLeftPanel.onSwitchVideo(isToVideo);
				} else {

					if (!isToVideo) {
						var webrtc = new kind.com.broadsoft.cgc.webrtc();
						webrtc.setId("hiddenPanelWebRTC");
						this.prepareHiddenVideoPanel(webrtc);
						this.$.cgcRightPanel.showChatPanel(this.getChatPanel());
						this.$.cgcLeftPanel.removeChatPanel();
						this.$.cgcRightPanel.render();
						this.$.cgcLeftPanel.render();

					} else {
						this.$.cgcLeftPanel.showChatPanel(this.getChatPanel());
						this.$.cgcRightPanel.removeChatPanel();
						this.$.cgcLeftPanel.render();

						this.$.cgcRightPanel.showVideo(isToVideo);
						this.$.cgcRightPanel.onSwitchVideo(isToVideo);
					}
				}
				this.$.cgcLeftPanel.onSwitchVideo(isToVideo);
				this.layoutRefresh(isToVideo);
				window.wrsclient.setAudioOnlyOfferAndRec(!isToVideo);
				this.setIsVideo(isToVideo);
			},
			startWebRTCVideo : function(isVideo) {
				// if the WebRTC session is not started already, then start it.

				// when WeRTC is not active
				if (!this.getIsWebRTCSessionInitated()) {
					isErrorSent = false;
					this.setIsWebRTCSessionInitated(true);
					this.setIsVideo(isVideo);

					if (this.getIsScreenShareOn()) {
						var webrtc = new kind.com.broadsoft.cgc.webrtc();
						webrtc.setId("leftPanelWebRTC");
						this.$.cgcLeftPanel.prepareVideoPanel(webrtc, this
								.getIsVideo());
						this.$.cgcLeftPanel.render();

					} else {
						if (isVideo) {
							this.$.cgcLeftPanel.showChatPanel(this
									.getChatPanel());
							this.$.cgcRightPanel.removeChatPanel();
						}
						var webrtc = new kind.com.broadsoft.cgc.webrtc();
						webrtc.setId("rightPanelWebRTC");
						this.$.cgcRightPanel.prepareVideoPanel(this
								.getIsVideo());
						this.render();

					}
					this.loadUI();
					//			
					this.$.cgcLeftPanel.onStartWebRTC(isVideo);
					this.doWebRTCCall(!isVideo);
					if (this.getIsScreenShareOn()) {
						this.$.cgcLeftPanel.showVideo(isVideo);
					} else {
						this.$.cgcRightPanel.showVideo(isVideo);

					}
					this.layoutRefresh(isVideo);
				} else if (this.getIsVideo() != isVideo) {
					this.switchVideo(isVideo);
				}

			},

			muteWebRTC : function() {
				if (!this.getIsWebRTCSessionInitated()) {
					console
							.log("CollaborateGuestCliet:muteWebRTC() is in illegal state. First start the WebRTC session with startWebRTCVideo call.");
					return;
				}

				this.setIsMute(!this.getIsMute());
				if (this.getIsMute()) {
					window.wrsclient.muteAudio();
				} else {
					window.wrsclient.unmuteAudio();
				}
				this.$.cgcLeftPanel.goMute(this.getIsMute());
				this.$.cgcRightPanel.goMute(this.getIsMute());

			},

			endWebRTC : function() {
				if (!this.getIsWebRTCSessionInitated()) {
					console
							.log("CollaborateGuestCliet:endWebRTC() is in illegal state. First start the WebRTC session with startWebRTCVideo call.");
					return;
				}
				if(window.wrslistener){
                   //mark the listener as active false, so that any callback from old WRS shall be ignored 
                   window.wrslistener.active = false;
                   window.wrslistener = null;
                }

				
				if (window.wrsclient) {
					if(window.cgcComponent.basePanel.getIsEndWebRTCRequested()){
						console
						.log("CollaborateGuestCliet:endWebRTC(): end the current call.");

						try{window.wrsclient.endCall();}catch(e){}
					}
					
					
					try{window.wrsclient.sipStack.terminateSessions();}catch(e){}
					try{window.wrsclient.sipStack.ua.unregister();}catch(e){}
					try{window.wrsclient.sipStack.ua.stop();}catch(e){}
					console.log("CollaborateGuestCliet:endWebRTC(): WebRTC stopped.");
					BoshSession.sendOnCallPresenceStatus(null);
					window.wrsclient.sipStack.ua = null;
					window.wrsclient = null;
				}
				this.setIsWebRTCSessionInitated(false);
				this.setIsVideo(false);
				if (this.getIsScreenShareOn()) {
					this.$.cgcLeftPanel.endWebRTC();
					this.$.cgcLeftPanel.setVideoDisable(true);
					this.$.cgcLeftPanel.render();

				} else {
					this.$.cgcRightPanel.endWebRTC();
					this.$.cgcRightPanel.showChatPanel(this.getChatPanel());
					this.$.cgcLeftPanel.removeChatPanel();
					this.render();
				}
				this.$.cgcLeftPanel.endCall();
				this.$.cgcRightPanel.goMute(false);
				window.cgcComponent.basePanel.setIsEndWebRTCRequested(false);
				callStarted = false;
			},
			resizeHandler : function() {
				this.inherited(arguments);
				this.reloadWebRTC();
			},
			reloadWebRTC : function() {
				if (this.getIsVideo()) {
						if (this.$.cgcLeftPanel.getVideoWidget() != undefined)
							this.$.cgcLeftPanel.getVideoWidget().reloadWebRTC(true);
						
						if (this.$.cgcRightPanel.getVideoWidget() != undefined)
							this.$.cgcRightPanel.getVideoWidget().reloadWebRTC(false);
				}
			},
			showFullScreen : function(inSender, inEvent) {
				if (window.cgcComponent.basePanel.getIsFullScreen()) {
					if (window.cgcComponent.basePanel.$.cgcLeftPanel.getVideoWidget()) {
						window.cgcComponent.basePanel.$.cgcLeftPanel.$.VideoPanel.applyStyle(
								"display", "none");
					} else {
						window.cgcComponent.basePanel.$.cgcLeftPanel.$.VideoPanel.applyStyle(
								"display", null);
					}
					window.cgcComponent.basePanel.$.cgcRightPanel.applyStyle("left", "-320px");
					window.cgcComponent.basePanel.$.cgcRightPanel.applyStyle("width", "100%");
					window.cgcComponent.basePanel.$.cgcLeftPanel.$.accordionItems.hide();
					window.cgcComponent.basePanel.setIsFullScreen(false);
				} else {
					window.cgcComponent.basePanel.$.cgcRightPanel.hidePopup();
					window.cgcComponent.basePanel.$.cgcRightPanel.applyStyle("left", "0px");
					window.cgcComponent.basePanel.$.cgcRightPanel.applyStyle("width", "100%");
					window.cgcComponent.basePanel.setIsFullScreen(true);
					window.cgcComponent.basePanel.$.cgcLeftPanel.$.accordionItems.show();
					window.cgcComponent.basePanel.$.cgcLeftPanel.$.VideoPanel.applyStyle(
							"display", null);

				}
				window.cgcComponent.basePanel.$.cgcRightPanel.showFullScreen();
				this.layoutRefresh();
				this.resized();

			},
			doWebRTCCall : function(isAudio) {
				//destroy old instance, if exist.
			    if(window.wrsclient || window.wrslistener ){
			      try{    
			    	  window.cgcComponent.basePanel.endWebRTC() 
			      }catch(e) {}
			    }

			    //create a new listener always whenever new webRTCSession started.
			    window.wrslistener= new WrsListener();

				var client = new WebRTC.Client();
				document.onkeypress=function(e)
			      {
					
			      };
				window.failedCount = 0;
				window.wrsclient = client;
				if (isAudio) {

					window.wrsclient.setAudioOnlyOfferAndRec(true);
				}

				client.eventBus.on("connected", window.wrslistener.onWebRTCConnected.bind(window.wrslistener));

				client.eventBus.once("started", window.wrslistener.onceWebRTCStarted.bind(window.wrslistener));
				
				client.eventBus.on("ended", window.wrslistener.onWebRTCEnded.bind(window.wrslistener));

				client.eventBus.on("disconnected", window.wrslistener.onWebRTCDisconnected.bind(window.wrslistener));
				
				client.eventBus.on("failed", window.wrslistener.onWebRTCFailed.bind(window.wrslistener));
				
			},
			loadUI : function(inSender, inEvent) {
				var webrtc = document.getElementById("rightPanelWebRTC");
				if (!webrtc) {
					webrtc = document.getElementById("leftPanelWebRTC");
				}
				webrtc.innerHTML = getWebRTC();
			},
			logoutXMPP : function(inSender, inEvent) {
				window.cgcComponent.xmppInterface.logoutXmpp();
			},
			isScreenShareEnabled : function() {
				if (this.getScreenSharePanel()) {
					return true;
				} else {
					return false;
				}
			},
			layoutRefresh : function(isVideo) {
				if (isVideo == undefined) {
					isVideo = this.getIsVideo();
				}
				if (!window.cgcComponent.basePanel.getIsFullScreen()) {
					if (window.cgcComponent.basePanel.$.cgcLeftPanel.getVideoWidget()) {
						window.cgcComponent.basePanel.$.cgcLeftPanel.$.VideoPanel.applyStyle(
								"display", "none");
					} else {
						window.cgcComponent.basePanel.$.cgcLeftPanel.$.VideoPanel.applyStyle(
								"display", null);
					}
				} else {
					window.cgcComponent.basePanel.$.cgcLeftPanel.$.VideoPanel.applyStyle(
							"display", null);

				}
				
				this.$.cgcLeftPanel.layoutRefresh(isVideo);
				this.$.cgcRightPanel.layoutRefresh(isVideo);
				this.$.cgcLeftPanel.resized();
				this.$.cgcRightPanel.resized();
			}
		});

var selfViewOnOrOff = function(){
	window.cgcComponent.cgcLeftPanel.$.conferenceWidget.goForWebRTCSelfView();
}

var selfViewOnMouseover = function(){
	$('#selfview').attr('src',('branding/assets/self-view_h.svg'));
}

var selfViewOnMouseout = function(){
	$('#selfview').attr('src',('branding/assets/self-view_i.svg'));
}

var selfViewOnKeydown = function(){
	$('#selfview').attr('src',('branding/assets/self-view_p.svg'));
}


// monitoring the mouse position for every mouse click after login into application
jQuery(function($) {
	window.currentMousePos = { x: -1, y: -1 };
    $(document).mousedown(function(event) {
        window.currentMousePos.x = event.pageX;
        window.currentMousePos.y = event.pageY;
    });

});


