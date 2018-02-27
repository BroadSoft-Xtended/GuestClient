/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/
var cgcCallMeNumberText = "";

var getFirstAndLastName_Character = function( item ) {
	var name = item.rosterName;
	var displayName = item.name;
	var Lname = item.lastName;
	var Fname = item.firstName;
	var firstLastName ;
	var defaultAvatarName;
	if (displayName ) {
		displayName = displayName.replace(/[\+\-]/g, "");
		var displayNameArray = displayName.split(" ");
		defaultAvatarName =  ( ( displayNameArray[0] ? displayNameArray[0].substring( 0, 1 ) : "" ) + ( displayNameArray[1] ? displayNameArray[1].substring( 0, 1 ) : "" ) );
	}else{
		firstLastName = ( ( Fname ? Fname.substring( 0, 1 ) : "" ) + ( Lname ? Lname.substring( 0, 1 ) : "" ) );
		if ( !firstLastName && name ) {
			name = name.replace(/[\+\-]/g, "");
			var rosterNameArray = name.split(",");
			return firstLastName =  ( ( rosterNameArray[0] ? rosterNameArray[0].substring( 0, 1 ) : "" ) + ( rosterNameArray[1] ? rosterNameArray[1].substring( 0, 1 ) : "" ) );
		}
		defaultAvatarName = ( firstLastName ? firstLastName.toUpperCase() : " " );
	}
	return defaultAvatarName;
}

var getLeaderDefaultAvatarCharacters = function( item ) {
	var displayName = item.name;
	var defaultAvatarName;
	if (displayName ) {
		displayName = displayName.replace(/[\+\-]/g, "");
		var displayNameArray = displayName.split(" ");
		defaultAvatarName =  ( ( displayNameArray[0] ? displayNameArray[0].substring( 0, 1 ) : "" ) + ( displayNameArray[1] ? displayNameArray[1].substring( 0, 1 ) : "" ) );
	}
	
	return defaultAvatarName;
}

