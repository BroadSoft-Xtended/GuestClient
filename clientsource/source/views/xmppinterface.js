/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

/**
 * Class which integrates the xmpp,uss utilities with enyo views Events
 * generated from xmpp,uss should start here for xmision to view components and
 * vice versa
 */

enyo
		.kind({
			name : "kind.com.broadsoft.cgc.XMPPInterface",
			kind : "enyo.Component",

			create : function() {
				this.inherited(arguments);
				stropheConnect(window.cgcProfile.guestImpDetails.loginId,
						window.cgcProfile.guestImpDetails.password,
						window.cgcProfile.guestImpDetails.room,
						window.cgcProfile.guestImpDetails.boshUrl,
						window.cgcProfile.guestImpDetails.firstName,
						window.cgcProfile.guestImpDetails.lastName,
						window.cgcProfile.guestImpDetails.ownerId, this);
			},
			initialRoster : [],
			backupRoster : [],
			kickout : function(user) {
				console.log("CollaborateGuestClient:XMPPInterface:"
						+ window.cgcProfile.name + " has kicked out the guest");
				window.cgcComponent.basePanel.setIsEndWebRTCRequested(true);
				window.cgcComponent.viewControl.logOut("cgc.error.muc.guest.kicked",false);
				
			},
			logInTimeOut : function(leadername) {
				console
						.log("CollaborateGuestClient:XMPPInterface:No response received from leader's room");
				window.cgcComponent.viewControl.reJoin();
			},
			logInSuccess : function(user) {
				enyo.Signals.send("joinRoom");
			},
			logInAuthFail : function(leadername) {
				console
						.log("CollaborateGuestClient:XMPPInterface:Authentication Failure");
				window.cgcComponent.viewControl.logOut(htmlEscape(jQuery.i18n.prop(
						"cgc.error.muc.join.request.declined",
						window.cgcProfile.name)),false);
				
			},
			logInFailure : function() {

				console
						.log("CollaborateGuestClient:XMPPInterface:Failed to logIn UMS");
				window.cgcComponent.viewControl.logOut(htmlEscape(jQuery.i18n.prop(
						"cgc.error.muc.join.request.declined",
						window.cgcProfile.name)),false);
				

			},
			chatReceived : function(jid,sender, message) {
				// Check here for any signal of screen share
				try {
					var messageDecoded = window.unescapeHTML(message);
					var ussShare = null;
					try {
						var xmlNode = Strophe.xmlHtmlNode(messageDecoded);
						ussShare = $(xmlNode).find("uss-share");
					} catch (e) {
						console
								.log("CollaborateGuestClient:XMPPInterface:Incoming message is probably a chat message. Error while parsing the incoming XML - "
										+ e.message);
					}
					
					if(ussShare != null && ussShare.length>0) {
						var roomIp = $(ussShare).find("room-ip").text();
						var roomId = $(ussShare).find("room-id").text();
						var roomAddress = $(ussShare).find("room-address").text();
						var roomFeatures = $(ussShare).find("room-features").find("n1\\:feature, feature");
						console.log("xmpp :: ussShare :: " + new XMLSerializer().serializeToString(xmlNode));
						
	                    var roomUrl = (roomAddress && roomAddress.trim())?roomAddress.trim():roomIp.trim();
						
						if (roomUrl != "" && roomId != "") {
							
							BoshSession.lastReceivedUSSInvitation = message;
							console.log("xmpp ::  isUSSConnected ::  "+ isUSSConnected() + " :: previousUSSInvitation :: "+BoshSession.lastReceivedUSSInvitation);
							if (!isUSSConnected()) {
								
								startUSSConnection(roomIp.trim(), BoshSession.jid,
										BoshSession.jid.split("/")[0], window.cgcProfile.guestImpDetails.firstName + " " + window.cgcProfile.guestImpDetails.lastName,
										roomId, window.cgcComponent.xmppInterface, true);

							}
							
							return;
						
						} else {
							
							BoshSession.ownerresrc = $(ussShare).find("room-features").attr("contact");
							if(roomFeatures.length != 0 && $(roomFeatures).attr('xmlns:n1') == 'urn:xmpp:broadsoft:bsftfeature1') {
								console.log("Owner has allowed participants to share screen");
								enyo.Signals
									.send(
										"onDesktopShareAccessSignal",
										{
											access : true
										});
							
								return;
							} else {
								console.log("Owner has stopped participants from sharing screen");
								enyo.Signals
									.send(
										"onDesktopShareAccessSignal",
										{
											access : false
										});
							
								return;
							}
							
						}
					}else {
						message = messageDecoded;
						enyo.Signals.send("onChatMessage", {
							jid : jid,
							sender : sender,
							message : message
						});
					}
				} catch (e) {
					console
							.error("CollaborateGuestClient:XMPPInterface:Error while processing incoming message:"
									+ e.message);
					if(e.stack)
					console.log(e.stack);
				}

				
			},
			showScreenSharePanel : function() {

				window.cgcComponent.basePanel.showScreenSharePanel();

			},
			presenceReceived : function(contact) {
				console
						.log("CollaborateGuestClient:XMPPInterface:Presence received from:"
								+ JSON.stringify(contact));
				if (!BoshSession.isJoined && contact.type == "MUC") {
					this.initialRoster.push(contact);
					console.dir(this.initialRoster);
				} else {
					if(contact.name){
						enyo.Signals.send("onPresence", contact);
					}
				}
			},
			screenShareEnded : function() {
				console
				.log("CollaborateGuestClient:XMPPInterface:screenShareEnded Desktop Share Ended");
				window.cgcComponent.basePanel.removeScreenSharePanel();
			},
			sendChat : function(message) {
				BoshSession.sendMessageMUC(message);
			},
			conferenceInfoResult : function(info) {
				var query = $(info).find('query');
				var from = $(query).find('x');
				var field = $(from).find('field');
			},
			stropheDisconnect : function(){
				console
				.log("CollaborateGuestClient:XMPPInterface: Strophe connection has been disconnected");
				stropheDisconnect();
			},
			clearStropheConnection : function(){
				clearStropheConnection();
			},
			sessionClosed : function(leadername) {
				console
						.log("CollaborateGuestClient:XMPPInterface:Guest session terminated, may be due to network issue");
				window.cgcComponent.viewControl.logOut("cgc.error.muc.session.closed");
			},
			unreachableBoshUrl : function(leadername) {
				console
				.log("CollaborateGuestClient:XMPPInterface: Bosh url is not reachable");
				window.cgcComponent.viewControl.logOut(htmlEscape(jQuery.i18n.prop(
						"cgc.error.pa.provision",
						window.cgcProfile.name)),false);
			},
			updateAvatar : function(jid, imgBase64Encoded) {
				enyo.Signals.send("onAvatar",{
					jid : jid,
					img : imgBase64Encoded
				});
			},
			startDesktopShare : function(){	
				console
				.log("CollaborateGuestClient:XMPPInterface: Request PassFloor request to owner");
				BoshSession.startDesktopShare();
			},
			startUSSDesktopShare : function(jid, roomIp, roomId, roomAddr) {
				console.log("CollaborateGuestClient:XMPPInterface: To start USS connection for desktop share");
				
				if(isUSSConnected()){
					startShare();
				}else{
					startUSSConnection(roomIp, jid,
						jid.split("/")[0], window.cgcProfile.guestImpDetails.firstName + " " + window.cgcProfile.guestImpDetails.lastName, roomId, window.cgcComponent.xmppInterface, false);
				}
			},
			republishUSSRoom : function() {
				if(isFloorHolder()){
					console.log("CollaborateGuestClient:XMPPInterface: Resume desktop share");
					BoshSession.sendDesktopShareMsg(BoshSession.lastReceivedUSSInvitation);
				}
			},
			getContactFromJid : function(jid){
				var contactRef= jid;
				for ( var i=0;i < this.backupRoster.length;i++) {
					var contact = this.backupRoster[i];
					if (contact != null && contact.resource === jid) {
						contactRef = contact;
						
						break;
					}
			
				}
				return contactRef;
			}

		});
