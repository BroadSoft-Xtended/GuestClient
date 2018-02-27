

window.cgcProfile.confId = "";
window.cgcProfile.confBridgeId = "";
window.cgcProfile.dialNum = "";
window.cgcProfile.altDialNum = "";
window.cgcProfile.securityPin = "";

//Dev config start
//window.cgcProfile.confId = "90890";
//window.cgcProfile.confBridgeId = "879846757";
//window.cgcProfile.dialNum = "4234";
//window.cgcProfile.altDialNum = "234234,234234,234234234";
//window.cgcProfile.securityPin = "23324";
//Dev config end
window.cgcProfile.mucId = "";



(function(window){
	
	var StropheXMPPInterface = function () {
		var ROLE_MODERATOR = "moderator";
		var RESOURCE = "CollaborateGuestClient";
		var XMPP_ID_PREFIX = 'cgc';
		
		var thisXMPPInstance = this;
		var	stropheConfig={};
		var isStropheXmppInitiated = false;
		
		var boshUrlIndex = -1;
		var boshUrlArray = [];
		var stropheConnection = null;
		
        var connectionStatus = "IDLE";
        
        
       
        var isConnected = false;
        
        var timeoutHandleForErrorBeforeLeaderAcceptance = null;
        var iqForLeaderAcceptanceTimeOut = null;
        
        var isLogOutForNetworkIssue = true;
        var isAlreadySignedIn = false;
        
        var lastReceivedUSSInvitation="";
        var isGuestJoinedRoom = false;
        var ownerSrcWithResource = "";
        
        var contactMap = new Object();
        var msgQueue = [];
        var messageReaderThread = null;
        
        var startMessageReaderThread = function(){
        	if(messageReaderThread){
        		return;
        	}
        	var self = this;
        	messageReaderThread = setInterval(function(){
        		for(var i=0; i<1; i++){
        			if(msgQueue.length > 0){
        				var message = msgQueue.shift();
        				thisXMPPInstance.handleAsynch(message);
        			}else{
        				stopMessageReaderThread();
        				break;
        			}

        		}

        	}, 10);
        }
        var stopMessageReaderThread = function(){
        	clearInterval(messageReaderThread);
        	messageReaderThread = null;
        	msgQueue = [];
        };
        this.setLastReceivedUSSInvitation=function(ussInvitation){
        	lastReceivedUSSInvitation=ussInvitation;
        };
        this.setOwnerSrcWithResource=function(ownerJidWithResource){
        	ownerSrcWithResource=ownerJidWithResource;
        };
        this.getIsGuestJoinedRoom=function(){
        	return isGuestJoinedRoom;
        };
        
        
        this.init = function ( jid, password, room, boshUrlList, firstName, lastName,
        		owner, enyocallback ) {
			if(LOGGER.API.isInfo())
			{
				LOGGER.API.info("StropheXMPPWrapper.js", "Initializing StropheWrapper");
			}

        	stropheConfig = {
        			jid:jid, 
        			password:password, 
        			room:room, 
        			boshUrlList:boshUrlList, 
        			firstName:firstName, 
        			lastName:lastName,
        			owner:owner 
        	};
        	ownerSrcWithResource = owner;
        	this.eventHandler = enyocallback;
        	if (boshUrlList.indexOf(",") >= 0) {
        		boshUrlArray = boshUrlList.split(",");
        	} else {
        		boshUrlArray[0] = boshUrlList;
        	}
        	
        	
        	if(stropheConfig.leaderAcceptanceTimeOutInSeconds < 10){
        		stropheConfig.leaderAcceptanceTimeOutInSeconds = 10;
        	}
        	stropheConfig.leaderAcceptanceTimeOutInMilliSeconds = (window.cgcConfig.leaderAcceptanceTimeOutInSeconds-1) * 1000;
    		
    		XMPP_ID_PREFIX = 'cgc'; //config.resource;
    		boshUrlIndex = -1;
    		this._initXHR();
    		isStropheXmppInitiated = true;

    	};
    	
    	this._initXHR = function () {
    		Strophe.addConnectionPlugin( "xdomainrequest", {
    			init : function () {
    				if ( window.XDomainRequest ) {
    					if(LOGGER.API.isInfo())
    					{
    						LOGGER.API.info("StropheXMPPWrapper.js", "XMPPSession - Strophe connection using XdomainRequest for IE");
    					}
    					// override the send method to fire
    					// readystate 2
    					if ( typeof XDomainRequest.prototype.oldsend == 'undefined' ) {
    						XDomainRequest.prototype.oldsend = XDomainRequest.prototype.send;
    						XDomainRequest.prototype.send = function () {
    							XDomainRequest.prototype.oldsend.apply( this, arguments );
    							this.readyState = 2;
    							try {
    								this.onreadystatechange();
    							} catch ( e ) {
    							}
    						};
    					}

    					// replace Strophe.Request._newXHR with
    					// the
    					// xdomainrequest version
    					Strophe.Request.prototype._newXHR = function () {
    						var fireReadyStateChange = function ( xhr, status ) {
    							xhr.status = status;
    							xhr.readyState = 4;
    							try {
    								xhr.onreadystatechange();
    							} catch ( e ) {
    							}
    						};
    						var xhr = new XDomainRequest();

    						xhr.readyState = 0;
    						xhr.onreadystatechange = this.func.bind( null, this );
    						xhr.onload = function () {
    							xmlDoc = new ActiveXObject( "Microsoft.XMLDOM" );
    							xmlDoc.async = "false";
    							xmlDoc.loadXML( xhr.responseText );
    							xhr.responseXML = xmlDoc;
    							fireReadyStateChange( xhr, 200 );
    						};
    						xhr.onerror = function () {
    							LOGGER.API.error("StropheXMPPWrapper.js", "Strophe xdr.onerror called" );
    							fireReadyStateChange( xhr, 500 );
    						};
    						xhr.ontimeout = function () {
    							LOGGER.API.error("StropheXMPPWrapper.js", "xdr.ontimeout called" );
    							fireReadyStateChange( xhr, 500 );
    						};
    						return xhr;
    					};

    				} else {
    					if(LOGGER.API.isInfo()){
    								LOGGER.API.info("StropheXMPPWrapper.js", "XDomainRequest not found. Falling back to native XHR implementation.");
    							}
    				}
    			}
    		} );
    	};
    	
    	 this._initStanzaHandler=function(){
    		thisXMPPInstance.refMessageHandler = stropheConnection.addHandler( thisXMPPInstance.handleMessage.bind( this ), null, "message", null );
    		thisXMPPInstance.refPresenceHandler = stropheConnection.addHandler( thisXMPPInstance.handlePresence.bind( this ), null, "presence", null );
    		thisXMPPInstance.refIQHandler = stropheConnection.addHandler( thisXMPPInstance.handleIQ.bind( this ), null, "iq", null );

    	};
    	
    	this._getNextBoshURL= function(){
    		if ( boshUrlIndex < 0 || boshUrlIndex >= ( boshUrlArray.length - 1 ) ) {
    			boshUrlIndex = 0;
    		} else {
    			boshUrlIndex = boshUrlIndex + 1;
    		}
            var strBoshUrl = boshUrlArray[ boshUrlIndex ].trim() ;
            if(!strBoshUrl.endsWith("/")){
                strBoshUrl = strBoshUrl + "/";
            }
            return strBoshUrl;
    	};
    	
    	this._isAllConnectionTried = function (){
    		return (boshUrlIndex >= ( boshUrlArray.length - 1 ));
    	}
    	
    	this.connect = function (  ) {
    		var jid =  stropheConfig.jid;
    		var pwd = stropheConfig.password;
    		if ( !isStropheXmppInitiated ) {
    			return;
    		}
    	
    		if ( !this.getJidResource( jid ) ) {
    			stropheConfig.jid = jid + "/" + RESOURCE;
    		} 

    		
    		var strBoshUrl = this._getNextBoshURL();
            
            if(LOGGER.API.isInfo()){
                LOGGER.API.info('stropheconnector.js','Trying to connect to Bosh '
    				+ strBoshUrl);
            }
            
    		stropheConnection = new Strophe.Connection( strBoshUrl, {"keepalive":true} );
    		stropheConnection.maxRetries = 3;
    		stropheConnection._proto.window = 3;
    		
    		
    		if(isIE() || isEdge()){
    			//Fix for IE 11 issue where get is performed before POST
        		$.get(strBoshUrl, function(data, status){
        	        if(LOGGER.API.isInfo()){
        	                LOGGER.API.info('stropheconnector.js','Fix for IE 11 issue where get is performed before POST status=' + status, data);
        	        }
        		        
        		});
    		}
    		
    		
    		
            stropheConnection.rawInput =   function(data){
                //console.info("Strophe.rawInput  : " + data);
            };
            stropheConnection.rawOutput =   function(data){
                //console.info("Strophe.rawOutput :" + data);
            };
            Strophe.log= function (level, msg){
               //console.info("Strophe.log :" + msg);
            };	
    		
    		stropheConnection.connect( stropheConfig.jid, pwd, this._connectionHandler.bind( this ), 20 );

    	};
        
    	this._clearHandlerReferences = function() {

    		if (stropheConnection != null) {

    			if (this.refMessageHandler != null) {
    				stropheConnection.deleteHandler(this.refMessageHandler);
    				this.refMessageHandler= null;
    			}
    			if (this.refPresenceHandler != null) {
    				stropheConnection.deleteHandler(this.refhandlePresence);
    				this.refPresenceHandler = null;
    			}
    			if (this.refIQHandler != null) {
    				stropheConnection.deleteHandler(this.refIQHandler);
    				this.refIQHandler = null;
    			}

    		}

    	};


    	this.clearStropheConnection = function() {
    		lastReceivedUSSInvitation="";
    		stopMessageReaderThread();
    		if(timeoutHandleForErrorBeforeLeaderAcceptance){
    			clearTimeout(timeoutHandleForErrorBeforeLeaderAcceptance);
    			timeoutHandleForErrorBeforeLeaderAcceptance = null;
    		}
    		if(iqForLeaderAcceptanceTimeOut){
    			clearTimeout(iqForLeaderAcceptanceTimeOut);
    			iqForLeaderAcceptanceTimeOut = null;
    		}
            
            
    		if (stropheConnection != null) {
    			stropheConnection.reset();
    			this._clearHandlerReferences();
    			stropheConnection.connect_callback = null;
    			stropheConnection = null;
    		}
    	};
    	
    	
    	
    	
    	
    	
     	this.terminate = function ( reason ) {
     		if( connectionStatus != "IDLE"){
     			if(LOGGER.API.isInfo())	{
    				LOGGER.API.info("StropheXMPPWrapper.js", "Terminating UMS connection, reason:" + reason);
    			}
         		

         		stopMessageReaderThread();
         		if(timeoutHandleForErrorBeforeLeaderAcceptance){
        			clearTimeout(timeoutHandleForErrorBeforeLeaderAcceptance);
        			timeoutHandleForErrorBeforeLeaderAcceptance = null;
        		}
        		if(iqForLeaderAcceptanceTimeOut){
        			clearTimeout(iqForLeaderAcceptanceTimeOut);
        			iqForLeaderAcceptanceTimeOut = null;
        		}
        		if (stropheConnection != null) {
        			if(typeof stropheConnection.ping != "undefined" && stropheConnection.ping !=  null){
            			stropheConnection.ping.stopInterval();
            		}

        			
        			stropheConnection.flush( );
        			this._clearHandlerReferences();
        			
        			stropheConnection.disconnect( reason );
        			stropheConnection.reset( );
        			stropheConnection.connect_callback = null;
        			stropheConnection = null;
        		}
        		lastReceivedUSSInvitation="";
        		isStropheXmppInitiated = false;
        		boshUrlIndex = -1;
                connectionStatus = "IDLE";
     		}
     		

      
            
    	};   
    	this.disconnect = function ( reason ) {
    		if(LOGGER.API.isInfo())	{
				LOGGER.API.info("StropheXMPPWrapper.js", "Disconnecting to UMS");
			}
     		
    		stropheConnection.disconnect( reason );
    		
    		//this is a manual disconnect and not a connection failure, so on next try we should start with same URL
    		boshUrlIndex = boshUrlIndex-1;
    		
    	};
      

    	this.getBareJid = function ( jid ) {
    		var targetjid = ( jid ) ? jid : stropheConfig.jid;
    		return Strophe.getBareJidFromJid( targetjid );// [userId]@[domain]

    	};

    	this.getUserFromJid = function ( jid ) {
    		var targetjid = ( jid ) ? jid : stropheConfig.jid;
    		return Strophe.getNodeFromJid( targetjid ); // [userId]

    	};

    	this.getJidDomain = function ( jid ) {
    		var targetjid = ( jid ) ? jid : stropheConfig.jid;
    		return Strophe.getDomainFromJid( targetjid ); // [domain]

    	};

    	this.getJidResource = function ( jid ) {
    		var targetjid = ( jid ) ? jid : stropheConfig.jid;
    		return Strophe.getResourceFromJid( targetjid ); // [resource]

    	};
    	
    	this.getJid = function (  ) {
    		return  stropheConfig.jid;

    	};

    	this._connectionHandler = function ( status, condition ) {
           
            var self = this;
    		switch ( status ) {
    			case Strophe.Status.CONNECTING:
    				connectionStatus = status;
    				 if(LOGGER.API.isInfo()){
    	                    LOGGER.API.info('StropheXMPPWrapper.js',"XMPPSession - Connecting to " + boshUrlArray[ boshUrlIndex ] );
    				 }
    				
    				break;
    			case Strophe.Status.AUTHENTICATING:
    				connectionStatus = status;
    				if(LOGGER.API.isInfo()){
                        LOGGER.API.info('StropheXMPPWrapper.js',"XMPPSession - Authenticating to " + boshUrlArray[ boshUrlIndex ] );
    				}
                   

    				break;
    			case Strophe.Status.CONNECTED:
    				connectionStatus = status;
    				isConnected=true;
    				if(LOGGER.API.isInfo()){
                        LOGGER.API.info('StropheXMPPWrapper.js',"Bosh connection established");
    				}
                    
                   
    				
    				if(typeof stropheConnection != "undefined" 
    					&& stropheConnection !=  null 
    					&& stropheConnection.ping != null){
    					stropheConnection.ping.startInterval(stropheConfig.room);

    					isConnected = true;
    				}
    				try {

    					thisXMPPInstance._initStanzaHandler();
    					this.sendInitialPresence ();
    			    	this.sendRequestForLeaderAcceptance();


    				} catch (e) {
                        LOGGER.API.warn('stropheconnector.js',"Trying to reconnect as exception occured in the connection :", e);
                        thisXMPPInstance.onDisconnect(isConnected);
                        
    					
    				}
    			
    				
    				
    				
    				break;
    			case Strophe.Status.DISCONNECTING:
    				if(LOGGER.API.isInfo())	{
    					LOGGER.API.info("StropheXMPPWrapper.js", "UMS session disconnecting");
    				}
                   
    		 		 connectionStatus = status;
    				break;

    			case Strophe.Status.CONNFAIL:
    			case Strophe.Status.AUTHFAIL:
    			case Strophe.Status.ERROR:
    			case Strophe.Status.DISCONNECTED:
    		 		connectionStatus = status;
    		 		
    		 		LOGGER.API.warn('stropheconnector.js',"Disconnected from " + boshUrlArray[ boshUrlIndex ] + " reported status as " + status );
                    
    		 		
    		 		thisXMPPInstance.onDisconnect(isConnected);
                    
    				break;
    				
    			case Strophe.Status.ATTACHED:
    				if(LOGGER.API.isInfo())
    				{
    					LOGGER.API.info('stropheconnector.js', "XMPPSession - Attached with connection " +  boshUrlArray[ boshUrlIndex ] );
    				}
    				break;				
    			default:
    				if(LOGGER.API.isInfo())
    				{
    					LOGGER.API.info('stropheconnector.js', " XMPPSession - Connection status " + status + " is not handled" );
    				}
    		}

    		return true;
    	};

    	this.onDisconnect = function(prevConnectionState){
    		
    		// EV214661 Cleaning BOSH connection object before every reconnection
			// Removed the timed disconnect as it was causing SID mismatch errors
			this.clearStropheConnection();
			
    		if (prevConnectionState) {
    			LOGGER.API.warn('stropheconnector.js',"Current Bosh session terminated abruptly with status as " + status + ". Closing the session.");
    			thisXMPPInstance.terminate("onDisconnect");
    			if (isLogOutForNetworkIssue) {
    				this.eventHandler.onSessionClosed();
    			}
                
    		} else {

    			//console.log("boshUrlArray.length: "+boshUrlArray.length +" boshCount: "+ boshCount)
    			if(this._isAllConnectionTried()){
    				this.eventHandler.onUnreachableBoshUrl();
    			}else{
    				
    				if(LOGGER.API.isInfo())
    				{
    					LOGGER.API.info('stropheconnector.js', "Retry next Bosh connection as failed to connect to Bosh url" );
    				}
    				
    				
    				
    				thisXMPPInstance.connect( );
    				
    			}
                
    		}
    		
    	}
    	this.sendStanza = function(stanza){
    		try{
    	 		
    	        if(stropheConnection.connected){
    			    stropheConnection.send( stanza );
    	            stropheConnection.flush();
    	            if(LOGGER.API.isDebug()){
    	            	LOGGER.API.debug("stropheconnector.js"," Send Message to UMS ", Strophe.serialize(stanza));
    				}
    	        }else{
    				LOGGER.API.warn("stropheconnector.js"," XMPPconnection unavailable - failed to send stanza ", Strophe.serialize(stanza));
    			}
    		}catch(e){
    			LOGGER.API.error("stropheconnector.js"," Exception while sending data to UMS  ",e);
    		}
    	}
     
    	this.sendIQWithCustomHandler = function(stanza, sucessCallBk, errorCallBk, reqTimeout){
    		try{
    	 		
    	        if(stropheConnection.connected){
    			    stropheConnection.sendIQ( stanza, sucessCallBk, errorCallBk, reqTimeout );
    	            stropheConnection.flush();
    	            if(LOGGER.API.isDebug()){
    	            	LOGGER.API.debug("stropheconnector.js"," Send IQ to UMS ", Strophe.serialize(stanza));
    				}
    	        }else{
    				LOGGER.API.warn("stropheconnector.js"," XMPPconnection unavailable - failed to send IQStanza ", Strophe.serialize(stanza));
    			}
    		}catch(e){
    			LOGGER.API.error("stropheconnector.js"," Exception while sending IQStanza to UMS  ", e);
    		}
    	}


    	generateRandomString = function () {
    		// Add logic for string
    		return Math.floor( Math.random() * 1000 );
    	}

    	this.handleMessage = function (message) {
            if(LOGGER.API.isDebug()){
                LOGGER.API.debug("stropheconnector.js",'XMPP incoming message :'
                            + Strophe.serialize(message));
            }    
    		msgQueue.push(message);
    		startMessageReaderThread();
    		return true;
    	};
    	
    	this.handleAsynch = function (message){

    		try {

    			var from = $(message).attr('from');
    			var bare_from = this.getBareJid(from);
    			var resource = this.getJidResource(from);

    			var to = $(message).attr('to');
    			var bare_to = this.getBareJid(to);
    			var sendFlag = null;

    		

    			var type = $(message).attr('type');
    			if (!type) {
    				type = null;
    			}
    			var bare_jid = this.getBareJid();
    			var NickNameUser = this.getUserFromJid();

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
    				/*var node = this.getUserFromJid(resource);
    				if (node != null && node != "") {
    					resource = node;
    				}*/
    				//if (sendFlag == null)
    				this.eventHandler.onChatReceived(from,resource, textMsg);
    			}

    			return true;

    		} catch (e) {
    			LOGGER.API
    					.warn("stropheconnector.js",'Exception while processing incoming message :', e);

    			return true;
    		}
    	};

    	this.handlePresence =  function (pres) {

    		try {
                if(LOGGER.API.isDebug()){
                    LOGGER.API
    					.debug("stropheconnector.js",'XMPP Prensence received:'
    							+ Strophe.serialize(pres));
                }
    			var contact = new Contact();
    			var bare_myjid =this.getBareJid();
    			var from = $(pres).attr('from');
    			var bare_from =this.getBareJid(from);
    			var type = $(pres).attr('type');
    			var resource = this.getJidResource(from);
    			var status = $(pres).find('status:first').text();

    			
    			
    			
    			if (!type) {
    				type = 'available';
    			}

    			if (type == 'unavailable') {
    				var to = this.getBareJid($(pres).attr('to'));
    				var nick = $(pres).find('item').attr('nick');

    				if (to == nick) {
    					
    					
    					isLogOutForNetworkIssue = false;
    					this.eventHandler.onKickout();
    					
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
    				var nick_name = this.getJidResource(from);
    				var jid_inv = xforMucUser.children('item').attr('jid');

    				var role = xforMucUser.children('item').attr('role');

    				var id_inv;
    				// In some cases presence does not contain jid in items tag, get
    				// nick from chat room instead
    				if (!jid_inv) {
    					id_inv = nick_name;

    				} else {
    					id_inv = this.getBareJid(jid_inv);
    				}
    				// if we receive a muc presence with the nick the same as the
    				// user's jid it implies user has successfully joined the room
    				if (this.getBareJid(id_inv) == bare_myjid
    						|| id_inv == this.getUserFromJid()) {
    					if (!isGuestJoinedRoom) {
    					
    						this.eventHandler.onLogInSuccess(id_inv);
    						isGuestJoinedRoom = true;
    						contactMap[this.getUserFromJid(id_inv)] = contact.name;
    						
    					}
    					return true;
    				}

    				// check if the resource is a jid if yes then pull just the node
    				// BTBC sets the resource as the jid
    				if(id_inv){
    					var node =this.getUserFromJid(id_inv);
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
                            contact.isOwner=true;
    						contact.owner = htmlEscape(jQuery.i18n
    										.prop("cgc.label.owner"));
    					} else {
    						contact.name = thisXMPPInstance.getGuestName(contact.jid_muc) ;
                            contact.isOwner=false;
    					}
    				} else {
    					if (role == ROLE_MODERATOR) {
    						window.cgcProfile.leaderName = contact.name;
    						contact.isOwner=true;
    						contact.owner = htmlEscape(jQuery.i18n
    										.prop("cgc.label.owner"));
    					}
    				}
    			}
    			
    			var nick = $(pres).find('item').attr('nick');
    			contact.nick = nick;
    			contactMap[contact.jid_muc] = contact.name;

    			if(LOGGER.API.isInfo()){
                    LOGGER.API.info('stropheconnector.js',"Presence received for " + contact.name);
        		}
    			
    			this.eventHandler.onPresenceReceived(contact);		
    			
    			if (type != 'unavailable') {
    				thisXMPPInstance.retrieveCard(contact);
    			}

    			return true;
    		} catch (e) {
    			
    			LOGGER.API.error("stropheconnector.js:",'CollaborateGuestClient:stropheconnector:Exception while processing handlePresence'
    							,e);
    			return true;
    		}

    	};
    	
    	this.handleError = function(message) {
    		LOGGER.API.error("stropheconnector.js",'XMPP Error recevied from BoshConnector',
    				message);

    		var from = $(message).attr('from');
    		from_bare = this.getBareJid(from);

    		return true;
    	};
    	
    	this.sendInitialPresence = function(){

            if(LOGGER.API.isInfo()){
                    LOGGER.API.info('stropheconnector.js',"Sending initial Presence Stanza"	);
            }
    		
    		this.sendStanza($pres());
    	}
    	
    	
    	
    	this.sendRequestForLeaderAcceptance = function(){
    		

    		var iqForLeaderAcceptance = $iq({
    			type : 'get',
    			to : stropheConfig.owner,
    			id : generateRandomString()
    		})
    				.c(
    						'query',
    						{
    							xmlns : 'urn:xmpp:broadsoft:guestclient:query'
    						}).c('firstname',
    						stropheConfig.firstName).up().c(
    						"lastname",
    						stropheConfig.lastName).up().c(
    								"timeout", window.cgcConfig.leaderAcceptanceTimeOutInSeconds).up().c(
    						"mucroom", stropheConfig.room);
            
    		if(LOGGER.API.isInfo()){
                LOGGER.API.info('stropheconnector.js',"Sending IQ for permission to join leader room :"
    					+ iqForLeaderAcceptance);
    		}
    		
    		
    		iqForLeaderAcceptanceTimeOut = setTimeout(
					function() {
						thisXMPPInstance.joinTimeOut();
					}, stropheConfig.leaderAcceptanceTimeOutInMilliSeconds);
    		
    		this.sendIQWithCustomHandler(iqForLeaderAcceptance);
    	}
    	
    	this.sendMessageMUC = function(message) {
    		if(LOGGER.API.isInfo()){
                LOGGER.API.info('stropheconnector.js',"Sending message to room :"+message
    					);
    		}	
    		var room = this.getBareJid(stropheConfig.room);
    		var smsg = $msg({
    			to : room,
    			type : 'groupchat'
    		}).c('body').t(message);


    		this.sendStanza(smsg);
    	};
    	this.sendOnCallPresenceStatus = function(phoneid) {
    		if(LOGGER.API.isInfo()){
                LOGGER.API.info('stropheconnector.js',"Publish phone status to collaborate room with phoneid :"+phoneid
    					);
    		}
    		var mucKeyPres = "";
    		if(phoneid){
    			mucKeyPres = $pres({
    				to : stropheConfig.room + "/" + this.getBareJid(stropheConfig.jid),
    				id : generateRandomString()
    			}).c('x', {
    				xmlns : "http://jabber.org/protocol/muc"
    			}).up().c('x', {
    				xmlns : "urn:xmpp:broadsoft:userinfo"
    			}).c('firstname', stropheConfig.firstName).up().c("lastname",
    					stropheConfig.lastName).up().c("phoneid",
    							phoneid).up().up().c('a', {
    				xmlns : "urn:xmpp:broadsoft:guestclient:mucjoin"
    			}).c('muckey', window.cgcProfile.mucId);
    		}else{
    			mucKeyPres = $pres({
    				to : stropheConfig.room + "/" + this.getBareJid(stropheConfig.jid),
    				id : generateRandomString()
    			}).c('x', {
    				xmlns : "http://jabber.org/protocol/muc"
    			}).up().c('x', {
    				xmlns : "urn:xmpp:broadsoft:userinfo"
    			}).c('firstname', stropheConfig.firstName).up().c("lastname",
    					stropheConfig.lastName).up().c("phoneid",
    							"").up().up().c('a', {
    				xmlns : "urn:xmpp:broadsoft:guestclient:mucjoin"
    			}).c('muckey', window.cgcProfile.mucId);
    		}

    		this.sendStanza(mucKeyPres);
    		
    		
    		

    	};
    	this.getDiscoInfo = function(){
    		if(LOGGER.API.isInfo()){
                LOGGER.API.info('stropheconnector.js',"Query for Room disco");
    		}
    		var iqForConfDisco = $iq({
    			type : 'get',
    			to : stropheConfig.room,
    			id : generateRandomString()
    		}).c('query', {
    			xmlns : 'http://jabber.org/protocol/disco#info'
    		});

    		this.sendIQWithCustomHandler(iqForConfDisco, thisXMPPInstance.handleConfDisco.bind(thisXMPPInstance));
    	};
    	this.handleLeaderAcceptance =function(info) {
    		if(LOGGER.API.isInfo()){
                LOGGER.API.info('stropheconnector.js',"Leader allowed joining the room. ");
    		}
    		window.cgcProfile.mucId = info;
    		var mucKeyPres = $pres({
    			to : stropheConfig.room + "/" + this.getBareJid(stropheConfig.jid),
    			id : generateRandomString()
    		}).c('x', {
    			xmlns : "http://jabber.org/protocol/muc"
    		}).up().c('x', {
    			xmlns : "urn:xmpp:broadsoft:userinfo"
    		}).c('firstname', stropheConfig.firstName).up().c("lastname",
    				stropheConfig.lastName).up().up().c('a', {
    			xmlns : "urn:xmpp:broadsoft:guestclient:mucjoin"
    		}).c('muckey', info);

    		this.sendStanza(mucKeyPres);
    		
    		thisXMPPInstance.getDiscoInfo();

    	};
    	
    	this.handleIQ = function(iq) {
    		if(LOGGER.API.isDebug()){
    			LOGGER.API.debug('stropheconnector.js', 'XMPP Recieved IQ : ' + new XMLSerializer().serializeToString(iq));
    		}
    		if (iqForLeaderAcceptanceTimeOut) {
    			clearTimeout(iqForLeaderAcceptanceTimeOut);
    			iqForLeaderAcceptanceTimeOut = null;
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
    						thisXMPPInstance.handleIQForLeaderAcceptance(iq);
    					}else if(!isAlreadySignedIn){
    						if(timeoutHandleForErrorBeforeLeaderAcceptance == null ){
    							timeoutHandleForErrorBeforeLeaderAcceptance = setTimeout(function(){thisXMPPInstance.handleIQForLeaderAcceptance(iq)},stropheConfig.leaderAcceptanceTimeOutInMilliSeconds);
    						}
    					}
    				}
    				if(type == "get"){
    					var serverPing = iq.find('ping[xmlns="urn:xmpp:ping"]');
    					if(serverPing && serverPing.length>0){
    						var resultIQ = $iq({type: 'result', to: iq.attr('from'),	id: iq.attr('id')});
    						this.sendIQWithCustomHandler(resultIQ);
    						if(LOGGER.API.isDebug()){
    							LOGGER.API.debug('stropheconnector.js', 'Sent IQ : ' + new XMLSerializer().serializeToString(resultIQ));
    						}
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
    							if (timeoutHandleForErrorBeforeLeaderAcceptance == null) {
    								timeoutHandleForErrorBeforeLeaderAcceptance = setTimeout(function() {
    									thisXMPPInstance.handleIQForLeaderAcceptance(iq)
    								}, stropheConfig.leaderAcceptanceTimeOutInMilliSeconds);
    							}
    						} else {
    							if (timeoutHandleForErrorBeforeLeaderAcceptance != null) {
    								clearTimeout(timeoutHandleForErrorBeforeLeaderAcceptance);
    								timeoutHandleForErrorBeforeLeaderAcceptance = null;
    							}
    							thisXMPPInstance.handleIQForLeaderAcceptance(iq);
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
    								lastReceivedUSSInvitation = Base64.decode(invitation);
    							} else {
    								if(lastReceivedUSSInvitation == "") {
    									return;
    								} 
    							}
    							
    							// If there is a desktop share already going on, the roomIp and roomId of the share will be used while sending the desktop share.
    							var ussRoomInvite = $(lastReceivedUSSInvitation);
    							var roomIp = ussRoomInvite.find('room-ip').text();
    							var roomAddr =  ussRoomInvite.find('room-address').text();
    							
    							var roomId =  ussRoomInvite.find('room-id').text();
    							var roomUrl = (roomAddr && roomAddr.trim())?roomAddr.trim():roomIp.trim();
    							
    							if (roomUrl != "" && roomId != "") {
    								LOGGER.API.info("stropheconnector.js:", "About to start USS connection for desktop share");
    								thisXMPPInstance.sendDesktopShareMsg();
    								if (!ussController.isUSSConnected()) {
    									
    									ussController.startUSSConnection(roomUrl, stropheConfig.jid,
    											stropheConfig.jid.split("/")[0], window.cgcProfile.guestImpDetails.firstName + " " + window.cgcProfile.guestImpDetails.lastName,
    											roomId, window.cgcComponent.xmppInterface);
    									
    								}
    								
    								
    							}
    							
    						}			
    					}
    					
    				}
    				
    			}
    		} catch (error) {
    			LOGGER.API.error('stropheconnector.js', 'Exception handling IQ ', error);
    		}
    		return true;
    	};
    	
    	this.handleConfDisco = function(info) {
    		if(LOGGER.API.isInfo()){
                LOGGER.API.info('stropheconnector.js',"Received conf discovery response. ");
    		}
            if(LOGGER.API.isDebug()){
                LOGGER.API.debug('stropheconnector.js', 'Conference info:', Strophe.serialize(info));
            }

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
    		thisXMPPInstance.eventHandler.onConfDisco();
    		return true;
    	};
    	
    	this.handleIQForLeaderAcceptance = function(iq) {
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
    					thisXMPPInstance.handleLeaderAcceptance(mucKey.text());
    					isAlreadySignedIn = true;
    				}
    			}
    			break;
    		case 'error':
    			if(!isAlreadySignedIn){
    				if(LOGGER.API.isInfo()){
    	                LOGGER.API.info('stropheconnector.js',"No authorization received from leader to join the room. ");
    	    		}
    				var errorElement = $(iq).find('error');
    				var leadername = iq.attr('from');
    				var errorType = errorElement.attr('type');
    				isLogOutForNetworkIssue = false;
    				if (errorType == 'auth') {
    					this.eventHandler.onLogInAuthFail(leadername);
    				} else {
    					this.eventHandler.onLogInFailure(leadername);
    				}			
    			}
    			break;
    		}
    	};
    	
    	this.joinTimeOut = function () {
    		if(LOGGER.API.isInfo()){
                LOGGER.API.info('stropheconnector.js',"Join request timed out");
    		}
    		isLogOutForNetworkIssue = false;
    		this.eventHandler.onLogInTimeOut();
    	};
    	this.retrieveCard = function (contact){
    		if(LOGGER.API.isInfo()){
                LOGGER.API.info('stropheconnector.js',"Query for vcard for "+contact.name);
    		}
    		var iqForPhotoGet = $iq({
    			type : 'get',
    			to : contact.nick,
    			id : generateRandomString()
    		}).c('vCard', {
    			xmlns : 'vcard-temp'
    		}).up();
    				
    		this.sendIQWithCustomHandler(iqForPhotoGet,
    				thisXMPPInstance.handleVcardRetrieval.bind(thisXMPPInstance));
    		
    		return true;
    	};
    	
    	this.handleVcardRetrieval = function (iq){		
    		
    		var imgType = $(iq).find('TYPE').text();
    		var imgBinary = $(iq).find('BINVAL').text();
    		
    		if(imgBinary.length>0 ){			
    			var imgBase64Encoded = "data:"+imgType+";base64,"+imgBinary;
    			
    			var iq = $(iq);
    			var jid = iq.attr('from');
    			
    			if(LOGGER.API.isInfo()){
                    LOGGER.API.info('stropheconnector.js',"Vcard received for " + thisXMPPInstance.getGuestName(thisXMPPInstance.getUserFromJid(jid)));
        		}
    			
    			thisXMPPInstance.eventHandler.onUpdateAvatar(jid, imgBase64Encoded);
    		}		
    		return true;
    	};
    	this.sendPassFloorRequest = function(){		
    		

    		{
    			//var room = Strophe.getBareJidFromJid(stropheConfig.room);
    			var requestIq = $iq({
    				to : (ownerSrcWithResource != null) ? ownerSrcWithResource : stropheConfig.owner,
    				type : 'get',
    				id : generateRandomString()
    			}).c('uss-share', {xmlns: 'urn:xmpp:broadsoft:bsftfeature1'})
    			.c('pass-floor', {context: stropheConfig.room, type: 'request'});
    			if(LOGGER.API.isInfo()){
                    LOGGER.API.info('stropheconnector.js','sending PassFloor request for Desktop share ' + requestIq.toString());
    			}
    			this.sendIQWithCustomHandler(requestIq);
    		}
    		
    		//In case of any conflict where the user is already a floor holder, the USS might  not send the floorhoder role change again.
    		//so initiate the share from here only.
    		if(ussController.isFloorHolder()){
    			this.sendDesktopShareMsg();
    			ussController.startShare();
    		} 
    	};
    	this.sendDesktopShareMsg = function() {
    		var room = this.getBareJid(stropheConfig.room);
    		var smsg = $msg({
    			to : room,
    			from : stropheConfig.jid,
    			type : 'groupchat'
    		}).c('body').t(lastReceivedUSSInvitation);

            if(LOGGER.API.isInfo()){
                    LOGGER.API.info('stropheconnector.js','sending DesktopShare message ' + smsg);
    		}
    		
    		this.sendStanza(smsg);
    	};
    	
    	
    	this.getGuestName = function(mucJid) {
    		return contactMap[mucJid];
    	}
    	var Contact = function() {
            this.isOwner = false;
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
    	Contact.type = {
    			SUC : "SUC",
    			ROSTER : "ROSTER",
    			MUC : "MUC",
    			BDY_ADD : "BDY_ADD"

    		};
    	var Message = function() {
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
	};

	
	window.stropheXMPPInterface = new StropheXMPPInterface();
	
}(window));