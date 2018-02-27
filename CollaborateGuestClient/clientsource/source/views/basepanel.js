/**
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

/**
 * This file constructs the sliding panels for the application
 */

enyo
        .kind({
            kind : "enyo.FittableColumns",
            id : "com.broadsoft.cgc.BasePanel",
            name : "kind.com.broadsoft.cgc.BasePanel",
            classes : "cgcBasePanel",
            fit : true,
            published : {
                isFullScreen : false,
                chatPanel : undefined,
                webRTCSession : undefined,
                screenSharePanel : undefined,
                isScreenShareOn : false,
                isChatPaneShowing : true,
                chatPopup : null
            },

            components : [ {
                kind : "kind.com.broadsoft.cgc.ViewPanel",
                id : "com.broadsoft.cgc.ViewPanel",
                name : "cgcViewPanel",
                classes : "cgcViewPanel bsftPrimarySeparator",
                fit : true
            }, {
                kind : "kind.com.broadsoft.cgc.DockerPanel",
                id : "com.broadsoft.cgc.DockerPanel",
                name : "cgcDockerPanel",
                classes : "cgcDockerPanel",
                fit : false
            }, {
                kind : "enyo.Signals",
                onkeydown : "keyDown"
            } ],
           
            keyDown : function(inSender, inEvent) {
	            /*var keyCode = inEvent.shiftKey ? inEvent.keyCode - 16
	                    : inEvent.keyCode;*/
	            var charKey = inEvent.key;
	            if (inEvent.srcElement.id != "cgcTextArea" 
	            	&& inEvent.srcElement.id != "callMeNumberText" && this.getWebRTCSession()) {
	            	this.getWebRTCSession().sendDTMF(charKey);
	            }
            },
            rendered : function() {
	            this.inherited(arguments);
	            this.layoutRefresh();
            },
            create : function() {
	            this.inherited(arguments);

	            this.$.cgcDockerPanel.setParent(this);
	            this.$.cgcViewPanel.setParent(this);
	            this.setChatPanel(new kind.com.broadsoft.cgc.ChatPanel());
	            this.$.cgcViewPanel.setChatPanel(this.getChatPanel());

            },
            getViewPanelId : function() {
	            return this.$.cgcViewPanel.id;
            },
            hideChatPopup : function(sender, msg) {
	            if (this.getChatPopup()) {
		            this.getChatPopup().hidePopup();
	            }
            },
            showChatPopup : function(sender, msg) {
	            if (!this.getChatPopup()) {
		            this.setChatPopup(new kind.cgc.basicPopup());
	            }
	            this.getChatPopup().showPopup(sender, msg);
            },
            showScreenSharePanel : function() {
	            if (!this.getScreenSharePanel()) {
		            this.setScreenSharePanel(new cgc.ScreenArea());
	            }
	            if (!this.getScreenSharePanel().getIsActive()) {
		            this.getScreenSharePanel().prepare();
		            this.setIsScreenShareOn(true);
	            }

            },
            onParticipantShareStarted : function() {
	            if (this.getWebRTCSession() != null
	                    && this.getWebRTCSession().getIsVideoActive()) {
		            this.$.cgcViewPanel.detachCallContainer();
		            this.$.cgcDockerPanel.attachCallContainer();
	            } else {
		            this.$.cgcDockerPanel.showChatPanel(this.getChatPanel());
	            }

	            this.$.cgcViewPanel.showScreenSharePanel(this
	                    .getScreenSharePanel());
	            this.layoutRefresh();
            },
            removeScreenSharePanel : function() {
	            if (this.getScreenSharePanel()) {
		            this.getScreenSharePanel().stop();
		            this.setIsScreenShareOn(false);
		            if (this.getWebRTCSession() != null
		                    && this.getWebRTCSession().getIsVideoActive()) {

			            this.$.cgcViewPanel.attachCallContainer();
			            this.$.cgcDockerPanel.detachCallContainer();

		            } else {
			            if (this.$.cgcDockerPanel) {
				            this.$.cgcDockerPanel.removeChatPanel();
			            }
			            if (this.$.cgcViewPanel) {
				            this.$.cgcViewPanel.showChatPanel(this
				                    .getChatPanel());
			            }

		            }
		            this.layoutRefresh();
	            }

            },
            startWebRTCVideo : function(isVideo) {

	            var webrtc = this.getWebRTCSession();
	            if (webrtc == null) {
		            webrtc = new kind.com.broadsoft.cgc.webrtc();
		            this.setWebRTCSession(webrtc);

	            }

	            if (webrtc && !webrtc.getIsActive()) {
		            webrtc.initConference(isVideo)

	            } else {
		            webrtc.switchVideo(isVideo);
	            }

            },
            onInitConference : function() {

	            var webrtc = this.getWebRTCSession();
	            if (webrtc && webrtc.getIsActive()) {
		            if (webrtc.getIsVideoActive()) {
			            this.$.cgcDockerPanel.onStartWebRTC(true);
			            if (this.getIsScreenShareOn()) {
				            this.$.cgcDockerPanel.attachCallContainer();
			            } else {
				            this.$.cgcDockerPanel.showChatPanel(this
				                    .getChatPanel());
				            this.$.cgcViewPanel.attachCallContainer();
			            }
			            this.layoutRefresh();
		            } else {
			            this.$.cgcDockerPanel.onStartWebRTC(false);
			            this.$.cgcDockerPanel.attachCallContainer();

		            }
	            }

            },
            showVideoConference : function() {

	            var webrtc = this.getWebRTCSession();
	            if (webrtc && webrtc.getIsActive()) {
		            this.$.cgcDockerPanel.onSwitchVideo(true);
		            if (this.getIsScreenShareOn()) {
			            this.$.cgcDockerPanel.attachCallContainer();
			            this.$.cgcDockerPanel.layoutRefresh();
		            } else {
			            this.$.cgcDockerPanel
			                    .showChatPanel(this.getChatPanel());
			            this.$.cgcViewPanel.attachCallContainer();
			            this.layoutRefresh();
		            }

	            }

            },
            hideVideoConference : function() {
	            var webrtc = this.getWebRTCSession();
	            if (webrtc && webrtc.getIsActive()) {
		            this.$.cgcDockerPanel.attachCallContainer();

		            if (!this.getIsScreenShareOn()) {
			            this.$.cgcViewPanel.detachCallContainer();
			            this.$.cgcDockerPanel.removeChatPanel();
			            this.$.cgcViewPanel.showChatPanel(this.getChatPanel());
			            this.layoutRefresh();
		            } else {
			            this.$.cgcDockerPanel.layoutRefresh();
		            }
		            this.$.cgcDockerPanel.onSwitchVideo(false);

	            }

            },
            muteUnMuteWebRTC : function() {
	            var webrtc = this.getWebRTCSession();
	            if (webrtc && webrtc.getIsActive()) {
		            webrtc.muteUnMuteWebRTC();
	            }
            },
            onMuteUnMute : function(isMuted) {
	            this.$.cgcDockerPanel.goMute(isMuted);
	            this.$.cgcViewPanel.goMute(isMuted);
            },

            endWebRTC : function() {
	            var webrtc = this.getWebRTCSession();
	            if (webrtc && webrtc.getIsActive()) {
		            webrtc.endWebRTC();
	            }

	            // upfront closure
	            this.onEndWebRTC();
            },
            onEndWebRTC : function() {
	            this.$.cgcDockerPanel.onEndWebRTC();

	            if (!this.getIsScreenShareOn()) {
		            this.$.cgcViewPanel.detachCallContainer();
		            this.$.cgcDockerPanel.removeChatPanel();
		            this.$.cgcViewPanel.showChatPanel(this.getChatPanel());
		            this.layoutRefresh();

	            } else {
		            this.$.cgcDockerPanel.detachCallContainer();
		            this.$.cgcDockerPanel.layoutRefresh();
	            }

            },

            showFullScreen : function(inSender, inEvent) {
	            if (this.getIsFullScreen()) {
	            	if(this.getIsChatPaneShowing()){
	            		this.hideChatPopup();
	            	}
		            
		            this.setIsFullScreen(false);

		            this.$.cgcDockerPanel.removeClass("cgcHide");

	            } else {

		            this.$.cgcDockerPanel.addClass("cgcHide");
		            this.setIsFullScreen(true);
	            }
	            this.$.cgcViewPanel.onFullScreen()
	            this.layoutRefresh();

            },
            onLogout : function() {
				enyo.Signals.send("onSharePopupDisplay", {
					popupDisplay : "hide"
				});
            	 
            	this.endWebRTC();
				
				if(this.$.cgcDockerPanel){
					 this.$.cgcDockerPanel.hideAlternateDialInNumbersPopup();
				}
				
				this.hideChatPopup();
				
				
				
            },
            isScreenShareEnabled : function() {
	            if (this.getScreenSharePanel()) {
		            return true;
	            } else {
		            return false;
	            }
            },
            isConfActive : function() {
	            return this.getWebRTCSession() ? this.getWebRTCSession()
	                    .getIsActive() : false;
            },
            layoutRefresh : function() {
	            if (window.isLogin) {
		            if (this.$.cgcDockerPanel) {
			            this.$.cgcDockerPanel.layoutRefresh();
		            }

		            if (this.$.cgcViewPanel) {
			            this.$.cgcViewPanel.layoutRefresh();
		            }

		            if (this.getWebRTCSession()
		                    && this.getWebRTCSession().getIsActive()) {
			            this.getWebRTCSession().layoutRefresh();
		            }
		            this.resized();
	            }

            }
        });
