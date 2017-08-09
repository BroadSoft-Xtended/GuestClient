/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/


var previewssender = null;
var previewssenderuid = null;
var divChatColour = "";
var isChatPanelRightSide = true;
var chatDivBackColor = "cgcChatMessageBackgroundFirstColor";
var scrollTime = -1;
var scrollerTimer = null;
var isChromeOnMac = function() {
	return isChrome() && window.navigator.platform.toLowerCase().indexOf('mac') !== -1;
}
enyo.kind({
	name : "kind.com.broadsoft.cgc.ChatPanel",
	layoutKind : "FittableRowsLayout",
	classes : "cgcChatPanel",
	fit : true,
	components : [
			{
				kind : "enyo.Signals",
				onkeydown : "keyDown",
				onkeyup : "keyUp",
				onChatMessage : "showChatMessage",
				onChatInfoMessage : "showChatStatusMessage",
				onChatErrorMessage : "showChatErrorMessage"
			},
			{
				tag : "div",
				classes : "cgcChatPanelFooter"

			},
			{
				kind : "enyo.Scroller",
				name : "ChatScroller",
				classes : "cgcChatScroller cgcChatScrollerRight",
				fit : true,
				ontap : "setScrollofChat",
				resizeHandler : function() {
					var chatScrollerHeight = getHeight(this.owner.id)-75;
						chatScrollerHeight = chatScrollerHeight-getHeight(this.owner.$.textInput.id);
						this.applyStyle("max-height",chatScrollerHeight+"px");
						this.applyStyle("min-height",chatScrollerHeight+"px");
				},
				allowHtml : true,
				rendered : function () {
					this.setShowing(!isChromeOnMac());
				},
			},
			{
				tag : "div",
				classes : "cgcChatScrollerMac scroll-wrapper enyo-scroller scrollbar-inner scrollbar-macosx",
				style : "position: relative; overflow : auto !important;",
				rendered : function () {
					this.setShowing(isChromeOnMac());
				},
				components : [
					{
						kind : "enyo.Scroller",
						name : "MacChatScroller",
						classes : "cgcChatScroller cgcChatScrollerRight",
						fit : true,
						ontap : "setScrollofChat",
						resizeHandler : function() {
							var chatScrollerHeight = getHeight(this.owner.id)-75;
								chatScrollerHeight = chatScrollerHeight-getHeight(this.owner.$.textInput.id);
								this.applyStyle("max-height",chatScrollerHeight+"px");
								this.applyStyle("min-height",chatScrollerHeight+"px");
						},
						allowHtml : true
					},
					{
						tag : "div", classes : "scroll-element scroll-x scroll-scrollx_visible scroll-scrolly_visible",
						components : [
							{
								tag : "div", classes : "scroll-element_outer",
								components : [
									{ tag : "div", classes : "scroll-element_size" },
									{ tag : "div", classes : "scroll-element_track" },
									{ tag : "div", classes : "scroll-bar", style : "width: 85px; left: 0px;" }
								]
							}   
						]

					},
					{
						tag : "div", classes : "scroll-element scroll-y scroll-scrollx_visible scroll-scrolly_visible",
						components : [
							{
								tag : "div", classes : "scroll-element_outer",
								components : [
									{ tag : "div", classes : "scroll-element_size" },
									{ tag : "div", classes : "scroll-element_track" },
									{ tag : "div", classes : "scroll-bar" }
								]
							
							}   
						]
					}
				]
			},
			{
				name : "divcap",
				tag : "div",
				classes : "cgcChatPanelHeader"

			},
			
			
			{
				name : "divcapchat",
				tag : "div",
				classes : "cgcChatBoxRight",
				components:[
			
					{
						name : "textInput",
						id : "cgcTextArea",
						kind : "enyo.TextArea",
						classes : "chatEntryBoxRight",
						attributes : {
							maxlength : 5021,
							required : "required"
						},
						events:{
							onkeydown:"onChangeTextArea",
							onkeyup:"onChangeTextArea",
							oninput:"onChangeTextArea"
						},
						placeholder : htmlEscape(jQuery.i18n
								.prop("cgc.label.chat.hint")),
						defaultFocus : true,
						resizeHandler : function() {
							if(this.value != "") {
								var scroller = document.getElementById(this.id);
								if (scroller != null) {
									this.applyStyle("height","");
									this.applyStyle("height",(scroller.scrollHeight-10)+"px");
								}
							}else{
								this.applyStyle("height","");
							}
							if(!isChromeOnMac()) {
								this.owner.$.ChatScroller.resized();
							} else {
								this.owner.$.MacChatScroller.resized();
							}
						},
					}]
				} ],
		setScrollofChat : function(inSender, inEvent){
		window.isChatPanel = true;
		window.isParicipantsPanel = false;
	},
    onChangeTextArea : function(inSender, inEvent) {
    		this.$.textInput.resized();
    },
	showFullScreen : function(inSender, inEvent) {

		this.owner.showFullScreen();
	},
	chatEntered : function(param1, param2) {
		this.appendChat();
	},
	keyDown : function(inSender, inEvent) {
		if (!inEvent.shiftKey && inEvent.keyCode === 13
				&& this.$.textInput.hasFocus()) {
			this.appendChat();
			inEvent.preventDefault();
		}
		if (!window.cgcComponent.basePanel.getIsFullScreen() && 
				!window.cgcComponent.basePanel.$.cgcRightPanel.getChatWidget()) {
			inEvent.preventDefault();
		}
	},
	keyUp : function(inSender, inEvent){
		if(this.$.textInput.value != "") {
			if(isChatPanelRightSide){
				this.$.textInput.removeClass("chatEntryBoxTopInnerBorder");
				this.$.textInput.addClass("chatEntryBoxFullInnerBorder");
				this.$.textInput.addClass("chatEntryBoxActive");
			}else{
				this.$.divcapchat.removeClass("chatEntryBoxFullInnerBorder");
				this.$.divcapchat.addClass("chatEntryBoxTopInnerBorder");
			}
		} else {
				this.$.textInput.removeClass("chatEntryBoxTopInnerBorder");
				this.$.textInput.removeClass("chatEntryBoxFullInnerBorder");
				this.$.textInput.removeClass("chatEntryBoxActive");
				
				this.$.divcapchat.removeClass("chatEntryBoxTopInnerBorder");
				this.$.divcapchat.removeClass("chatEntryBoxFullInnerBorder");
				this.$.divcapchat.removeClass("chatEntryBoxActive");
		}
	},
	appendChat : function() {
		var chatMessage = this.$.textInput.value;
		window.cgcComponent.xmppInterface.sendChat(chatMessage);
		this.$.textInput.set("value", "");
		
	},
	showChatMessage : function(inEvent, data) {
		sender = data.sender;
		message = data.message;
		if(data.jid == window.cgcProfile.guestImpDetails.loginId){
			this.createChatElements( undefined,sender, message, true);
		}else{
			this.createChatElements( data.jid,sender, message, false);
		}
	},

	showChatStatusMessage : function(inEvent, data) {
		var message = data.message;
		var isUserInfo = data.avatar;
		var action = "";
		var isImgAvailable = false;
		var img = "";
		if(isUserInfo){
			action = data.action;
			img = data.image;
			if(img){
				isImgAvailable = true;
			}
		}
		
		var chatUserInfo = "cgcChatInfo";
		var fontColor = "cgcChatInfoFontColor";
		if(isUserInfo){
			chatUserInfo = "cgcChatUserInfo";
			fontColor = "cgcChatUserInfoFontColor"
		}
		if (!(message == null || message == "")) {
			previewssender = null;
			previewssenderuid = null;
			
			var chatScroller  = this.$.ChatScroller;
			if(isChromeOnMac()) {
				chatScroller  = this.$.MacChatScroller;
			} else {
				chatScroller  = this.$.ChatScroller;
			}
			chatScroller.createComponent({
						kind : "cgc.ChatInfoItem",
						fit: true,
						allowHtml : true,
						classes : "cgcInfoAndErrorDiv",
							
						components:[{
							kind : "enyo.FittableColumns",
							allowHtml : true,
							classes : fontColor + " cgcChatInfoBackground",
							components:[{
								tag : "div",
								classes : chatUserInfo,
								allowHtml : this.matchURLWithHTMLLinks(message),
								content : this.replaceURLWithHTMLLinks(message)
							},{
								tag : "div",
								allowHtml : true,
								classes : chatUserInfo + " cgcChatUserInfoStatusFont",
								content : "&nbsp;" + action,
								showing : isUserInfo
							}]
						
						}]
					
				});
				
			chatScroller.render();
			this.autoscroll();
			
		}
	},
	showChatErrorMessage : function(inEvent, data) {
		var message = data.message;
		if (!(message == null || message == "")) {
			previewssender = null;
			previewssenderuid = null;
			
			var chatScroller  = this.$.ChatScroller;
			if(isChromeOnMac()) {
				chatScroller  = this.$.MacChatScroller;
			} else {
				chatScroller  = this.$.ChatScroller;
			}
			chatScroller.createComponent({
				kind : "cgc.ChatErrorItem",
				allowHtml : true,
				components : [ {
					tag : "div",
					classes : "cgcInfoAndErrorDiv",
					components:[{
					kind : "enyo.FittableColumns",
					style : "vertical-align: baseline;white-space: pre-wrap;word-wrap: break-word;",
					allowHtml : true,
					classes : " cgcChatErrorFontColor",
					content : message
				}]
				
				}]
			});
			chatScroller.render();
			this.autoscroll();
		}
	},
	createChatElements : function(jid,sender, message, clearText) {
		var chatDivClasses=chatDivBackColor;
		var mainDiv = "cgcChatSenderMainDiv";
		var chatContentStyle = "cgcChatContentFirstStyle";
		var senderUid = sender;
		// for getting the guest name to show in chat panel
		sender = getGuestName(senderUid);
		
		var owner = undefined;
		if(jid){
			owner = window.cgcComponent.controlPanel.getRole(jid.split("/")[1]);
		}
		var profileUser = window.cgcProfile.firstName+" "+window.cgcProfile.lastName;
		var date = new Date();
		var hours = date.getHours();
		var mins = date.getMinutes();
		var ampm = hours < 12 ? " am" : " pm";
		var img = undefined;
		if(jid){
			img =  window.cgcComponent.controlPanel.getImage(jid.split("/")[1]);
		}
		if (!(message == null || message.trim() == "")) {
			hours = hours > 12 ? (hours - 12) : hours;
			mins = mins < 10 ? ("0" + mins) : mins;
			if (previewssenderuid != senderUid) {
				previewssenderuid = senderUid;
				previewssender = sender;
				if(owner){
					owner = " &bull; " + owner + " &bull; ";
				}else{
					owner = " &bull; ";
				}
				owner=owner+ hours + ":" + mins + ampm;
				
				
						if(chatDivClasses=="cgcChatMessageBackgroundFirstColor"){
							chatDivClasses = "cgcChatMessageBackgroundSecondColor";
							
						}else{
							chatDivClasses = "cgcChatMessageBackgroundFirstColor";
							
						}
						chatDivBackColor = chatDivClasses;
			} else {
				sender = "";
				owner = "";
			}
			var heightofImg  = "height: auto;width: 28px;display: inline-table;";
			if(clearText){
				this.$.textInput.set("placeholder", htmlEscape(jQuery.i18n.prop("cgc.label.chat.hint")));
			}else{
				heightofImg  = "height: auto;width: 28px;display: inline-table;";
				divChatColour = "cgcParticipantMessageBackground";
			}
			heightofImg = heightofImg + "float: left;";
			if(this.matchURLWithHTMLLinks(message)){
				message = htmlEncode(message);
			}
			if (sender.length != 0) {
				
				
				
				var isImgAvailable = true;
				
				var cgcChatAvatar = "cgcChatAvatar";
				if(!img){
					isImgAvailable = false;
					chatContentStyle = "cgcChatContentOtherStyle";
					heightofImg  = "height:28px;width:28px;float: right;";
					cgcChatAvatar = "cgcChatEmptyAvatar";
				}
				chatContentStyle = chatContentStyle + " " + chatDivClasses;
				
				var chatScroller  = this.$.ChatScroller;
				if(isChromeOnMac()) {
					chatScroller  = this.$.MacChatScroller;
				} else {
					chatScroller  = this.$.ChatScroller;
				}
				var comp = chatScroller.createComponent({
						kind : "cgc.ChatItemHeader",
						kind : "enyo.FittableColumns",
						classes : mainDiv,
						published:{
							messageComp:undefined,
							imageComp:undefined
						},
						components:[{
							tag : "div",
							style : heightofImg,
							rendered : function(){
								if(!isImgAvailable){
									this.destroy();
								}else{
								comp.setImageComp(this);
								}
							},
							components:[{
							tag : "img",
							classes : cgcChatAvatar,
							src : img,
							fit : true,
							showing : isImgAvailable
						}]
						},{
						kind : "FittableRows",
						classes : chatContentStyle ,
						rendered : function(){
							
							comp.setMessageComp(this);
						},
						components : [{
											kind : "enyo.FittableRows",
											classes : "cgcChatInnerBox",
											allowHtml : true,
											components : [ {
												tag : "div",
												classes : "cgcChatItemMessage",
												allowHtml : this.matchURLWithHTMLLinks(message),
												content : this.replaceURLWithHTMLLinks(message)
												},{
												kind : "enyo.FittableColumns",
												classes : "cgcChatDetails",
												components : [ {
												tag : "div",
												content : sender,
												allowHtml : true,
												classes : "cgcChatItemHeader",
												},{
												tag : "div",
												content : owner,
												allowHtml : true,
												classes : "cgcChatItemHeaderTime",
												} ]
											}]
										}],
						allowHtml : true

						}]
				});
			} else {
				chatContentStyle = "cgcChatContentOtherStyle";
				
				var chatScroller  = this.$.ChatScroller;
				if(isChromeOnMac()) {
					chatScroller  = this.$.MacChatScroller;
				} else {
					chatScroller  = this.$.ChatScroller;
				}
				var comp = chatScroller.createComponent({
					kind : "cgc.ChatItem",
					kind : "enyo.FittableRows",
					classes : "cgcChatMessageUser",
					allowHtml : true,
					published:{
						messageComp:undefined,
					},
					components : [ {
						tag : "div",
						classes : chatContentStyle +" "+chatDivClasses,
						rendered : function(){
							
							comp.setMessageComp(this);
						},
						components : [ {
							tag : "div",
							allowHtml : this.matchURLWithHTMLLinks(message),
							content : this.replaceURLWithHTMLLinks(message),
							classes : "cgcChatItemMessage",
						},{
							kind : "enyo.FittableColumns",
							classes : "cgcChatDetails",
							style : "padding-left: 0px",
							components : [ {
							tag : "div",
							content : hours + ":" + mins + ampm,
							classes : "cgcChatItemHeaderTime",
							showing : true
							} ]
						}]
					} ]
				});
			}
			if (!window.cgcComponent.basePanel.getIsFullScreen() || !window.cgcComponent.basePanel.getIsViewableChat()) {
					window.cgcComponent.basePanel.showPopup(previewssender,message);
			}
			
			if(isChromeOnMac()) {
				this.$.MacChatScroller.render();
			} else {
				this.$.ChatScroller.render();	
			}
			
			this.autoscroll();
			
		}
		if (clearText) {
			this.$.textInput.set("value", "");

		}
	},
	replaceURLWithHTMLLinks : function(text) {
		if(this.matchURLWithHTMLLinks(text)){
			var re = /(\(.*?)?\b((?:https?|ftp|file):\/\/[-a-z0-9+&@#\/%?=~_()|!:,.;]*[-a-z0-9+&@#\/%=~_()|])/ig;
		    return text.replace(re, function(match, lParens, url) {
		        var rParens = '';
		        lParens = lParens || '';

		        // Try to strip the same number of right parens from url
		        // as there are left parens.  Here, lParenCounter must be
		        // a RegExp object.  You cannot use a literal
		        //     while (/\(/g.exec(lParens)) { ... }
		        // because an object is needed to store the lastIndex state.
		        var lParenCounter = /\(/g;
		        while (lParenCounter.exec(lParens)) {
		            var m;
		            // We want m[1] to be greedy, unless a period precedes the
		            // right parenthesis.  These tests cannot be simplified as
		            //     /(.*)(\.?\).*)/.exec(url)
		            // because if (.*) is greedy then \.? never gets a chance.
		            if (m = /(.*)(\.\).*)/.exec(url) ||
		                    /(.*)(\).*)/.exec(url)) {
		                url = m[1];
		                rParens = m[2] + rParens;
		            }
		        }
		        return lParens + "<a href='" + url + "'  target='_blank' >" + url + "</a>" + rParens;
		    });
		}else{
			return text;
		}
	},
	matchURLWithHTMLLinks : function(text) {
	    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/i;
	    return (text.indexOf(" http") !==-1 || text.indexOf("http") ==0) && text.match(exp,"<a href='$1'>$1</a>"); 
	},
	swapChatPanel : function(isRight){
		
		
		if(!isRight){
			if(isChromeOnMac()) {
				this.$.MacChatScroller.addClass("cgcChatScrollerLeft");
				this.$.MacChatScroller.removeClass("cgcChatScrollerRight");
			} else {
				this.$.ChatScroller.addClass("cgcChatScrollerLeft");
				this.$.ChatScroller.removeClass("cgcChatScrollerRight");
			}
			this.$.divcapchat.removeClass("cgcChatBoxRight");
			this.$.divcapchat.addClass("cgcChatBoxLeft");
			this.$.textInput.removeClass("chatEntryBoxRight");
			this.$.textInput.addClass("chatEntryBoxLeft");
		}else{
			if(isChromeOnMac()) {
				this.$.MacChatScroller.removeClass("cgcChatScrollerLeft");
				this.$.MacChatScroller.addClass("cgcChatScrollerRight");	
			} else {
				this.$.ChatScroller.removeClass("cgcChatScrollerLeft");
				this.$.ChatScroller.addClass("cgcChatScrollerRight");
			}
			
			this.$.divcapchat.removeClass("cgcChatBoxLeft");
			this.$.divcapchat.addClass("cgcChatBoxRight");
			this.$.textInput.addClass("chatEntryBoxRight");
			this.$.textInput.removeClass("chatEntryBoxLeft");
		}
		if(this.$.textInput.value != "") {
			if(!isRight){
				this.$.divcapchat.removeClass("chatEntryBoxFullInnerBorder");
				this.$.divcapchat.addClass("chatEntryBoxTopInnerBorder");
				
				this.$.textInput.removeClass("chatEntryBoxTopInnerBorder");
				this.$.textInput.removeClass("chatEntryBoxFullInnerBorder");
				
			}else{
				this.$.textInput.removeClass("chatEntryBoxTopInnerBorder");
				this.$.textInput.addClass("chatEntryBoxFullInnerBorder");
				
				this.$.divcapchat.removeClass("chatEntryBoxTopInnerBorder");
				this.$.divcapchat.removeClass("chatEntryBoxFullInnerBorder");
			}
		} else {
				this.$.textInput.removeClass("chatEntryBoxTopInnerBorder");
				this.$.textInput.removeClass("chatEntryBoxFullInnerBorder");
				
				this.$.divcapchat.removeClass("chatEntryBoxTopInnerBorder");
				this.$.divcapchat.removeClass("chatEntryBoxFullInnerBorder");
		}
		isChatPanelRightSide = isRight;
		this.resized();
	},
	autoscroll : function() {
		var now = new Date().getTime();
		var self = this;
		if(scrollTime>0 && (now-scrollTime)<1000){
			scrollerTimer = clearTimeout(scrollerTimer);
			scrollerTimer = setTimeout(function(){
				self.autoscrollasynch();
				scrollTime = -1;
			},(now-scrollTime) - 1000);
		}else if (scrollTime < 0){
			scrollerTimer = setTimeout(function(){
				self.autoscrollasynch();
				scrollTime = -1;
			},1000);
			scrollTime = now;
		}
		 
	},autoscrollasynch : function() {	
		if(isChromeOnMac()) {
			var box = document.getElementById('chatPanel_MacChatScroller');
			box.scrollTop = box.scrollHeight;
		}else{
			var box = document.getElementById('chatPanel_ChatScroller');
			box.scrollTop = box.scrollHeight;
		}
		
		if(true) return;
		
		//TODO: Analyse the below code for autoscroll performance 
		if(window.navigator.platform.toLowerCase().indexOf('mac') !== -1){
			this.$.ChatScroller.addClass("cgcChatScrollerMac");
		}else{
			this.$.ChatScroller.addClass("scrollbar-inner");
			this.$.ChatScroller.addClass("cgcChatScrollerNonMac");
		}
		
		this.layoutRefresh();
		if(isChromeOnMac()) {
			window.heightOfChatDiv = this.$.MacChatScroller.id;	
		} else {
			window.heightOfChatDiv = this.$.ChatScroller.id;	
		}
		var scroller = document.getElementById(window.heightOfChatDiv);
		if (scroller != null) {
			var height = scroller.scrollHeight - $(scroller).height();
			
			window.heightOfChatPanel = getHeight(this.owner.id);
			window.chatTextBox = this.$.textInput;
			$("#"+window.heightOfChatDiv).scrollTop( height );
				
			if(window.navigator.platform.toLowerCase().indexOf('mac') == -1){
				document.addEventListener('keydown', chatScrollPage);
				window.chatCustomScrollar = jQuery('.scrollbar-inner').scrollbar();
				window.chatCustomScrollar.setScrollCurrentPosition(height);
			}
			
			/* if(isChromeOnMac()) {
				document.addEventListener('keydown', chatScrollPage);
				window.chatCustomScrollar = jQuery('.scrollbar-macosx').scrollbar();
				window.chatCustomScrollar.setScrollCurrentPosition(height);
			} */
			
		}
		
	},
	refreshSelf : function() {
		this.$.ChatScroller.render();
		this.$.MacChatScroller.render();
		this.$.textInput.render();
		this.render();
		this.autoscroll();
	},
	layoutRefresh : function() {
		this.resized();
		this.$.ChatScroller.resized();
		this.$.MacChatScroller.resized();
	}

});

enyo.kind({
	name : "cgc.ChatItem",
	components : [

	],
	allowHtml : true

});

enyo.kind({
	name : "cgc.ChatItemHeader",
	components : [

	],
	allowHtml : true
});


enyo.kind({
	name : "cgc.ChatErrorItem",
	kind : "FittableColumns",
	classes : "cgcErrorItem",
	components : [

	],
	allowHtml : true

});


enyo.kind({
	name : "cgc.ChatInfoItem",
	kind : "FittableRows",
	classes : "cgcChatItemInfo",
	components : [

	],
	allowHtml : true

});

var errorMessage = function(msg) {
	msg = htmlEscape(jQuery.i18n.prop(msg));
	enyo.Signals.send("onChatErrorMessage", {
		message : msg
	});
}

var errorMessage = function(msg, value) {
	msg = htmlEscape(jQuery.i18n.prop(msg, value));
	enyo.Signals.send("onChatErrorMessage", {
		message : msg
	});
}

var chatScrollPage = function (event){
	 if(!window.chatTextBox.hasFocus()){
		 
	 var validateValue = function(value,maxHeight){
			if(maxHeight < value){
				value = maxHeight;
			}else if (0 > value){
				value = 0;
			}
			return value;
	 }
	 var maxHeight = 0;
	 	if(window.chatCustomScrollar && window.isChatPanel){
	 		var scroller = document.getElementById(window.heightOfChatDiv);
			if (scroller != null) {
				maxHeight = scroller.scrollHeight;
			}
		    switch(event.keyCode){
		    case 34:
		    	var height = parseInt(window.chatCustomScrollar.getScrollCurrentPosition()) + parseInt(window.heightOfChatPanel);
		    	height = validateValue(height,maxHeight);
		    	$("#"+window.heightOfChatDiv).scrollTop( height );
		    	window.chatCustomScrollar.setScrollCurrentPosition(height);
		    	break;
		    case 33:
		    	var height = parseInt(window.chatCustomScrollar.getScrollCurrentPosition()) - parseInt(window.heightOfChatPanel); ;
		    	height = validateValue(height,maxHeight);
		    	$("#"+window.heightOfChatDiv).scrollTop( height );
		    	window.chatCustomScrollar.setScrollCurrentPosition(height);
		    	break;
		    case 38:
		    	var height = parseInt(window.chatCustomScrollar.getScrollCurrentPosition()) -3;
		    	height = validateValue(height,maxHeight);
		    	$("#"+window.heightOfChatDiv).scrollTop( height );
		    	window.chatCustomScrollar.setScrollCurrentPosition(height);
		    	break;
		    case 40:
		    	var height = parseInt(window.chatCustomScrollar.getScrollCurrentPosition()) + 3;
		    	height = validateValue(height,maxHeight);
		    	$("#"+window.heightOfChatDiv).scrollTop( height );
		    	window.chatCustomScrollar.setScrollCurrentPosition(height);
		    	break;
		    }
	 	}
	 	}
}



