
/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

/**
 * For simple applications, you might define all of your views in this file. For
 * more complex applications, you might choose to separate these kind
 * definitions into multiple files under this folder.
 */
var isLogin = false;
enyo
		.kind({
			kind : "FittableRows",
			name : "kind.com.broadsoft.cgc.viewControl",
			fit : true,

		    classes: "cgcViewControl",

			components : [ {
				kind : "enyo.Signals",
				name : "loginsignal",
				onLogin : "processPostJoin", // this is called after Join
												// Button pressed and guest is
												// created in the IMP guest
												// domain
				joinRoom : "postLogin" // this is called after the guset logs
										// into IMPP
			},
			{name: "welcomescreenContainer"},
			{
				id : "joinPageNotificationHeader",
				name : "joinError",
				classes: "cgcJoinPageBrowserNotificationMsg",
				components : [ {
					name: "joinErrorMSG",
					allowHtml : true,
					classes : "cgcBrowserNotificationMsg bsftAppNotification bsftAppNotificationBackground bsftAppNotificationText bsftAccentText cgcHide",
					content : htmlEscape(jQuery.i18n.prop("cgc.info.browser.support.warning"))
				}]
				
			}], 
			resizeHandler : function() {
		    	this.inherited(arguments);
		  	    this.layoutRefresh();
		    },
		    layoutRefresh : function() {
		    	if (window.cgcComponent.rootPanel) {
					window.cgcComponent.rootPanel.layoutRefresh();
				}
		    },
			create : function() {
				this.inherited(arguments);
				window.cgcComponent.viewControl = this;
				if(!isSupportedBorwser()){
					this.showStatusPage("cgc.error.unsupported.browser",true);
				}else if(window.cgcProfile.err){
					this.showStatusPage(htmlEscape(jQuery.i18n.prop(window.cgcProfile.err)),true);
				}else{
					if(!isChrome()){
						this.$.joinErrorMSG.removeClass("cgcHide");
					}
					this.renderLoginPage();
				}
			},

			renderLoginPage : function() {
				this.createComponent({
					kind : "kind.com.broadsoft.cgc.JoinPage",
					name : "joinPage"
				});
			},
			renderTimeoutLoginPage : function() {
				this.setBrowserWarningMsg(false);
				this.createComponent({
					kind : "kind.com.broadsoft.cgc.TimeoutJoinPage",
					name : "joinPage"
				});
			},
			processPostJoin : function() {
				this.setBrowserWarningMsg(false);
				window.cgcComponent.joinPage.destroy();
				if (!window.cgcProfile.guestImpDetails || isNullOrEmpty(window.cgcProfile.guestImpDetails.loginId)
						|| isNullOrEmpty(window.cgcProfile.guestImpDetails.password)
						|| isNullOrEmpty(window.cgcProfile.guestImpDetails.room)
						|| isNullOrEmpty(window.cgcProfile.guestImpDetails.boshUrl)) {
					LOGGER.API.warn("view.js","Missing Joining Details", window.cgcProfile.guestImpDetails );
					if(!window.cgcProfile.guestImpDetails || window.cgcProfile.guestImpDetails.error==""){
						this.showStatusPage(htmlEscape(jQuery.i18n.prop("cgc.error.ums.connect")),true);
					}else{
						this.showStatusPage(htmlEscape(jQuery.i18n.prop(window.cgcProfile.guestImpDetails.error)),true);
					}
					

				} else {
                    if(LOGGER.API.isInfo()){
                        LOGGER.API
							.info("viewpage:","Joining Details Validated. Waiting for leader's acceptance");
					}
					this.waitForAcceptence();
					//reLoadBoshSession();
					isLogin = true;
					// start login process
					window.cgcComponent.xmppInterface = this.createComponent({
						kind : "kind.com.broadsoft.cgc.XMPPInterface",
						name : "XMPPInterface"
					});

				}
			},
			reJoin : function() {
				this.setBrowserWarningMsg(false);
				if(isLogin){
					isLogin = false;
					
					if (window.cgcComponent.xmppInterface) {
						window.cgcComponent.xmppInterface.destroy();
					}
					if (window.cgcComponent.waitingStatusPage){
						window.cgcComponent.waitingStatusPage.destroy();
						window.cgcComponent.waitingStatusPage = undefined;
					}
					
					this.renderTimeoutLoginPage();
					this.render();
					}
			},
			logOut : function(msg,isStroph) {
				
			
				if(isLogin){
					if(LOGGER.API.isInfo())
					{
						LOGGER.API.info('viewController.js', "Logging out the user "  );
					}
					
					isLogin = false;
					
					try{
						ussController.endUSSSession();
					}
					catch(err) {
					}
					
					if (window.cgcComponent.basePanel) {
						window.cgcComponent.basePanel.onLogout();
					}
					
					
					
					
					this.setBrowserWarningMsg(false);
					
				
					
					if (window.cgcComponent.xmppInterface) {
						window.cgcComponent.xmppInterface.stopSession();
					}
		
					this.deleteGuest();

					if(window.cgcComponent.waitingStatusPage){
						window.cgcComponent.waitingStatusPage.destroy();
					}
					
					if(window.cgcComponent.joinPage){
						window.cgcComponent.joinPage.destroy();
					}
					if(this.$.welcomescreenContainer.$.welcomescreen){
						this.$.welcomescreenContainer.$.welcomescreen.setShowing(false);
					}
					this.showStatusPage(msg,true);
					this.render();
					
					if(LOGGER.API.isInfo())
					{
						LOGGER.API.info('viewController.js', "Completed logging out the user "  );
					}
				}
				
			},
			waitForAcceptence : function(){
				if (window.cgcComponent.rootPanel) {
					window.cgcComponent.rootPanel.destroy();
					window.cgcComponent.rootPanel = undefined;
				}
				if (!window.cgcComponent.waitingStatusPage) {
					window.cgcComponent.waitingStatusPage = this.createComponent({
						kind : "kind.com.broadsoft.cgc.WaitForLeaderAcceptance",
						name : "statusPage"
					});
					window.cgcComponent.waitingStatusPage.render();
				}
				enyo.Signals.send("onStatusMsg", {
					message : "cgc.info.sign-in.progress.pending",
					err		: false
				});
			},
			showStatusPage : function(msg,error) {
				this.setBrowserWarningMsg(false);
				if (window.cgcComponent.rootPanel) {
					window.cgcComponent.rootPanel.destroy();
					window.cgcComponent.rootPanel = undefined;
				}
				if (!window.cgcComponent.statusPage) {
					window.cgcComponent.statusPage = this.createComponent({
						kind : "kind.com.broadsoft.cgc.WaitForLeaderAcceptance",
						name : "statusPage",
						classes : "cgcstatusPageText"
					});
					window.cgcComponent.statusPage.render();
					
					
				}
				
				enyo.Signals.send("onStatusMsg", {
					message : msg,
					err		: error
				});
			},
			
			setBrowserWarningMsg: function(isPostLogin){
				if(isPostLogin){
					this.$.joinError.removeClass("cgcJoinPageBrowserNotificationMsg");
					this.$.joinError.addClass("cgcPostLoginBrowserNotificationMsg");
				} else {
					this.$.joinError.addClass("cgcJoinPageBrowserNotificationMsg");
					this.$.joinError.removeClass("cgcPostLoginBrowserNotificationMsg");
					if(isSupportedBorwser()){
						window.cgcComponent.viewControl.render();
					}
				}
			},
			
			postLogin : function() {
				this.setBrowserWarningMsg(true);
				
				this.$.welcomescreenContainer.createComponent({ 
					kind: "kind.com.broadsoft.cgc.welcomescreen.popup", 
					name: "welcomescreen", showing:true });
				
				
				window.cgcComponent.waitingStatusPage.destroy();
				window.cgcComponent.waitingStatusPage = undefined;
				window.cgcComponent.rootPanel = this.createComponent({
					kind : "kind.com.broadsoft.cgc.RootPanel",
					id : "RootPanel",
					name : "RootPanel",
					fit: true
				});
				this.render();
				window.cgcComponent.rootPanel.showMainWindow();
				
				
			},
			deleteGuest : function() {


	    		$.post(window.cgcConfig.ServiceAPIs.deleteGuestServlet, {
	    			jid : window.cgcProfile.guestImpDetails.loginId,
	    			leaderBWUserId : window.cgcProfile.broadworksId
	    		}, function(data, textStatus, jqXHR) {
	    			LOGGER.API.info('stropheconnector.js', "Deleted guest");
	    		}).fail(function(jqXHR, textStatus, errorThrown) {
	    			LOGGER.API.warn('stropheconnector.js', "Failed to deleted guest");
	    		});
	    	}
			
		});







