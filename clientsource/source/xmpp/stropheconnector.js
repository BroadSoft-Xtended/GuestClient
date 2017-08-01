/**
 * 
 */

NS_MUC_USER = Strophe.NS.MUC + "#user";
NS_MUC_OWNER = Strophe.NS.MUC + "#owner";
RESOURCE = "CollaborateGuestClient";
var contactMap = new Object();
ROLE_MODERATOR = "moderator";
var boshCount = 0;
var isConnected = false;
var leaderAcceptanceTimeOutInMilliSeconds = 0
window.cgcProfile.confId = "";
window.cgcProfile.confBridgeId = "";
window.cgcProfile.dialNum = "";
window.cgcProfile.altDialNum = "";
window.cgcProfile.securityPin = "";
window.cgcProfile.mucId = "";
window.isAlreadySignedIn = false;
var msgQueue = [];
var messageReaderThread = null;
var count = 0;
var startMessageReaderThread = function(){
	if(messageReaderThread){
		return;
	}
	var self = this;
	messageReaderThread = setInterval(function(){
		for(var i=0; i<1; i++){
			if(self.msgQueue.length > 0){
				var message = self.msgQueue.shift();
				BoshSession.handleAsynch(message);
			}else{
				self.stopMessageReaderThread();
				break;
			}
			
		}
		
	}, 10);
}
var stopMessageReaderThread = function(){
	clearInterval(messageReaderThread);
	messageReaderThread = null;
	msgQueue = [];
}
var UpdateType = {
	ROSTER : "roster",
	MESSAGE : "message",
	PRESENCE : "presence",
	ROSTER_UPDATE : "roster_update",
	ERROR : "error",
	DOMAIN : "domain"
};
var BoshSession = {};
var reLoadBoshSession = function() {
	if(window.cgcConfig.leaderAcceptanceTimeOutInSeconds < 10){
		window.cgcConfig.leaderAcceptanceTimeOutInSeconds = 10;
	}
	leaderAcceptanceTimeOutInMilliSeconds = (window.cgcConfig.leaderAcceptanceTimeOutInSeconds-1) * 1000;
	
	Contact = function() {

		this.jid = null;
		this.resource = null;
		this.name = null;
		this.room = null;
		this.status = null;
		this.presence = null;
		this.subscription = null;
		this.ask = null;
		this.type = null;
		this.jid_muc = null;
		this.nick = null;
	};

	Contact.resourcePresence = {};

	Contact.type = {
		SUC : "SUC",
		ROSTER : "ROSTER",
		MUC : "MUC",
		BDY_ADD : "BDY_ADD"

	};

	Resource = function() {
		this.resource = null;
		this.type = null;
	};

	Message = function() {
		this.jid = null;
		this.resource = null;
		this.jid_muc = null;
		this.body = null;
		this.type = null;
	};

	Message.type = {
		SUC : "SUC",
		MUC_INV : "MUC_INV",
		MUC : "MUC",
		MUC_DOM : "MUC_DOM",
		MUC_CREATED : "MUC_CREATED"

	};

	Error = function() {
		this.code = null, this.id = null, this.message = null
	};

	Error.code = {
		XMPP : "XMPP",
		MUC_ROOM_CONF : "MUC_ROOM_CONF",
		OTHERS : "OTHERS"
	};
	
BoshSession = {

	connection : null,
	jid : null,
	room : null,
	confDomain : null,
	enyoCallBk : null,
	// Ref to handlers generated by strophe, so they can be removed later
	refhandleMessage : null,
	refhandlePresence : null,
	refhandleError : null,
	isJoined : false,
	firstName : null,
	lastName : null,
	owner : null,
	noResponseTimer : null,
	timeoutHandle : null,
	isLogOutForNetworkIssue : true,
	lastReceivedUSSInvitation : "",
	ownerresrc : null,
	
	handleMessage : function(message) {
		msgQueue.push(message);
		startMessageReaderThread();
		return true;
	}, 
	handleAsynch:function(message){

		try {
			console
					.log('CollaborateGuestClient:stropheconnector:incoming message :'
							+ Strophe.serialize(message));
			var from = $(message).attr('from');
			var bare_from = Strophe.getBareJidFromJid(from);
			var resource = Strophe.getResourceFromJid(from);

			var to = $(message).attr('to');
			var bare_to = Strophe.getBareJidFromJid(to);
			var sendFlag = null;

			if (from.split("/")[1] == bare_to) {
				//sendFlag = "false";
			}

			var type = $(message).attr('type');
			if (!type) {
				type = null;
			}
			var bare_jid = Strophe
					.getBareJidFromJid(BoshSession.connection.jid);
			var NickNameUser = Strophe
					.getNodeFromJid(BoshSession.connection.jid);

			// Checking MUC invite
			var mucFromUsr;
			var xmlns = $(message).children('x').attr('xmlns');
			var invite = $(message).children('x').children('invite');
			var namespace = Strophe.NS.MUC + "#user";
			var textMsg = $(message).children('body').text();
			// Return if Empty Body
			if (textMsg == '' || textMsg == null) {
				return true;
			}
			var messageObj = new Message();

			if (type == "groupchat") {
				// Return if received echo
				
				if (resource == NickNameUser) {
					return true;
				}

				messageObj.jid = bare_from;
				messageObj.resource = resource;
				messageObj.body = textMsg;
				messageObj.type = Message.type.MUC;
				// check if the resource is a jid if yes then pull just the node
				var node = Strophe.getNodeFromJid(resource);
				if (node != null && node != "") {
					resource = node;
				}

				//if (sendFlag == null)
					BoshSession.enyoCallBk.chatReceived(from,resource, textMsg);
			}

			return true;

		} catch (e) {
			console
					.error('CollaborateGuestClient:stropheconnector:Exception while processing incoming message :'
							+ e);
			var error = new Error();
			error.code = Error.code.OTHERS;
			error.message = e + "";
			return true;
		}
	},

	handlePresence : function(pres) {

		try {
			console
					.log('CollaborateGuestClient:stropheconnector:Prensence received:'
							+ Strophe.serialize(pres));

			var contact = new Contact();
			var bare_myjid = Strophe
					.getBareJidFromJid(BoshSession.connection.jid);
			var from = $(pres).attr('from');
			var bare_from = Strophe.getBareJidFromJid(from);
			var type = $(pres).attr('type');
			var resource = Strophe.getResourceFromJid(from);
			var status = $(pres).find('status:first').text();

			if (!type) {
				type = 'available';
			}

			if (type == 'unavailable') {
				var to = $(pres).attr('to').split('/')[0];
				var nick = $(pres).find('item').attr('nick');

				if (to == nick) {
					
					
					BoshSession.isLogOutForNetworkIssue = false;
					BoshSession.enyoCallBk.kickout();
					
					return true;
				}
			}

			// There can be multiple x children of presence, find the one with
			// MUC Name space
			var xTags = $(pres).find('x');

			var namespace = Strophe.NS.MUC + '#user';
			var userinfoNameSpace = "urn:xmpp:broadsoft:userinfo";
			var xforMucUser = null;
			var xforUserInfo = null;

			if (xTags != null) {
				for (var i = 0; i < xTags.length; i++) {
					var array_element = xTags[i];
					var ns = $(array_element).attr('xmlns');
					if (ns == namespace) {
						xforMucUser = $(array_element);
						if(xforUserInfo != null){
							break;
						}
					} else if (ns == userinfoNameSpace) {
						
						xforUserInfo = $(array_element);
						
						if(xforMucUser != null){
							break;
						}
					}

				}
			}
			
			if(xforUserInfo == null && xforMucUser == null){
				return true;
			}

			//where presence=available received without the firstname and lastname
			if (type == 'available' && xforUserInfo == null && xforMucUser != null){
				contact.name = xforMucUser.children('item').attr('nick');
			}
			
			if (xforUserInfo != null && xforUserInfo.children('firstname') != null && xforUserInfo.children('lastname') != null) {
				contact.name = xforUserInfo.children('firstname').text() + " "
						+ xforUserInfo.children('lastname').text();
			}else if (xforUserInfo != null && xforUserInfo.children('lastname') != null) {
				contact.name = xforUserInfo.children('lastname').text();
			}else if (xforUserInfo != null && xforUserInfo.children('firstname') != null) {
				contact.name = xforUserInfo.children('firstname').text();
			}

			if (xforMucUser != null) {
				var nick_name = Strophe.getResourceFromJid(from);
				var jid_inv = xforMucUser.children('item').attr('jid');

				var role = xforMucUser.children('item').attr('role');

				var id_inv;
				// In some cases presence does not contain jid in items tag, get
				// nick from chat room instead
				if (!jid_inv) {
					id_inv = nick_name;

				} else {
					id_inv = Strophe.getBareJidFromJid(jid_inv);
				}
				// if we receive a muc presence with the nick the same as the
				// user's jid it implies user has successfully joined the room
				if (Strophe.getBareJidFromJid(id_inv) == bare_myjid
						|| id_inv == Strophe
								.getNodeFromJid(BoshSession.jid)) {
					if (!BoshSession.isJoined) {
					
						BoshSession.enyoCallBk.logInSuccess(id_inv);
						BoshSession.isJoined = true;
						contactMap[Strophe.getNodeFromJid(id_inv)] = contact.name;
						
					}
					return true;
				}

				// check if the resource is a jid if yes then pull just the node
				// BTBC sets the resource as the jid
				if(id_inv){
					var node = Strophe.getNodeFromJid(id_inv);
					if (node != null && node != "") {
						id_inv = node;
					}
				}

				contact.jid = bare_from;
				contact.resource = resource;
				contact.presence = type;
				contact.type = Contact.type.MUC;
				contact.jid_muc = id_inv;
				contact.owner = "";
				if (contact.name == null) {
					if (role == ROLE_MODERATOR) {
						window.cgcProfile.leaderName = window.cgcProfile.name;
						contact.name = window.cgcProfile.name;
						contact.owner = htmlEscape(jQuery.i18n
										.prop("cgc.label.owner"));
					} else {
						contact.name = getGuestName(contact.jid_muc) ;
					}
				} else {
					if (role == ROLE_MODERATOR) {
						window.cgcProfile.leaderName = contact.name;
						contact.name = contact.name;
						contact.owner = htmlEscape(jQuery.i18n
										.prop("cgc.label.owner"));
					}
				}
			}
			
			var nick = $(pres).find('item').attr('nick');
			contact.nick = nick;
			contactMap[contact.jid_muc] = contact.name;

			BoshSession.enyoCallBk.presenceReceived(contact);			

			BoshSession.retrieveCard(contact);

			return true;
		} catch (e) {
			console.log(e.stack);
			console
					.error('CollaborateGuestClient:stropheconnector:Exception while processing handlePresence'
							+ e);
			
			var error = new Error();
			error.code = Error.code.OTHERS;
			error.message = e.message + "";
			return true;
		}

	},
	handleError : function(message) {
		console.error('CollaborateGuestClient:stropheconnector:handleError',
				message);

		var from = $(message).attr('from');
		from_bare = Strophe.getBareJidFromJid(from);
		var error = new Error();
		error.id = from_bare;
		error.type = Error.code.XMPP;
		return true;
	},
	sendMessageMUC : function(message) {
		console
				.log('CollaborateGuestClient:stropheconnector:sending MUC message : '
						+ message);
		var room = Strophe.getBareJidFromJid(BoshSession.room);
		var smsg = $msg({
			to : room,
			type : 'groupchat'
		}).c('body').t(message);
		if(typeof BoshSession.connection != "undefined" && BoshSession.connection !=  null){
			BoshSession.connection.send(smsg);
		}
	},
	sendOnCallPresenceStatus : function(phoneid) {
		var mucKeyPres = "";
		if(phoneid){
			mucKeyPres = $pres({
				to : BoshSession.room + "/" + BoshSession.jid.split("/")[0],
				id : generateRandomString()
			}).c('x', {
				xmlns : "http://jabber.org/protocol/muc"
			}).up().c('x', {
				xmlns : "urn:xmpp:broadsoft:userinfo"
			}).c('firstname', BoshSession.firstName).up().c("lastname",
					BoshSession.lastName).up().c("phoneid",
							phoneid).up().up().c('a', {
				xmlns : "urn:xmpp:broadsoft:guestclient:mucjoin"
			}).c('muckey', window.cgcProfile.mucId);
		}else{
			mucKeyPres = $pres({
				to : BoshSession.room + "/" + BoshSession.jid.split("/")[0],
				id : generateRandomString()
			}).c('x', {
				xmlns : "http://jabber.org/protocol/muc"
			}).up().c('x', {
				xmlns : "urn:xmpp:broadsoft:userinfo"
			}).c('firstname', BoshSession.firstName).up().c("lastname",
					BoshSession.lastName).up().c("phoneid",
							"").up().up().c('a', {
				xmlns : "urn:xmpp:broadsoft:guestclient:mucjoin"
			}).c('muckey', window.cgcProfile.mucId);
		}
		console
				.log('CollaborateGuestClient:stropheconnector:Sending Presence with Phoneid:'
						+ mucKeyPres);
		if(BoshSession.connection){
			BoshSession.connection.send(mucKeyPres);	
		}else{
			console.error('CollaborateGuestClient:stropheconnector:Could not send Presence without Phoneid on endWebRTC due to BoshSession.connection non availability:');
		}
		

	},
	getDiscoInfo : function(){
		console
		.log('CollaborateGuestClient:stropheconnector:Sending Disco for room conference:');
		var iqForConfDisco = $iq({
			type : 'get',
			to : BoshSession.room,
			id : generateRandomString()
		}).c('query', {
			xmlns : 'http://jabber.org/protocol/disco#info'
		});

		console
				.log(iqForConfDisco);

		BoshSession.connection.sendIQ(iqForConfDisco,
				BoshSession.handleConfDisco);
	},
	handleLeaderAcceptance : function(info) {
		window.cgcProfile.mucId = info;
		var mucKeyPres = $pres({
			to : BoshSession.room + "/" + BoshSession.jid.split("/")[0],
			id : generateRandomString()
		}).c('x', {
			xmlns : "http://jabber.org/protocol/muc"
		}).up().c('x', {
			xmlns : "urn:xmpp:broadsoft:userinfo"
		}).c('firstname', BoshSession.firstName).up().c("lastname",
				BoshSession.lastName).up().up().c('a', {
			xmlns : "urn:xmpp:broadsoft:guestclient:mucjoin"
		}).c('muckey', info);

		console
				.log('CollaborateGuestClient:stropheconnector:Sending room joining request with Muc Key:'
						+ mucKeyPres);
		BoshSession.connection.send(mucKeyPres);
		BoshSession.getDiscoInfo();

	},
	
	handleIQ : function(iq) {
		console.log('CollaborateGuestClient:stropheconnector:Recieved IQ : ' + new XMLSerializer().serializeToString(iq));

		if (BoshSession.noResponseTimer) {
			clearTimeout(BoshSession.noResponseTimer);
		}

		try {
			iq = $(iq);
			var type = iq.attr('type');
			if (type != "result") {
				if(type == 'error'){
					var errorElement = $(iq).find('error');
					var leadername = iq.attr('from');
					var errorType = errorElement.attr('type');
					if(errorType == 'auth'){
						BoshSession.sendForLeaderAcceptance(iq);
					}else if(!window.isAlreadySignedIn){
						if(BoshSession.timeoutHandle == null ){
							BoshSession.timeoutHandle = setTimeout(function(){BoshSession.sendForLeaderAcceptance(iq)},leaderAcceptanceTimeOutInMilliSeconds);
						}
					}
				}
				if(type == "get"){
					var serverPing = iq.find('ping[xmlns="urn:xmpp:ping"]');
					if(serverPing && serverPing.length>0){
						var resultIQ = $iq({type: 'result', to: iq.attr('from'),	id: iq.attr('id')});
						BoshSession.connection.sendIQ(resultIQ);
						console.log('CollaborateGuestClient:stropheconnector:Sent IQ : ' + new XMLSerializer().serializeToString(resultIQ));
					}
				}
			} else {
				var guestClientQuery = iq
						.find('query[xmlns="urn:xmpp:broadsoft:guestclient:query"]');
				
				if(guestClientQuery && guestClientQuery.length>0){
					guestClientQuery = guestClientQuery[0];
					var accept = $(guestClientQuery).find('accept');
					if (accept && accept.length>0){
						accept = accept[0];
						if ( $(accept).text() != 'true') {
							if (BoshSession.timeoutHandle == null) {
								BoshSession.timeoutHandle = setTimeout(function() {
									BoshSession.sendForLeaderAcceptance(iq)
								}, leaderAcceptanceTimeOutInMilliSeconds);
							}
						} else {
							if (BoshSession.timeoutHandle != null) {
								clearTimeout(BoshSession.timeoutHandle);
								BoshSession.timeoutHandle = null;
							}
							BoshSession.sendForLeaderAcceptance(iq);
						}
					}
				} else {
						var ussShare = iq.find('uss-share');
						if(ussShare && ussShare.length>0){
							ussShare = ussShare[0];
							ussShareAccepted = $(ussShare).find('pass-floor').find('accepted');
							if(ussShareAccepted.length > 0) {
								var invitation = $(ussShareAccepted).attr('invitation');
								
								if(invitation) {
									BoshSession.lastReceivedUSSInvitation = Base64.decode(invitation);
								} else {
									if(BoshSession.lastReceivedUSSInvitation == "") {
										return;
									} 
								}
								
								// If there is a desktop share already going on, the roomIp and roomId of the share will be used while sending the desktop share.
								var ussRoomInvite = $(BoshSession.lastReceivedUSSInvitation);
								roomIp = ussRoomInvite.find('room-ip').text();
								roomId =  ussRoomInvite.find('room-id').text();
								roomAddr =  ussRoomInvite.find('room-address').text();
								console.log('strophe :: invitation :: roomIp :: ' + roomIp + ', roomId :: ' + roomId + ', roomAddress :: ' + roomAddr);
								BoshSession.sendDesktopShareMsg(BoshSession.lastReceivedUSSInvitation);
								BoshSession.enyoCallBk.startUSSDesktopShare(BoshSession.jid, roomIp, roomId, roomAddr);
								
							}			
						}
								
					}
					
			}
		} catch (error) {
			if(error.stack)
				   console.log(error.stack);
			console.error('CollaborateGuestClient:stropheconnector:IQ Error'
					+ error);
		}
		return true;
	},
	handleConfDisco : function(info) {
		console
				.log('CollaborateGuestClient:stropheconnector:Conf Discovery Details is '
						+ Strophe.serialize(info));

		var x = $(info).find('x');
		x = $(x).find('field');
		for (var i = 0; i < x.length; i++) {
			var array_element = x[i];
			var varAttr = $(array_element).attr('var');
			if (varAttr == 'muc#conferenceID') {
				window.cgcProfile.confId = $(array_element).text();
			} else if (varAttr == 'muc#conferencebridgeID') {
				window.cgcProfile.confBridgeId = $(array_element).text();
			} else if (varAttr == 'muc#conferencedialinnumber') {
				window.cgcProfile.dialNum = $(array_element).text();
			} else if (varAttr == 'muc#conferenceAltDialInNumbers') {
				window.cgcProfile.altDialNum = $(array_element).text();
			} else if (varAttr == 'muc#conferencesecuritypin') {
				window.cgcProfile.securityPin = $(array_element).text();
			} else if (varAttr == 'muc#conferencetype') {
				window.cgcProfile.confType = $(array_element).text();
			}
		}
		if(window.cgcProfile.confId != "" && window.cgcProfile.confId.indexOf("#")<0){
			window.cgcProfile.confId = window.cgcProfile.confId + "#";
		}
		
		if(window.cgcProfile.securityPin != "" && window.cgcProfile.securityPin.indexOf("#")<0){
			window.cgcProfile.securityPin = window.cgcProfile.securityPin + "#";
		}
		window.cgcProfile.conferenceDetailedInformation = window.cgcProfile.dialNum + ", "
				+ window.cgcProfile.confId ;
		if (window.cgcProfile.securityPin != "") {
			window.cgcProfile.conferenceDetailedInformation = window.cgcProfile.conferenceDetailedInformation
					+ ",(" + window.cgcProfile.securityPin + ")";
		}
		enyo.Signals.send("onConfDisco");
		
		return true;
	},
	sendForLeaderAcceptance : function(iq) {
		iq = $(iq);
		var type = iq.attr('type');
		switch (type) {
		case 'result':
			var guestClientQuery = iq
					.find('query[xmlns="urn:xmpp:broadsoft:guestclient:query"]');
			if (guestClientQuery.length == 1) {
				var accept = $(guestClientQuery).find('accept');
				if (accept.text() == 'true') {
					var mucKey = $(guestClientQuery).find('muckey');
					BoshSession.handleLeaderAcceptance(mucKey.text());
					window.isAlreadySignedIn = true;
				}
			}
			break;
		case 'error':
			if(!window.isAlreadySignedIn){		
				var errorElement = $(iq).find('error');
				var leadername = iq.attr('from');
				var errorType = errorElement.attr('type');
				BoshSession.isLogOutForNetworkIssue = false;
				if (errorType == 'auth') {
					BoshSession.enyoCallBk.logInAuthFail();
				} else {
					BoshSession.enyoCallBk.logInFailure(leadername);
				}
			}
			break;
		}
	},
	joinTimeOut : function() {
		BoshSession.isLogOutForNetworkIssue = false;
		BoshSession.enyoCallBk.logInTimeOut();
	},
	retrieveCard : function(contact){
		var iqForPhotoGet = $iq({
			type : 'get',
			to : contact.nick,
			id : generateRandomString()
		}).c('vCard', {
			xmlns : 'vcard-temp'
		}).up();
				
		BoshSession.connection.sendIQ(iqForPhotoGet,
				BoshSession.handleVcardRetrieval);
		
		return true;
	},
	handleVcardRetrieval : function(iq){		
		
		var imgType = $(iq).find('TYPE').text();
		var imgBinary = $(iq).find('BINVAL').text();
		
		if(imgBinary.length>0 ){			
			var imgBase64Encoded = "data:"+imgType+";base64,"+imgBinary;
			
			var iq = $(iq);
			var jid = iq.attr('from');
			
			BoshSession.enyoCallBk.updateAvatar(jid, imgBase64Encoded);
		}		
		return true;
	},
	startDesktopShare : function(){		
		if(isFloorHolder()){
			this.sendDesktopShareMsg(this.lastReceivedUSSInvitation);
			startShare();
		} else {
			//var room = Strophe.getBareJidFromJid(BoshSession.room);
			var requestIq = $iq({
				to : (BoshSession.ownerresrc != null) ? BoshSession.ownerresrc : BoshSession.owner,
				type : 'get',
				id : generateRandomString()
			}).c('uss-share', {xmlns: 'urn:xmpp:broadsoft:bsftfeature1'})
			.c('pass-floor', {context: BoshSession.room, type: 'request'});
			
			console
				.log('CollaborateGuestClient:stropheconnector:sending PassFloor request for Desktop share ' + requestIq.toString());
			
			BoshSession.connection.sendIQ(requestIq);
		}
	},
	sendDesktopShareMsg : function(invite) {
		var room = Strophe.getBareJidFromJid(BoshSession.room);
		var smsg = $msg({
			to : room,
			from : BoshSession.jid,
			type : 'groupchat'
		}).c('body').t(invite);

		console
			.log('CollaborateGuestClient:stropheconnector:sending DesktopShare message : '
				+ smsg);
		BoshSession.connection.send(smsg);
	}

};
}

