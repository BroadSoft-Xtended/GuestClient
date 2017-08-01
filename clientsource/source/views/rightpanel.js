/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/
var isFullScreenActivated = false;
var minPopupMessageDispalyedinSeconds=3;
var maxPopupMessageDispalyedinSeconds=5;
var popupMessages=[];
var isShowPopupMessage = false;
MessageQueue = function() {

	this.message = null;
	this.sender = null;
};
enyo
		.kind({
			name : "kind.com.broadsoft.cgc.RightPanel",
			layoutKind : "FittableRowsLayout",
			published : {
				videoWidget : undefined,
				screenWidget : undefined,
				chatWidget : undefined,
				parent : undefined,
				isVideoHiding : false
			},
			onStartWebRTC : function(isVideo) {
			},
			onSwitchVideo : function(isVideo) {
				this.setVideoDisable(!isVideo);
			},
			destroyVideoWidget : function() {
				if (this.getVideoWidget()) {
					this.setIsVideoHiding(false);
					this.getVideoWidget().destroy();
					this.setVideoWidget(undefined);
				}
			},
			renderContainerPane : function() {
				this.$.RightPanelComponentContainer.render();
			},
			showScreenSharePanel : function(screenShare) {
				this.setScreenWidget(screenShare);
				this.setChatWidget(undefined);
				if (this.getVideoWidget()) {
					this.destroyVideoWidget();
				}
				screenShare.setContainer(this.$.RightPanelComponentContainer);
				screenShare.setOwner(this.$.RightPanelComponentContainer);
				this.renderContainerPane();
			},
			showChatPanel : function(chatPanel) {
				this.destroyVideoWidget();
				if (this.getScreenWidget()) {
					this.getScreenWidget().destroy();
					this.setScreenWidget(undefined);
				}
				this.setChatPanel(chatPanel);
				if(!window.cgcComponent.basePanel.getIsFullScreen()){
					this.doFullScreen();
				}
				chatPanel.swapChatPanel(true);
				// TODO try to remove applyStyle
				chatPanel.applyStyle("height", "100%");
				this.render();
				chatPanel.resized();

			},
			setChatPanel : function(chatPanel) {
				this.$.RightPanelComponentContainer
				this.$.fullscreenButtoninHeader.hide();
				
				chatPanel.setContainer(this.$.RightPanelComponentContainer);
				chatPanel.setOwner(this.$.RightPanelComponentContainer);
				this.setScreenWidget(undefined);
				this.setChatWidget(chatPanel);
			},
			removeChatPanel : function() {
				
				this.$.fullscreenButtoninHeader.show();
			},
			endWebRTC : function() {

				this.destroyVideoWidget();

			},
			prepareVideoPanel : function(isVideo) {
				
				if (this.getScreenWidget()) {
					this.getScreenWidget().destroy();
					this.setScreenWidget(undefined);
				}

				var video = new kind.com.broadsoft.cgc.webrtc();
				video.setId("rightPanelWebRTC");
				video.setContainer(this.$.RightPanelComponentContainer);
				video.setOwner(this.$.RightPanelComponentContainer);

				this.setVideoWidget(video);
				this.setVideoDisable(!isVideo);
				this.render();
			},
			showVideo : function(isVideo) {
				if (this.getScreenWidget()) {
					this.getScreenWidget().destroy();
					this.setScreenWidget(undefined);
				}
				
				var videoPanel = document.getElementById("rightPanelWebRTC");
				if(videoPanel == undefined){
					this.prepareVideoPanel(isVideo);
				}else{
					this.setVideoDisable(!isVideo);
					this.render();
				}
				if(isVideo){
					this.setChatWidget(undefined);
				}
				videoPanel = document.getElementById("rightPanelWebRTC");
				window.wrsclient.client.appendTo(videoPanel);
				window.wrsclient.video.updateSessionStreams();
				this.getVideoWidget().reloadWebRTC(false);
				
				enyo.Signals.send("layoutRefresh");
				this.resized();
				if (this.getVideoWidget()) {
					this.getVideoWidget().reloadWebRTC(false);
				}

			},

			setVideoDisable : function(isVideo) {
				this.setIsVideoHiding(isVideo);
				if (this.getVideoWidget()) {
					if (!isVideo) {

						this.getVideoWidget().applyStyle("display",
								"inline-block");
					} else {
						this.getVideoWidget().applyStyle("display", "none");
					}
				}

			},
			components : [ {
				name : "rightPanelHeader",
				layoutKind : "FittableColumnsLayout",
				
				components : [
				{
					tag : "div",
					name : "headercontent",
					allowHtml:true,
					content:htmlEscape(jQuery.i18n
							.prop("cgc.label.chat.chat")),
					classes:"cgcRightPanelHeaderLabel"
				},
				{
					name:"rightPanelHeaderButtons",
					kind:"FittableColumns",
					fit:true,
					classes : "cgcRightPanelHeaderButtons",
					components:[
					            
								{
									name : "webrtcButtonMuteHeader",
									kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
									ontap : "goForWebRTCMute",
									defaultClass : " cgcMuteButtonHeader",
									
									rendered : function() {
										this.setShowing(!window.cgcComponent.basePanel.getIsFullScreen() && window.cgcComponent.basePanel.getIsWebRTCSessionInitated());
									},
									attributes : {
										title : htmlEscape(jQuery.i18n
												.prop("cgc.tooltip.mute"))
									},
									isActivated : false,
									activeDefaultClass : "",
									deactiveDefaultClass : "",
									activeHOverClass : "",
									deactiveHOverClass : "",
									activeOnPressClass : "",
									deactiveOnPressClass : "",
									componentClasses : "cgcwebrtcButtonMuteHeader",
									activeDefaultImage : "branding/assets/mute_p.svg",
									deactiveDefaultImage : "branding/assets/mute_i.svg",
									activeHOverImage : "branding/assets/mute_a_h.svg",
									deactiveHOverImage : "branding/assets/mute_i_h.svg",
									activeOnPressImage : "branding/assets/mute_p.svg",
									deactiveOnPressImage : "branding/assets/mute_p.svg",
									imageComp : undefined,
									compName : "muteIcon",
								},{
								
									name : "fullscreenButtoninHeader",
									kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
									ontap : "doFullScreen",
									defaultClass : "cgcFullScreenLabelOff",
									attributes : {
										title : htmlEscape(jQuery.i18n
												.prop("cgc.tooltip.fullscreen.on"))
									},
									isActivated : false,
									activeDefaultClass : "",
									deactiveDefaultClass : "",
									activeHOverClass : "",
									deactiveHOverClass : "",
									activeOnPressClass : "",
									deactiveOnPressClass : "",
									componentClasses : "",
									activeDefaultImage : "branding/assets/fullscreen.svg",
									deactiveDefaultImage : "branding/assets/exitfullscreen.svg",
									activeHOverImage : "branding/assets/fullscreen_h.svg",
									deactiveHOverImage : "branding/assets/exitfullscreen_h.svg",
									activeOnPressImage : "branding/assets/fullscreen_p.svg",
									deactiveOnPressImage : "branding/assets/exitfullscreen_p.svg",
									imageComp : undefined,
									compName : "fullscreenIcon",
								
								}
					            
					]
						
				}]
			
			}, {
				layoutKind : "FittableRowsLayout",
				id : "com.broadsoft.cgc.RightPanelComponentContainer",
				name : "RightPanelComponentContainer",
				classes :"cgcRightPanelComponentContainer",
				fit : true
				
			}],
			queuePopup : function(){
				if(popupMessages.length>0 && !isShowPopupMessage){
						window.basicPopup = this.createComponent({
				name: "basicPopup", kind: "enyo.Popup", 
				floating: true,
				onHide:"hidePopup",
		        classes: "cgcChatMessagePopup", onHide: "popupHidden", components: [
		            {name : "popupMessage",
		            	classes:"cgcChatMessagePopupContent", 
		            	content: "",
		            	allowHtml : true
		            	}
		        ]
		   
			});
						isShowPopupMessage = true;
						var message = popupMessages.shift();
						this.$.popupMessage.setContent("<b>"+message.sender+":</b>  "+message.message);
						window.basicPopup.show();
						 var basePanelWidth = parseInt(getWidth(window.cgcComponent.basePanel.id))-640;
						 window.basicPopup.applyStyle("margin-left",(basePanelWidth/2)+"px");
							
						 if(window.maxPopupMessageDispalyedTimeoutHandle){
							 clearTimeout(window.maxPopupMessageDispalyedTimeoutHandle);
						  }
						 
						 window.minPopupMessageDispalyedTimeoutHandle = setTimeout(
							 function(){
									 if(popupMessages.length>0){
										 clearTimeout(window.maxPopupMessageDispalyedTimeoutHandle);
										 isShowPopupMessage = false;
										 window.basicPopup.hide();
										 window.basicPopup.destroy();
										 window.basicPopup = undefined;
										 window.cgcComponent.basePanel.$.cgcRightPanel.queuePopup();
									 }
								 },
								(minPopupMessageDispalyedinSeconds*1000));
					 
						 window.maxPopupMessageDispalyedTimeoutHandle = setTimeout(
								 function(){
									 window.basicPopup.hide();
									 window.basicPopup.destroy();
									 window.basicPopup = undefined;
									 isShowPopupMessage = false;
									 popupMessages=[];
									 },
									 (maxPopupMessageDispalyedinSeconds*1000));
					}
				
				 
				 
			},
			hidePopup : function(sender,msg){
				popupMessages=[];
				isShowPopupMessage = false;
				if(window.basicPopup){
					window.basicPopup.hide();
					window.basicPopup.destroy();
					window.basicPopup = undefined;
				}
			},
			showPopup : function(sender,msg){
				var chatPanel = this.getChatWidget();
				if(!chatPanel){
					var message = new MessageQueue();
					message.message=msg;
					message.sender=sender;
					popupMessages.push(message);
					this.queuePopup();
				}
			},
			layoutRefresh : function() {
				var chatPanel = this.getChatWidget();
				var videoPanel = this.getVideoWidget();
				var screenPanel = this.getScreenWidget();
				var leftpanelheight = getHeight(this.$.RightPanelComponentContainer.id);
				var contentOfDiv = "";
//				if (window.cgcComponent.basePanel.getIsFullScreen()) {
					this.$.RightPanelComponentContainer.applyStyle("height",(leftpanelheight-32)+"px");
//				}else{
//					this.$.RightPanelComponentContainer.applyStyle("height",leftpanelheight+"px");
//				}
				this.setBackgroundStyle();
				if (chatPanel) {
					this.$.RightPanelComponentContainer.render();
					chatPanel.autoscroll();
					chatPanel.layoutRefresh();
					contentOfDiv = htmlEscape(jQuery.i18n
							.prop("cgc.label.chat.chat")) ;
					
				}else if(videoPanel){
					contentOfDiv = htmlEscape(jQuery.i18n
							.prop("cgc.tooltip.video")) ;
				}else if(screenPanel){
					contentOfDiv = htmlEscape(jQuery.i18n
							.prop("cgc.label.screenshare")) ;
				}
				if(isFullScreenActivated){
					contentOfDiv = contentOfDiv + ": " + window.cgcProfile.name;
				}
				this.$.headercontent.setContent(contentOfDiv);
				this.$.webrtcButtonMuteHeader.render();
				if (this.getVideoWidget()) {
					this.getVideoWidget().reloadWebRTC(false);
				}
			},
			resetPanel : function(){
				this.$.rightPanelHeader.removeClass("cgcRightPanelHeaderFullScreenOnChat");
				this.$.rightPanelHeader.removeClass("cgcRightPanelHeaderFullScreenOnScreenShare");
				this.$.rightPanelHeader.removeClass("cgcRightPanelHeaderFullScreenOnVideo");
				this.$.rightPanelHeader.removeClass("cgcRightPanelHeaderFullScreenOffChat");
				this.$.rightPanelHeader.removeClass("cgcRightPanelHeaderFullScreenOffScreenShare");
				this.$.rightPanelHeader.removeClass("cgcRightPanelHeaderFullScreenOffVideo");
				
				this.$.RightPanelComponentContainer.removeClass("cgcChatPanelBorderColor");
				
				this.$.RightPanelComponentContainer.removeClass("cgcVideoPanelBorder");
				this.$.rightPanelHeader.removeClass("cgcVideoPanelBackground");
				this.$.RightPanelComponentContainer.removeClass("cgcScreenPanelBorder");
				this.$.rightPanelHeader.removeClass("cgcScreenPanelBackground");
			},
			setBackgroundStyle:function() {
				var chatPanel = this.getChatWidget();
				var videoPanel = this.getVideoWidget();
				var screenPanel = this.getScreenWidget();
				var leftpanelheight = getHeight(this.id);
//				if (window.cgcComponent.basePanel.getIsFullScreen()) {
//					this.$.RightPanelComponentContainer.applyStyle("height",(leftpanelheight-80)+"px");
//				}else{
//					this.$.RightPanelComponentContainer.applyStyle("height",leftpanelheight+"px");
//				}
				this.resetPanel();
				if (chatPanel) {
					if(isFullScreenActivated){
						this.$.rightPanelHeader.addClass("cgcRightPanelHeaderFullScreenOnChat");
					}else{
						this.$.rightPanelHeader.addClass("cgcRightPanelHeaderFullScreenOffChat");
					}
					this.$.RightPanelComponentContainer.addClass("cgcChatPanelBorderColor");
					
				}else if(videoPanel){
					if(isFullScreenActivated){
						this.$.rightPanelHeader.addClass("cgcRightPanelHeaderFullScreenOnVideo");
					}else{
						this.$.rightPanelHeader.addClass("cgcRightPanelHeaderFullScreenOffVideo");
					}
					this.$.RightPanelComponentContainer.addClass("cgcVideoPanelBorder");
				}else if(screenPanel){
					if(isFullScreenActivated){
						this.$.rightPanelHeader.addClass("cgcRightPanelHeaderFullScreenOnScreenShare");
					}else{
						this.$.rightPanelHeader.addClass("cgcRightPanelHeaderFullScreenOffScreenShare");
					}
					this.$.RightPanelComponentContainer.addClass("cgcScreenPanelBorder");
				}
			},
			showFullScreen : function(inSender, inEvent) {
				if (this.getVideoWidget()) {
					this.getVideoWidget().reloadWebRTC(false);
				}

			},
			goForWebRTCMute : function(inSender, inEvent) {
				window.cgcComponent.basePanel.muteWebRTC();
			},
			goMute : function(isMute) {
				if (isMute) {
					this.$.webrtcButtonMuteHeader.setActivate(true);
					this.$.webrtcButtonMuteHeader.setAttribute("title",
							htmlEscape(jQuery.i18n.prop("cgc.tooltip.unmute")));
				} else {
					this.$.webrtcButtonMuteHeader.setActivate(false);
					this.$.webrtcButtonMuteHeader.setAttribute("title",
							htmlEscape(jQuery.i18n.prop("cgc.tooltip.mute")));
				}
			},
			doFullScreen : function(inSender, inEvent) {
				if(isFullScreenActivated){
					isFullScreenActivated = false;
					this.$.fullscreenButtoninHeader.setActivate(false);
					this.$.fullscreenButtoninHeader.setAttribute("title",
							htmlEscape(jQuery.i18n.prop("cgc.tooltip.fullscreen.on")));
				} else {
					isFullScreenActivated = true;
					this.$.fullscreenButtoninHeader.setActivate(true);
					this.$.fullscreenButtoninHeader.setAttribute("title",
							htmlEscape(jQuery.i18n.prop("cgc.tooltip.fullscreen.off")));
				}
				enyo.Signals.send("doFullScreen");

			}
		});