enyo.kind({
	name : "kind.com.broadsoft.cgc.DockerPanel",
	kind : "enyo.FittableRows",
	allowHtml : true,
	published : {
		chatWidget : undefined,
		parent : undefined,

	},
	components : [ {

		kind : "enyo.Signals",
		onPresence : "presenceReceived",
		onAvatar : "updateAvatar",
		name : "rosterSignals"
	
	},
	{
		name : "profileBar",
		content : "",
		classes : "cgcLeaderProfileContainer bsftPrimaryBackground",
		allowHtml:true,
		components : [ {
			classes: "cgcLeaderProfileInnerBox",
			name: "leaderProfileInnerBox",
			
			components : [ 
			{
				tag : "img",
				name : "leaderProfileAvatar",
				classes : "cgcLeaderAvatar",
				showing : false
			},
			{
				name : "leaderProfileDefaultAvatar",
				classes: "cgcLeaderDefaultAvatar bsftFontRobotoLightItalic bsftChatPrimaryText bsftDefaultAvatarBorder",
				showing : true,
				content: "",
				rendered : function() {
					this.setContent(getLeaderDefaultAvatarCharacters(window.cgcProfile));
				}
			},
			{
				tag: "div",
				classes: "cgcLeaderRoomInfoBox",
				content: "",
				fit: true,
				components : [ {
					content: "",
					classes: "cgcLeaderRoomInfoBoxTitle bsftPrimaryText cgcFlex cgcTextEllipsis cgcFlexShrinkNone ",
					allowHtml:true,
					rendered : function() {
						this.setContent(jQuery.i18n.prop("cgc.label.room.leaderprofile.title") + " - ");
						this.setAttribute("title", jQuery.i18n.prop("cgc.label.room.leaderprofile.title") + " - " + window.cgcProfile.name);
					}
				},
				{
					tag: "div",
					content: "",
					classes: "cgcLeaderRoomInfoBoxTitle bsftPrimaryText bsftMediumFont cgcTextEllipsis",
					allowHtml:true,
					rendered : function() {
						this.setContent(window.cgcProfile.name);
						this.setAttribute("title", jQuery.i18n.prop("cgc.label.room.leaderprofile.title") + " - " + window.cgcProfile.name);
					}
				}]
			}]
		}],
		
	},
	{
		kind : "kind.com.broadsoft.cgc.ConferenceWidget",
		name : "conferenceWidget"
	},
	{
	    name: "alternateDialInOptionWidget",
	    kind: "kind.cgc.com.broadsoft.AlternateDialInOptionWidget",
	},
	{
		name: "VideoCallContainer",
	    kind: "FittableRows",
	    classes: "cgcHide",
	    components: [
	        {tag:"div",classes:"cgcDockerNavicationHeader bsftPrimarySeparator",
	        	components:[{name:"tabBar",classes:"cgcDockerNavicationContent", kind: "onyx.custom.TabBar",  components: [
	            {name : "radioButton",
	            	allowHtml:true,
	            	content: htmlEscape(jQuery.i18n
						.prop("cgc.label.video")) , 
						classes:"cgcVideoTabHeading bsftHeaders bsftPrimarySeparator cgcBorderNone bsftMediumFont", 
						active: true, index: 0, 
							}]
	        	}]
	        },
	        {
	        	layoutKind : "FittableRowsLayout",
        		name : "VideoPanel",
        		classes : "cgcVideoPanel"
            }]
	}, 
	{
		name : "accordionItems",
		kind : "enyo.FittableRows",
		classes: "cgcAccordionItems",
		fit: true,
		published : {
			isViewChatPanel : false,
			isViewParticipantsPanel : true
		},
		components:[{

			name : "tabNavigatorBar",
			kind : "enyo.FittableRows",
			classes : "cgcHeaderParticipants",
			components : [
			{
				kind : "kind.cgc.com.broadsoft.TabNavigator",
			}]
		}
		],
		layoutRefresh : function() {
			//*******************Don't remove bellow commented code***********************
//			var accordionItemsHeight =  getHeight(this.id);
//			console.log("accordionItemsHeight" + accordionItemsHeight);
//			this.owner.$.tabNavigatorBar.applyStyle("height",accordionItemsHeight+"px");
		}
	} ],
	create : function() {
		this.inherited(arguments);
		window.cgcComponent.cgcDockerPanel = this;
		
		//process any existing items whose presence has been received already before this docker panel is created
		var contacts = window.cgcComponent.xmppInterface.getParticipants();
		for ( var item in contacts) {
			var contact = contacts[item];
			if (contact != null && contact.name) {
				this.presenceReceived("", contact);
			}
			
		}
	},
	addItem : function(contact) {
		try{
			var doUpdateRecord = false;
			
			var components = this.$.tabNavigator.$.contactItems.getComponents();
			//if not an owner, check if record needs to be added
			var isRecordExist = false;
			for ( var comp in components) {			
				if (components[comp].getName() == contact.nick) {
					isRecordExist = true;
					break;
				}
			}
			
			if(!isRecordExist){
				//create new record for the participant
				contact.rosterItem = this.$.tabNavigator.$.contactItems.createComponent({
					kind : "kind.com.broadsoft.cgc.RosterItem",
					name : contact.nick
				});
				if(contact.owner ){
					contact.rosterItem.setIsLeader(true);
				}
				doUpdateRecord=true;
			}
				
			
			if(doUpdateRecord){
				
				contact.rosterItem.$.RosterName.setContent(contact.name);
				contact.rosterItem.$.defaultAvatar.setContent(getFirstAndLastName_Character(contact));
				
				var contactTooltip = contact.name+" "+contact.owner;
				if (contactTooltip.length > 38) {
					contact.rosterItem.$.RosterName.setAttribute("title", contactTooltip);
				}
				
				this.$.tabNavigator.$.contactItems.getStrategy().children.sort(function(a, b) {
					if(a.getIsLeader()){
						return -1;
					}else if(b.getIsLeader()){
						return 1;
					}else{
						return a.$.RosterName.getContent().toUpperCase().localeCompare(b.$.RosterName.getContent().toUpperCase());
					}
					
			    });
				window.cgcComponent.xmppInterface.addParticipant(contact);
				//this.$.tabNavigator.$.contactItems.render();
				//this.$.tabNavigatorBar.render();
				this.layoutRefresh();
				
				
			}
		}
		catch(err) {
			LOGGER.API.error("dockerpanel.js","Exception while adding a participant", err);
		}
	},
	removeItem : function(nick) {
		try{
			var components = this.$.tabNavigator.$.contactItems.getComponents();
			for ( var comp in components) {			
				if (components[comp].getName() == nick) {
					components[comp].destroy();	
					
					window.cgcComponent.xmppInterface.removeParticipant(nick);
					this.layoutRefresh();
					break;
				}
			}
			
		}
		catch(err) {
			LOGGER.API.error("dockerpanel.js", "Exception while removing a participant", err);
		}
	},
	getCurrentTime : function(){
		var date = new Date();
		var hours = date.getHours();
		var mins = date.getMinutes()
		var ampm = hours < 12 ? " am" : " pm";
		hours = hours > 12 ? (hours - 12) : hours;
		mins = mins < 10 ? ("0" + mins) : mins;
		hours = hours + ":" + mins + ampm;
		return hours;
	},
	presenceReceived : function(inEvent, contact) {
		try{
			if(contact.name){
				if (contact.presence == "available") {
					this.addItem(contact,false);
					
					//republish USS room, if it is currently sharing.
					window.cgcComponent.xmppInterface.republishUSSRoom();
				}else if (contact.presence == "unavailable") {
					this.removeItem(contact.nick);
				}
			}
		}
		catch(err) {
			LOGGER.API.warn("dockerpanel.js", "Exception occured while processing existing contacts during login",err);
		}
	},
	updateAvatar : function(inEvent,data) {
		try{
			
			var contact = window.cgcComponent.xmppInterface.getContactFromJid(data.jid);
			contact.image = data.img;
			
			if(window.cgcProfile.guestImpDetails.ownerId == data.jid){
				this.$.leaderProfileAvatar.setSrc(data.img);
				this.$.leaderProfileAvatar.setShowing(true);
				this.$.leaderProfileDefaultAvatar.setShowing(false);
			}
			
			
			if(contact.rosterItem){
				//This should be always available
				contact.rosterItem.updateImage(data.img);
				
			}else{
				
				//Don't if it is going to happen
				var components = this.$.tabNavigator.$.contactItems.getComponents();
				var component = undefined;
				for ( var comp in components) {			
					if (components[comp].getName() == data.jid) {
						component = components[comp];
						component.updateImage(data.img);
						contact.rosterItem = component;
						break;
					}
				}
			}
			
			
			
			
		}
		catch(err) {
			LOGGER.error("dockerpanel.js","Noticed an error at updateAvatar", err);
		}
	},
	setChatPanel : function(chatPanel) {
		this.$.tabNavigator.$.radioButton.removeClass("cgcBorderNone");
		
		this.$.tabNavigator.$.tabBar.createComponent({
			content: "<div class='cgcTabHeading'>"+htmlEscape(jQuery.i18n
					.prop("cgc.label.chat.chat"))+"</div>", 
			name : "radioButton",
			style:"float:left;",
			index: 1,
			allowHtml:true,
			classes:"cgcNavigationButton cgcActiveNavigator bsftPrimarySeparator bsftHeaders bsftMediumFont", 
			active : true,
			ontap: "switchTabs"
				});
		chatPanel.setContainer(this.$.tabNavigator.$.ChatContainer);
		chatPanel.setOwner(this.$.tabNavigator.$.ChatContainer);
		
		this.$.tabNavigator.render();
		this.$.tabNavigator.$.tabBar.addClass("cgcNavigationEnabled bsftSeparators");
		if(this.$.tabNavigator.$.radioButton){
			this.$.tabNavigator.$.radioButton.addClass("cgcDeactive");
			this.$.tabNavigator.$.radioButton.removeClass("active");
			this.$.tabNavigator.$.radioButton.removeClass("cgcActiveNavigator");
		}
		
		
		this.$.tabNavigator.$.AppViews.setIndex(1);
		this.render();
		chatPanel.swapChatPanel(false);
		enyo.Signals.send("layoutRefresh");
	},
	removeChatPanel : function() {
		this.setChatWidget(null);
		if(this.$.tabNavigator.$.tabBar.$.radioButton){
			this.$.tabNavigator.$.tabBar.$.radioButton.destroy();
			
		}
		
		if(this.$.tabNavigator.$.radioButton){
			this.$.tabNavigator.$.radioButton.removeClass("cgcDeactive");
			this.$.tabNavigator.$.radioButton.addClass("active");
			this.$.tabNavigator.$.radioButton.removeClass("cgcActiveNavigator");
		}
		this.$.tabNavigator.$.tabBar.removeClass("cgcNavigationEnabled bsftSeparators");
		this.$.tabNavigator.$.radioButton.addClass("cgcBorderNone");
		this.$.tabNavigator.render();
		this.$.tabNavigator.$.AppViews.setIndex(0);
		this.$.accordionItems.setIsViewChatPanel(false);
		

	},
	showChatPanel : function(chatPanel) {
		if(!this.getChatWidget()){
			this.setChatPanel(chatPanel);
			// TODO try to remove applyStyle
			chatPanel.applyStyle("height", "100%");
			this.setChatWidget(chatPanel);
		}
		

	},
	renderChatPane : function() {
		this.$.ChatPanelContainer.render();
	},
	renderVideoPane : function() {
		var webrtc = window.cgcComponent.basePanel.getWebRTCSession();
		if(webrtc && webrtc.getIsActive()){
			this.$.VideoPanel.render();
		}
	},
	onEndWebRTC : function() {
		
//		this.setVideoDisable(true);
		this.$.conferenceWidget.endCall();
	},
	attachCallContainer : function() {
		var webrtc = window.cgcComponent.basePanel.getWebRTCSession();
		if(webrtc && webrtc.getIsActive()){
			
			
			webrtc.setContainer(this.$.VideoPanel);
			webrtc.setOwner(this.$.VideoPanel);
			webrtc.setIsSetToDocker(true);
			if(webrtc.getIsVideoActive()){
				this.$.VideoPanel.applyStyle("height", "240px");
				this.$.VideoCallContainer.removeClass("cgcHide");
				this.renderVideoPane();
				
			}else{
				this.detachCallContainer();
			}
		}

	},
	detachCallContainer: function(){
			this.$.VideoPanel.applyStyle("height", "0px");
			this.$.VideoCallContainer.addClass("cgcHide");
			this.renderVideoPane();
	},
	onStartWebRTC : function(isVideo) {
		this.$.conferenceWidget.onStartWebRTC(isVideo);
	},
	onSwitchVideo : function(isVideo) {
		if (isVideo) {
			this.$.conferenceWidget.switchVideo();
		} else {
			this.$.conferenceWidget.switchAudio();
		}
	},
	goMute : function(isMute) {
		this.$.conferenceWidget.goMute(isMute);
	},
	hideAlternateDialInNumbersPopup: function(){
		if(this.$.alternateDialInOptionWidget){
			this.$.alternateDialInOptionWidget.hideAlternateDialInNumbersPopup();
		}
	},
	collapseAlternateDialInOptionWidget: function(){
		if(this.$.alternateDialInOptionWidget){
			this.$.alternateDialInOptionWidget.collapseDrawer();
		}
	},
	layoutRefresh  : function(isVideo) {
		
		var chatpanel = this.$.tabNavigator.$.ChatContainer.$.chatPanel;
		var panelHeight = getHeight(this.owner.id);
		
		//*******************Don't remove bellow commented code***********************
//			var accordionHeight = panelHeight
//					- getHeight(this.$.conferenceWidget.id)
//					- getHeight(this.$.VideoPanel.id)
//					- getHeight(this.$.desktopShareWidget.id)- 32;
		
//			var accordionHeight = panelHeight
//			- getHeight(this.$.conferenceWidget.id)
//			- getHeight(this.$.VideoPanel.id) - 32;
////			this.$.tabNavigatorBar.render();
//			this.$.accordionItems.applyStyle("height", accordionHeight
//					+ "px");
			this.$.accordionItems.render();
			this.$.tabNavigator.$.radioButton.setContent("<div class='cgcTabHeading'>" 
					+ htmlEscape(jQuery.i18n.prop("cgc.label.participants")) 
					+"</div> <div class='cgcParticipantsCount bsftBadgeText bsftBadgeBackground'>"
					+(window.cgcComponent.xmppInterface.getParticipantsCount())
					+"</div>");
			this.$.accordionItems.layoutRefresh();

			var self = this;
			setTimeout(function(){
				if(self.$.tabNavigator){
					self.$.tabNavigator.$.contactItems.autoScroll();
				}
			}, 10);
			
			
		if (chatpanel != undefined) {
			var chatpanelHeight =  getHeight(this.$.accordionItems.id)- 50;
//*******************Don't remove bellow commented code***********************
//			this.$.tabNavigator.$.ChatContainer.applyStyle("height", chatpanelHeight
//					+ "px");
			this.$.tabNavigator.$.ChatContainer.render();
			chatpanel.resized();
			
			chatpanel.autoscroll();
		}
		
		this.hideAlternateDialInNumbersPopup();
		
		this.resized();

		
	}

});