function stropheConnect(jid, password, room, boshUrlList, firstName, lastName,
		owner, enyocallback) {
	console
			.log('CollaborateGuestClient:stropheconnector:starting strophe connection with list of Bosh Urls to try: '
					+ boshUrlList);
	room = room.trim();
	RESOURCE = RESOURCE + "-" + generateRandomString();
	if (jid != null) {
		jid = jid.trim();
		jid = jid + "/" + RESOURCE;
	}

	BoshSession.jid = jid;
	BoshSession.room = room;
	BoshSession.firstName = firstName;
	BoshSession.lastName = lastName;
	BoshSession.owner = owner;
	BoshSession.enyoCallBk = enyocallback;
	// BoshSession.enyoCallBk.showRequestPage();

	Strophe
			.addConnectionPlugin(
					"xdomainrequest",
					{
						init : function() {
							if (window.XDomainRequest) {
								Strophe.debug("using XdomainRequest for IE");

								// override the send method to fire readystate 2
								if (typeof XDomainRequest.prototype.oldsend == 'undefined') {
									XDomainRequest.prototype.oldsend = XDomainRequest.prototype.send;
									XDomainRequest.prototype.send = function() {
										XDomainRequest.prototype.oldsend.apply(
												this, arguments);
										this.readyState = 2;
										try {
											this.onreadystatechange();
										} catch (e) {
										}
									};
								}

								// replace Strophe.Request._newXHR with the
								// xdomainrequest version
								Strophe.Request.prototype._newXHR = function() {
									var fireReadyStateChange = function(xhr,
											status) {
										xhr.status = status;
										xhr.readyState = 4;
										try {
											xhr.onreadystatechange();
										} catch (e) {
										}
									};
									var xhr = new XDomainRequest();

									xhr.readyState = 0;
									xhr.onreadystatechange = this.func.bind(
											null, this);
									xhr.onload = function() {
										xmlDoc = new ActiveXObject(
												"Microsoft.XMLDOM");
										xmlDoc.async = "false";
										xmlDoc.loadXML(xhr.responseText);
										xhr.responseXML = xmlDoc;
										fireReadyStateChange(xhr, 200);
									};
									xhr.onerror = function() {
										Strophe
												.error("Strophe xdr.onerror called");
										fireReadyStateChange(xhr, 500);
									};
									xhr.ontimeout = function() {
										Strophe
												.error("Strophe xdr.ontimeout called");
										fireReadyStateChange(xhr, 500);
									};
									return xhr;
								}

							} else {
								Strophe
										.info("XDomainRequest not found. Falling back to native XHR implementation.");
							}
						}
					});

	
	var boshUrlArray = [];
	if (boshUrlList.indexOf(",") >= 0) {
		boshUrlArray = boshUrlList.split(",");
	} else {
		boshUrlArray[0] = boshUrlList;
	}
	var boshUrlArray = boshUrlList.split(",");
	connectStrophe(boshUrlArray, jid, password);
}

