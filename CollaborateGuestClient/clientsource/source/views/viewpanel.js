/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

enyo
		.kind({
			name : "kind.com.broadsoft.cgc.ViewPanel",
			layoutKind : "FittableRowsLayout",
			published : {
				screenWidget : undefined,
				chatWidget : undefined,
				parent : undefined,
				isVideoShowing : false
			},
						
			renderContainerPane : function() {
				this.$.ViewPanelComponentContainer.render();
			},
			showScreenSharePanel : function(screenShare) {
				this.showHeaderPanel();
				this.setScreenWidget(screenShare);
				this.setChatWidget(undefined);
				
				screenShare.setContainer(this.$.ViewPanelComponentContainer);
				screenShare.setOwner(this.$.ViewPanelComponentContainer);
				this.renderContainerPane();
			},
			showChatPanel : function(chatPanel) {
				
				if (this.getScreenWidget()) {
					this.setScreenWidget(undefined);
				}
				this.setChatPanel(chatPanel);
				window.cgcComponent.basePanel.setIsChatPaneShowing(true);
				if(window.cgcComponent.basePanel.getIsFullScreen()){
					this.switchFullScreen();
				}
				chatPanel.swapChatPanel(true);
				// TODO try to remove applyStyle
				chatPanel.applyStyle("height", "100%");
				this.renderContainerPane();
				chatPanel.resized();
				

			},
			setChatPanel : function(chatPanel) {
				
				this.hideHeaderPanel();
				chatPanel.setContainer(this.$.ViewPanelComponentContainer);
				chatPanel.setOwner(this.$.ViewPanelComponentContainer);
				this.setScreenWidget(undefined);
				this.setChatWidget(chatPanel);
			},
			hideHeaderPanel: function(){
				this.$.fullscreenButtoninHeader.hide();
			},
			showHeaderPanel : function() {
				
				this.$.fullscreenButtoninHeader.show();
			},
			
			attachCallContainer : function() {
				var webrtc = window.cgcComponent.basePanel.getWebRTCSession();
				if(webrtc && webrtc.getIsActive() && webrtc.getIsVideoActive() ){
					
					if (this.getScreenWidget()) {
						this.setScreenWidget(undefined);
					}else{
						this.setChatWidget(undefined);
					}
					
					webrtc.setContainer(this.$.ViewPanelComponentContainer);
					webrtc.setOwner(this.$.ViewPanelComponentContainer);
					webrtc.setIsSetToDocker(false);
					this.setIsVideoShowing(true);
					this.showHeaderPanel();
					this.renderContainerPane();
				}
				
			},
			detachCallContainer : function() {
				if(this.getIsVideoShowing()){
					this.setIsVideoShowing(false);
					this.hideHeaderPanel();
					this.renderContainerPane();
				}
					
				
			},
			components : [ {
				layoutKind : "FittableRowsLayout",
				name : "viewPanelInnerContainer",
				classes: "bsftSeparators cgcViewPanelInnerContainer",
				fit:true,
				components : [{
					name : "viewPanelHeader",
					layoutKind : "FittableColumnsLayout",
					classes: "bsftChatBackground",
					
					components : [
					{
						tag : "div",
						name : "headercontent",
						allowHtml:true,
						content : "",
						classes:"bsftPrimaryText cgcHide"
					},
					{
						name:"viewPanelHeaderButtons",
						kind:"FittableColumns",
						//fit:true,
						classes : "cgcViewPanelHeaderButtons",
						components:[
						            
									{
										name : "webrtcButtonMuteHeader",
										kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
										ontap : "goForWebRTCMute",
										defaultClass : " cgcMuteButtonHeader",
										showIconOnly : true,
										
										rendered : function() {
											if(window.cgcComponent.basePanel.isConfActive()){
												this.setShowing(window.cgcComponent.basePanel.getIsFullScreen());
											}else{
												this.setShowing(false);
											} 
										},
										attributes : {
											tooltip : htmlEscape(jQuery.i18n
													.prop("cgc.tooltip.mutemicrophone"))
										},
										isActivated : false,
										activeDefaultClass : "",
										deactiveDefaultClass : "",
										activeHOverClass : "",
										deactiveHOverClass : "",
										activeOnPressClass : "",
										deactiveOnPressClass : "",
										componentClasses : "cgcwebrtcButtonMuteHeader",
										activeDefaultImage : "branding/assets/mute_a.svg?ts=" + window.ts,
										deactiveDefaultImage : "branding/assets/mute.svg?ts=" + window.ts,
										activeHOverImage : "branding/assets/mute_a.svg?ts=" + window.ts,
										deactiveHOverImage : "branding/assets/mute.svg?ts=" + window.ts,
										activeOnPressImage : "branding/assets/mute.svg?ts=" + window.ts,
										deactiveOnPressImage : "branding/assets/mute.svg?ts=" + window.ts,
										imageComp : undefined,
										compName : "muteIcon",
									},{
									
										name : "fullscreenButtoninHeader",
										kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
										ontap : "switchFullScreen",
										defaultClass : "cgcFullScreenLabelOff",
										showIconOnly : true,
										attributes : {
											tooltip : htmlEscape(jQuery.i18n
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
										activeDefaultImage : "branding/assets/exitfullscreen.png?ts=" + window.ts,
										deactiveDefaultImage : "branding/assets/fullscreen.png?ts=" + window.ts,
										activeHOverImage : "branding/assets/exitfullscreen_h.png?ts=" + window.ts,
										deactiveHOverImage : "branding/assets/fullscreen_h.png?ts=" + window.ts,
										activeOnPressImage : "branding/assets/exitfullscreen_p.png?ts=" + window.ts,
										deactiveOnPressImage : "branding/assets/fullscreen_p.png?ts=" + window.ts,
										imageComp : undefined,
										compName : "fullscreenIcon",
										fullScreenIconClass : "cgcFullScreenButtonFSIcon"
									}
						            
						]
							
					}]
				
				}, {
					layoutKind : "FittableRowsLayout",
					id : "com.broadsoft.cgc.ViewPanelComponentContainer",
					name : "ViewPanelComponentContainer",
					classes :"cgcViewPanelComponentContainer bsftChatBackground",
					fit : true
					
				}]
			}],
			layoutRefresh : function(){
				
				var chatPanel = this.getChatWidget();
				var screenPanel = this.getScreenWidget();

				
				this.setBackgroundStyle();
				var contentOfDiv = "";
				if (chatPanel) {
					chatPanel.autoscroll();
					chatPanel.layoutRefresh();
				}else if(screenPanel){
					contentOfDiv = jQuery.i18n.prop("cgc.label.screenshare.viewing") + " : " + window.currentSharer;
					screenPanel.layoutRefresh();
				}
				
				this.$.headercontent.setContent(contentOfDiv);
				if(contentOfDiv){
					this.$.headercontent.removeClass("cgcHide");
				} else {
					this.$.headercontent.addClass("cgcHide");
				}

				this.$.webrtcButtonMuteHeader.render();
				

			},
			resetPanel : function(){
				this.$.viewPanelHeader.removeClass("cgcViewPanelHeaderFullScreenOnVideo");
				this.$.viewPanelHeader.removeClass("cgcViewPanelHeaderFullScreenOffVideo");
				this.$.viewPanelHeader.removeClass("cgcViewPanelHeaderFullScreenOnScreenShare");
				this.$.viewPanelHeader.removeClass("cgcViewPanelHeaderFullScreenOffScreenShare");
				
				this.$.viewPanelHeader.removeClass("bsftCallBackground");
				
				this.$.ViewPanelComponentContainer.removeClass("cgcChatPanelBorderColor");
				
				this.$.ViewPanelComponentContainer.removeClass("cgcVideoPanelBorder");
				this.$.viewPanelHeader.removeClass("cgcVideoPanelBackground");
				this.$.ViewPanelComponentContainer.removeClass("cgcScreenPanelBorder");
				this.$.viewPanelHeader.removeClass("cgcScreenPanelBackground");
			},
			setBackgroundStyle:function() {
				var chatPanel = this.getChatWidget();

				this.resetPanel();
				if (chatPanel) {
					
					this.$.viewPanelHeader.addClass("cgcHide");
					this.$.ViewPanelComponentContainer.addClass("cgcChatPanelBorderColor");
					
				}else if(this.getIsVideoShowing()){
					this.$.viewPanelHeader.removeClass("cgcHide");
					if(window.cgcComponent.basePanel.getIsFullScreen()){
						this.$.viewPanelHeader.addClass("cgcViewPanelHeaderFullScreenOnVideo bsftCallBackground");
					}else{
						this.$.viewPanelHeader.addClass("cgcViewPanelHeaderFullScreenOffVideo bsftCallBackground");
					}
					this.$.ViewPanelComponentContainer.addClass("cgcVideoPanelBorder");
				}else {
					this.$.viewPanelHeader.removeClass("cgcHide");
					if(window.cgcComponent.basePanel.getIsFullScreen()){
						this.$.viewPanelHeader.addClass("cgcViewPanelHeaderFullScreenOnScreenShare bsftCallBackground");
					}else{
						this.$.viewPanelHeader.addClass("cgcViewPanelHeaderFullScreenOffScreenShare bsftCallBackground");
					}
					this.$.ViewPanelComponentContainer.addClass("cgcScreenPanelBorder");
				}
			},
			goForWebRTCMute : function(inSender, inEvent) {
				window.cgcComponent.basePanel.muteUnMuteWebRTC();
			},
			goMute : function(isMute) {
				if (isMute) {
					this.$.webrtcButtonMuteHeader.setActivate(true);
					this.$.webrtcButtonMuteHeader.setTooltip(htmlEscape(jQuery.i18n.prop("cgc.tooltip.unmutemicrophone")));
				} else {
					this.$.webrtcButtonMuteHeader.setActivate(false);
					this.$.webrtcButtonMuteHeader.setTooltip(htmlEscape(jQuery.i18n.prop("cgc.tooltip.mutemicrophone")));
				}
			},
			onFullScreen : function() {
				if(window.cgcComponent.basePanel.getIsFullScreen()){
					this.$.fullscreenButtoninHeader.setActivate(true);
					this.$.fullscreenButtoninHeader.setTooltip(htmlEscape(jQuery.i18n.prop("cgc.tooltip.fullscreen.off")));
					
				} else {
					this.$.fullscreenButtoninHeader.setActivate(false);
					this.$.fullscreenButtoninHeader.setTooltip(htmlEscape(jQuery.i18n.prop("cgc.tooltip.fullscreen.on")));
				}
				

			},
			switchFullScreen : function(inSender, inEvent) {
				
				//send signal to reverse full screen.
				enyo.Signals.send("doFullScreen");

			}
		});