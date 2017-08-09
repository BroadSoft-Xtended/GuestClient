
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
			} ],
			create : function() {
				this.inherited(arguments);
				window.cgcComponent.viewControl = this;
				if(!isSupportedBorwser()){
					this.showStatusPage("cgc.error.unsupported.browser",true);
				}else if(window.cgcProfile.err){
					this.showStatusPage(htmlEscape(jQuery.i18n.prop(window.cgcProfile.err)),true);
				}else{
					reLoadBoshSession();
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
				this.createComponent({
					kind : "kind.com.broadsoft.cgc.TimeoutJoinPage",
					name : "joinPage"
				});
			},
			processPostJoin : function() {
				window.cgcComponent.joinPage.destroy();
				if (isNullOrEmpty(window.cgcProfile.guestImpDetails.loginId)
						|| isNullOrEmpty(window.cgcProfile.guestImpDetails.password)
						|| isNullOrEmpty(window.cgcProfile.guestImpDetails.room)
						|| isNullOrEmpty(window.cgcProfile.guestImpDetails.boshUrl)) {
					console
					.log("CollaborateGuestClient:viewpage:processPostJoin: Missing Joining Details");
			console.log("loginId = "
					+ window.cgcProfile.guestImpDetails.loginId + ", password = *****" + ", room = "
					+ window.cgcProfile.guestImpDetails.room + ", boshUrl = "
					+ window.cgcProfile.guestImpDetails.boshUrl);
					if(window.cgcProfile.guestImpDetails.error==""){
						this.showStatusPage(htmlEscape(jQuery.i18n.prop("cgc.error.ums.connect")),true);
					}else{
						this.showStatusPage(htmlEscape(jQuery.i18n.prop(window.cgcProfile.guestImpDetails.error)),true);
					}
					

				} else {
					console
							.log("CollaborateGuestClient:viewpage:processPostJoin: Joining Details Validated");
					
					this.waitForAcceptence();
					reLoadBoshSession();
					isLogin = true;
					// start login process
					window.cgcComponent.xmppInterface = this.createComponent({
						kind : "kind.com.broadsoft.cgc.XMPPInterface",
						name : "XMPPInterface"
					});

				}
			},
			reJoin : function() {
				if(isLogin){
					isLogin = false;
					console
					.log("CollaborateGuestClient:viewpage:reJoin: reJoin to Stroph Connection");
					if (window.cgcComponent.xmppInterface) {
						window.cgcComponent.xmppInterface.destroy();
					}
					window.cgcComponent.waitingStatusPage.destroy();
					window.cgcComponent.waitingStatusPage = undefined;
					this.renderTimeoutLoginPage();
					this.render();
					}
			},
			logOut : function(msg,isStroph) {
				if(isLogin){
					isLogin = false;
					console
					.log("CollaborateGuestClient:viewpage:logOut: Quit from Stroph Connection");
					deleteGuest(BoshSession.jid.split("/")[0]);
					if(isStroph){
						if (window.cgcComponent.xmppInterface) {
							window.cgcComponent.xmppInterface.stropheDisconnect();
						}
					}else{
						if (window.cgcComponent.xmppInterface) {
							window.cgcComponent.xmppInterface.clearStropheConnection();
						}
					}
					if (window.cgcComponent.controlPanel) {
						if(window.cgcComponent.alternativeNumberPopup){
							window.cgcComponent.alternativeNumberPopup.hide();
						}
						window.cgcComponent.basePanel.endWebRTC();
					}
					if(window.cgcComponent.waitingStatusPage){
						window.cgcComponent.waitingStatusPage.destroy();
					}
					
					if(window.cgcComponent.joinPage){
						window.cgcComponent.joinPage.destroy();
					}
					this.showStatusPage(msg,true);
					this.render();
				}
				
			},
			waitForAcceptence : function(){
				if (window.cgcComponent.controlPanel) {
					window.cgcComponent.controlPanel.destroy();
					window.cgcComponent.controlPanel = undefined;
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
				if (window.cgcComponent.controlPanel) {
					window.cgcComponent.controlPanel.destroy();
					window.cgcComponent.controlPanel = undefined;
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

			postLogin : function() {
				console
				.log("CollaborateGuestClient:viewpage:postLogin: User has logined successfully");
				window.cgcComponent.waitingStatusPage.destroy();
				window.cgcComponent.waitingStatusPage = undefined;
				window.cgcComponent.controlPanel = this.createComponent({
					kind : "kind.com.broadsoft.cgc.ControlPanel",
					id : "ControlPanel",
					name : "controlpanels"
				});
				this.render();
				window.cgcComponent.controlPanel.postLogin();

			}
			
		});