function connectStrophe(boshUrlArray, jid, password) {

	try{
	
	var conn = new Strophe.Connection(boshUrlArray[boshCount]);
	console
			.log('CollaborateGuestClient:stropheconnector:trying to connect to Bosh'
					+ conn + '...');
	//Fix for IE 11 issue where get is performed before POST
	$.get(boshUrlArray[boshCount], function(data, status){
	        console.log("Get request performed with Status " + status);
	   });
	
	BoshSession.connection = conn;
	
	
	BoshSession.connection.rawInput =   function(data){
        if(window.cgcDevDebug){
             console.debug("Strophe.rawInput  : " + data);
        }
    };
    BoshSession.connection.rawOutput =   function(data){
        if(window.cgcDevDebug){
        console.debug("Strophe.rawOutput :" + data);
       }
    };
	
	
	BoshSession.connection
			.connect(
					jid,
					password,
					function(status) {

						if (status == Strophe.Status.CONNECTED) {
							console
									.log('CollaborateGuestClient:stropheconnector:Bosh connection established.');
							if(typeof BoshSession.connection != "undefined" && BoshSession.connection !=  null){
								BoshSession.connection.ping.startInterval(BoshSession.room);

								isConnected = true;
							}
							try {
								BoshSession.refhandleMessage = BoshSession.connection
										.addHandler(BoshSession.handleMessage,
												null, "message", null);
								BoshSession.refhandlePresence = BoshSession.connection
										.addHandler(BoshSession.handlePresence,
												null, "presence", null);
								BoshSession.connection.addHandler(
										BoshSession.handleIQ, null, "iq");



								console
										.log("CollaborateGuestClient:stropheconnector:Sending initial Presence Stanza : "
												+ $pres());
								BoshSession.connection.send($pres());

								var iqForLeaderAcceptance = $iq({
									type : 'get',
									to : BoshSession.owner,
									id : generateRandomString()
								})
										.c(
												'query',
												{
													xmlns : 'urn:xmpp:broadsoft:guestclient:query'
												}).c('firstname',
												BoshSession.firstName).up().c(
												"lastname",
												BoshSession.lastName).up().c(
														"timeout", window.cgcConfig.leaderAcceptanceTimeOutInSeconds).up().c(
												"mucroom", BoshSession.room);

								console
										.log("CollaborateGuestClient:stropheconnector:IQ for permission to join leader room :"
												+ iqForLeaderAcceptance);
								BoshSession.noResponseTimer = setTimeout(
										function() {
											BoshSession.joinTimeOut()
										}, leaderAcceptanceTimeOutInMilliSeconds);
								BoshSession.connection.sendIQ(
										iqForLeaderAcceptance,
										BoshSession.handleLeaderAcceptance);
							} catch (e) {
//								BoshSession.enyoCallBk.reconnectBoshURL();
								connectStrophe(boshUrlArray, jid, password);
								console.log('CollaborateGuestClient:stropheconnector: Exception while connecting:'
										+ e.message);
							}
						} else if (status == Strophe.Status.ERROR
								|| status == Strophe.Status.CONNFAIL
								|| status == Strophe.Status.AUTHFAIL
								|| status == Strophe.Status.DISCONNECTED) {
							
							if (!isConnected) {
								console
								.log("CollaborateGuestClient:stropheconnector: failed to connect to Bosh url "
										+ boshUrlArray[boshCount]
										+ " reported status as " + status);
								
								
								
								// EV214661 Cleaning BOSH connection object before every reconnection
								// Removed the timed disconnect as it was causing SID mismatch errors
								clearStropheConnection();
								boshCount++;
								//console.log("boshUrlArray.length: "+boshUrlArray.length +" boshCount: "+ boshCount)
								if(boshUrlArray.length == boshCount){
									BoshSession.enyoCallBk.unreachableBoshUrl();
								}else{
									connectStrophe(boshUrlArray, jid, password);
									
								}
							} else {
								console
										.log("CollaborateGuestClient:stropheconnector: Disconnection to Bosh connection. "+status);
								clearStropheConnection();
								if (BoshSession.isLogOutForNetworkIssue) {
									BoshSession.enyoCallBk.sessionClosed();
								}
							}
						}
					});
	}catch(err){
		if(err.stack)
			   console.log(err.stack);
	}
}

