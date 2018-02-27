/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

/**
 * This file constructs the welcome note for the application
 */
enyo.kind({
	name: "kind.com.broadsoft.cgc.welcomescreen.popup",
	components: [
		{name: "popupBGDiv", classes: "cgcPopuBackground"},
		{kind: "enyo.Popup", name: "welcomeScreenPopup", 
			centered: true, classes: "cgcWelcomePopup", 
			showing:true, autoDismiss: false,
			components: [{
				kind: "cgcwelcomescreen"
			}]
		},
		{kind: "Signals", onWelcomeScreenHide: "hideWelcomeScreen"},
	],
	create : function() {
		this.inherited(arguments);
		
		var self = this;
		setTimeout(function(){
			self.render();
		}, 100);
	},
	hideWelcomeScreen: function(inSender, inEvent) {
		this.$.welcomeScreenPopup.hide();
		this.$.popupBGDiv.addClass("cgcHide");
	},
	resizeHandler : function() {
		this.inherited(arguments);
		var self = this;
		setTimeout(function(){
			self.render();
			self.render();
		}, 500);
	}
});

enyo.kind({
	name: "cgcwelcomescreen",
	classes: "cgcWelcomeScreenContainer bsftWelcomeScreenPopupBackground",
	components: [
	    {
			classes: "cgcWelcomeScreenHeaderBox bsftPrimarySeparator",
			components: [{
				classes: "cgcWelcomeScreenHeader",
				content: htmlEscape(jQuery.i18n.prop("cgc.info.welcome.title"))
			},
			{
				classes: "cgcWelcomeScreenHeaderDesc bsftWelcomeScreenDesc cgcWelcomeScreenHeaderDescColor",
				content: htmlEscape(jQuery.i18n.prop("cgc.info.welcome.title.desc"))
			}]
			
		},
		{
			kind: "cgcwelcomescreen.item",
			name: "browserRestriction",
			src: "branding/assets/browser.svg?ts=" + window.ts,
			title: htmlEscape(jQuery.i18n.prop("cgc.label.welcome.browser")),
			desc: htmlEscape(jQuery.i18n.prop("cgc.info.welcome.preferedborwser"))
		},
		{
			kind: "cgcwelcomescreen.item",
			name: "call",
			src: "branding/assets/audio.svg?ts=" + window.ts,
			title: htmlEscape(jQuery.i18n.prop("cgc.label.audio")),
			desc:  ""
		},
		{
			kind: "cgcwelcomescreen.item",
			name: "video",
			src: "branding/assets/video.svg?ts=" + window.ts,
			title: htmlEscape(jQuery.i18n.prop("cgc.label.video")),
			desc: htmlEscape(jQuery.i18n.prop("cgc.info.welcome.video"))
		},
		{
			kind: "cgcwelcomescreen.item",
			name: "sharing",
			src: "branding/assets/share.svg?ts=" + window.ts,
			title: htmlEscape(jQuery.i18n.prop("cgc.label.welcome.sharing")),
			desc: htmlEscape(jQuery.i18n.prop("cgc.info.welcome.share"))
		},
		{
			layoutKind : "FittableColumnsLayout",
			classes : "cgcWelcomeScreenButtonBox",
			components : [ {
				kind : "enyo.Button",
				ontap : "hidePopup",
				classes : "cgcWelcomeScreenButton bsftPrimaryButton bsftPrimaryButtonReverse cgcTextEllipsis",
				content : htmlEscape(jQuery.i18n.prop("cgc.label.welcome.getstarted")),
				attributes : {
					title : htmlEscape(jQuery.i18n.prop("cgc.label.welcome.getstarted"))
				}
			}]
		}
	],
	create : function() {
		this.inherited(arguments);
		this.preparePopup();
		
	},
	hidePopup: function() {
		enyo.Signals.send("onWelcomeScreenHide");
	},
	preparePopup: function(){
		if(isChrome()){
			if(window.cgcConfig.webRTCEnabled){
				this.$.call.$.desc.setContent(htmlEscape(jQuery.i18n.prop("cgc.info.welcome.call")) +
			      (window.cgcConfig.callMeNowEnabled ? " " + htmlEscape(jQuery.i18n.prop("cgc.info.welcome.call.callme")) : ""));
				
				if(window.cgcConfig.webRTCVideoEnabled){
					this.$.video.removeClass("cgcHide");
				}
			} else {
				this.$.call.$.desc.setContent(htmlEscape(jQuery.i18n.prop("cgc.info.welcome.dialin")) +
					      (window.cgcConfig.callMeNowEnabled ? " " + htmlEscape(jQuery.i18n.prop("cgc.info.welcome.dialin.callme")) : ""));
			}
			if(window.cgcConfig.desktopShareExtId){
				this.$.sharing.removeClass("cgcHide");
			}
		} else {
			this.$.browserRestriction.removeClass("cgcHide");
			this.$.call.$.desc.setContent(htmlEscape(jQuery.i18n.prop("cgc.info.welcome.dialin")) +
				      (window.cgcConfig.callMeNowEnabled ? " " + htmlEscape(jQuery.i18n.prop("cgc.info.welcome.dialin.callme")) : ""));
		}
		this.$.call.removeClass("cgcHide");
	}
});

enyo.kind({
	kind : "onyx.Item",
	name: "cgcwelcomescreen.item",
	classes : "cgcWelcomeScreenItem cgcWelcomeScreenHeaderDescColor bsftSeparators cgcHide",
	published : {
		title : "",
		desc: "",
		src: ""
	},
	components: [
	 {
		 classes: "cgcWelcomeScreenItemImgBox",
		 components: [{
				tag : "img",
				name: "icon",
				classes: "cgcWelcomeScreenItemImg",
				src : ""
			},
			{
				name: "title",
				classes: "cgcWelcomeScreenItemImgTitle bsftMediumFont",
				content:""
			}]
	 },
	{
		components: [{
			name: "desc",
			allowHtml : true,
			classes: "bsftWelcomeScreenDesc",
			content:""
		}]
	}],
	create : function() {
		this.inherited(arguments);
		this.$.icon.setSrc(this.getSrc());
		this.$.title.setContent(this.getTitle());
		
		this.$.desc.setContent(this.getDesc());
	}
});