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
				if(LOGGER.API.isInfo()){
					    LOGGER.API.info("xmppinterface.js:", " Created XMPP Interface");
	            }
				window.stropheXMPPInterface.init(window.cgcProfile.guestImpDetails.loginId,
						window.cgcProfile.guestImpDetails.password,
						window.cgcProfile.guestImpDetails.room,
						window.cgcProfile.guestImpDetails.boshUrl,
						window.cgcProfile.guestImpDetails.firstName,
						window.cgcProfile.guestImpDetails.lastName,
						window.cgcProfile.guestImpDetails.ownerId, this);
				window.stropheXMPPInterface.connect();
			},
			
			participants : [],
			
			
			//Start event handlers for StropheInterface
			onKickout : function(user) {
                if(LOGGER.API.isInfo()){
				    LOGGER.API.info("xmppinterface.js:", window.cgcProfile.name + " has removed the guest");
                }
				window.cgcComponent.basePanel.endWebRTC();
				window.cgcComponent.viewControl.logOut("cgc.error.muc.guest.kicked",false);
				
			},
			onLogInTimeOut : function(leadername) {
                if(LOGGER.API.isInfo()){
				    LOGGER.API.info("xmppinterface.js:", ":No response received from leader's room");
                }
				this.stopSession();
				window.cgcComponent.viewControl.reJoin();
			},
			onLogInSuccess : function(user) {
				enyo.Signals.send("joinRoom");
			},
			onLogInAuthFail : function(leadername) {
                if(LOGGER.API.isInfo()){
				    LOGGER.API.info("xmppinterface.js:", leadername + "has not authroised you to join the room");
                }
				
				window.cgcComponent.viewControl.logOut(htmlEscape(jQuery.i18n.prop(
						"cgc.error.muc.join.request.declined",
						window.cgcProfile.name)),false);
				
			},
			onLogInFailure : function() {
                LOGGER.API.error("xmppinterface.js:", "Failed to logIn UMS");

				window.cgcComponent.viewControl.logOut(htmlEscape(jQuery.i18n.prop(
						"cgc.error.muc.join.request.declined",
						window.cgcProfile.name)),false);
				

			},
			onChatReceived : function(jid,sender, message) {
				// Check here for any signal of screen share
				try {
					var messageDecoded = window.unescapeHTML(message);
					var ussShare = null;
					try {
						var xmlNode = Strophe.xmlHtmlNode(messageDecoded);
						ussShare = $(xmlNode).find("uss-share");
					} catch (e) {
                        LOGGER.API.warn("xmppinterface.js:", "Incoming message is probably a chat message. Error while parsing the incoming XML - "	+ e.message);
					}
					
					if(ussShare != null && ussShare.length>0) {
						
						var roomIp = $(ussShare).find("room-ip").text();
						var roomId = $(ussShare).find("room-id").text();
						var roomAddress = $(ussShare).find("room-address").text();
						var roomFeatures = $(ussShare).find("room-features").find("n1\\:feature, feature");
                        
						
	                    var roomUrl = (roomAddress && roomAddress.trim())?roomAddress.trim():roomIp.trim();
						
						if (roomUrl != "" && roomId != "") {
							
							window.stropheXMPPInterface.setLastReceivedUSSInvitation(message);
							if (!ussController.isUSSConnected()) {
								
								ussController.startUSSConnection(roomUrl, window.stropheXMPPInterface.getJid(),
										window.stropheXMPPInterface.getBareJid(), window.cgcProfile.guestImpDetails.firstName + " " + window.cgcProfile.guestImpDetails.lastName,
										roomId, window.cgcComponent.xmppInterface);

							}
							
							return;
						
						} else {
							
							window.stropheXMPPInterface.setOwnerSrcWithResource ( $(ussShare).find("room-features").attr("contact"));
							if(roomFeatures.length != 0 && $(roomFeatures).attr('xmlns:n1') == 'urn:xmpp:broadsoft:bsftfeature1') {
                                if(LOGGER.API.isInfo()){
                                    LOGGER.API.info("xmppinterface.js:", "Owner has allowed participants to share screen");
                                }
								
								enyo.Signals
									.send(
										"onDesktopShareAccessSignal",
										{
											access : true
										});
							
								return;
							} else {
								if(LOGGER.API.isInfo()){
                                    LOGGER.API.info("xmppinterface.js:", "Owner has stopped participants from sharing screen");
                                }
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
					LOGGER.API.warn("xmppinterface.js:", "Error while processing incoming message:%o", e);

				}

				
			},
			onConfDisco : function(){
				enyo.Signals.send("onConfDisco");
			},
			onPresenceReceived : function(contact) {
				
				if (!window.stropheXMPPInterface.getIsGuestJoinedRoom() && contact.type == "MUC") {
					this.participants.push(contact);
					
				} else {
					if(contact.name){
						enyo.Signals.send("onPresence", contact);
					}
				}
			},
			onSessionClosed : function(leadername) {
                LOGGER.API.warn("xmppinterface.js", "Guest session terminated, may be due to network issue");
				window.cgcComponent.viewControl.logOut("cgc.error.muc.session.closed");
			},
			onUnreachableBoshUrl : function(leadername) {
				LOGGER.API.warn("xmppinterface.js", "Bosh url is not reachable");
				window.cgcComponent.viewControl.logOut(htmlEscape(jQuery.i18n.prop(
						"cgc.error.ums.connect",
						window.cgcProfile.name)),false);
			},
			onUpdateAvatar : function(jid, imgBase64Encoded) {
				enyo.Signals.send("onAvatar",{
					jid : jid,
					img : imgBase64Encoded
				});
			},
			//End event handlers for StropheInterface
			
			
			
			sendChat : function(message) {
				window.stropheXMPPInterface.sendMessageMUC(message);
			},
			conferenceInfoResult : function(info) {
				var query = $(info).find('query');
				var from = $(query).find('x');
				var field = $(from).find('field');
			},
			stopSession : function(){
				if(LOGGER.API.isInfo()){
                    LOGGER.API.info("xmppinterface.js:", "Stopping XMPPSession.");
                }
				this.participants=null;
				window.stropheXMPPInterface.terminate();
			},
			

			requestDesktopShare : function(){	
				LOGGER.API.info("xmppinterface.js", "Request PassFloor request to owner");
				window.stropheXMPPInterface.sendPassFloorRequest();
			},
			republishUSSRoom : function() {
				if(ussController.isFloorHolder()){
					LOGGER.API.debug("xmppinterface.js:", "Republish USS room info");
					window.stropheXMPPInterface.sendDesktopShareMsg();
				}
			},
			getContactNameFromJid : function(src){
				var srcName= src;
				if (src == window.stropheXMPPInterface.getBareJid()) {
					srcName = window.cgcProfile.firstName + " "
					        + window.cgcProfile.lastName;
				} 
				else {
					var contact = this.getContactFromJid(src);
					srcName = (contact && contact.name) ? contact.name
					        : src;
					if (contact && contact.isOwner) {
						srcName = contact.name + " ("
						        + htmlEscape(jQuery.i18n.prop("cgc.label.owner")) + ")";
					}
				}
				return srcName;
			},
			//this returns null if contact details is not found
			getContactNameFromJid2 : function(src){
				var srcName= null;
				if (src == window.stropheXMPPInterface.getBareJid()) {
					srcName = window.cgcProfile.firstName + " "
					        + window.cgcProfile.lastName;
				} 
				else {
					var contact = this.getContactFromJid(src);
					if(contact && contact.name){
						
						if (contact.isOwner) {
							srcName = contact.name + " ("
							        + htmlEscape(jQuery.i18n.prop("cgc.label.owner")) + ")";
						}else{
							srcName =  contact.name;
						}
					}
					
				}
				return srcName;
			},
			//this returns jid if contact details is not found
			getContactFromJid : function(jid){
				var contactRef= null;
				for ( var i=0;i < this.participants.length;i++) {
					var contact = this.participants[i];
					if (contact != null && contact.resource === jid) {
						contactRef = contact;
						
						break;
					}
			
				}
				return contactRef;
			},
			getContactAvatar : function(jid){
				var contact = window.cgcComponent.xmppInterface.getContactFromJid(jid);
				return (contact?contact.image:null);
			},
			getParticipants:function(){
				return this.participants;
			},
			getParticipantsCount: function(){
				return this.participants?this.participants.length+1:0;
			},
			addParticipant: function(contact){
				var isNewParticiapnt = true;
				for ( var i=0;i < this.participants.length;i++) {
					var contactCache = this.participants[i];
					if (contactCache != null && contactCache.resource === contact.resource) {
						isNewParticiapnt = false;
						
						
						break;
					}
				}
				if(isNewParticiapnt){
					this.participants.push(contact);
					enyo.Signals.send("onChatInfoMessage", {
						message : contact.name,
						avatar : true,
						action : htmlEscape(jQuery.i18n
								.prop("cgc.info.muc.participant.join"))
					});
				}
			},
			removeParticipant: function(nick){
				
				for ( var i=0;i < this.participants.length;i++) {
					var contact = this.participants[i];
					if (contact != null && contact.resource === nick) {
						this.participants.splice(i, 1);
						enyo.Signals.send("onChatInfoMessage", {
							message : contact.name,
							avatar : true,
							action : htmlEscape(jQuery.i18n
									.prop("cgc.info.muc.participant.left"))
						});
						
						if(contact.isOwner) {
							enyo.Signals.send("onDesktopShareAccessSignal", {
								access : false
							});
						}
						
						break;
					}

				}
			}

		});