function clearHandlerReferences() {

	if (BoshSession.connection != null) {

		if (BoshSession.refhandleMessage != null) {
			BoshSession.connection.deleteHandler(BoshSession.refhandleMessage);
			BoshSession.refhandleMessage = null;
		}
		if (BoshSession.refhandlePresence != null) {
			BoshSession.connection.deleteHandler(BoshSession.refhandlePresence);
			BoshSession.refhandlePresence = null;
		}
		if (BoshSession.refhandleError != null) {
			BoshSession.connection.deleteHandler(BoshSession.refhandleError);
			BoshSession.refhandleError = null;
		}

	}

}

function stropheDisconnect(){
	if (BoshSession.connection != null) {
		BoshSession.connection.flush();
		BoshSession.connection.disconnect("Disconnect called from API");
		clearStropheConnection();
	}
}
function clearStropheConnection() {
	stopMessageReaderThread();
	if (BoshSession.connection != null) {
		BoshSession.connection.reset();
		clearHandlerReferences();
		BoshSession.connection = null;
	}
}

function generateRandomString() {
	// Add logic for string
	return Math.floor(Math.random() * 100);
}

function getGuestName(mucJid) {
	return contactMap[mucJid];
}

function deleteGuest(guestJid) {
	var pathArray = window.location.pathname.split('/');
	if(typeof BoshSession.connection != "undefined" && BoshSession.connection !=  null){
		BoshSession.connection.ping.stopInterval();
	}

	$.post(urls.deleteGuestServlet, {
		jid : guestJid,
		leaderBWUserId : window.cgcProfile.broadworksId
	}, function(data, textStatus, jqXHR) {
		console.log("CollaborateGuestClient:stropheconnector: Deleted guest");
	}).fail(function(jqXHR, textStatus, errorThrown) {
		console.log("CollaborateGuestClient:stropheconnector: Failed to deleted guest");
	});
}

