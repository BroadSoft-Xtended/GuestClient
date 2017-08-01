/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/
var cgcCallMeNumberText = "";
var isCallMeDailed = false;
var x = 0;
var y = 0;
var isVideoActivated = false;
var isAudioActivated = false;
var isMuted = false;
window.cgcConfig.isHidden = false;


var isViewWebrtc = function() {
	if (isChrome() && window.cgcConfig.webRTCEnabled && window.cgcProfile.dialNum != "" && window.location.protocol.indexOf('https') !== -1) {
		return true;
	} else {
		return false;
	}
}

var isShowDesktopSharePanel = function() {
	
	return isChrome() && window.cgcConfig.desktopShareExtId != null && window.cgcConfig.desktopShareExtId.trim() != "";
}

/** Call Me Now Widgent **/
enyo.kind({
    name: "kind.cgc.com.broadsoft.CallMeOption",
    kind: "enyo.FittableRows",
    classes: "cgcCallMeWidget",
    components: [
        {name: "title", tag:"div", allowHtml:true, classes:"cgcCallMeNowLabel", content: htmlEscape(jQuery.i18n
				.prop("cgc.label.callmeoption"))+"<br><br>"},
        {name: "Note",  tag:"div", allowHtml:true, classes:"cgcCallMeLable", content: htmlEscape(jQuery.i18n
				.prop("cgc.label.callme.hint"))+"<br><br>"},
        {layoutKind : "FittableColumnsLayout", 
          components:[
              
              {kind: "onyx.InputDecorator", classes:"cgcCallMeNumberText", fit:true, name : "cgcCallMeNumberText",
            	  components: [
                {kind: "onyx.Input", name : "callMeNumberText", id: "callMeNumberText", classes : "cgcCallMeInputText", onkeydown : "allowNumberBefore",
					onkeyup : "allowNumberAfter", rendered:function(){
						if (cgcCallMeNumberText.length == 0){
							this.owner.$.CallMeImgNowButton.removeClass("cgcCallMeButtonEnableBackground");
							this.owner.owner.owner.setActive(false);
							this.owner.$.cgcCallMeNumberText.removeClass("cgcCallMeNumberActiveTextBorder");
						} else {
							this.owner.$.CallMeImgNowButton.addClass("cgcCallMeButtonEnableBackground");
							this.owner.owner.owner.setActive(true);
							this.owner.$.cgcCallMeNumberText.addClass("cgcCallMeNumberActiveTextBorder");
						}},placeholder: htmlEscape(jQuery.i18n
							.prop("cgc.label.callmenumber.hint"))}
              ]},
              {kind: "onyx.Button", name: "CallMeImgNowButton", classes:"cgcCallMeImgNowButton cgcCallMeButtonDisableBackground", content: htmlEscape(jQuery.i18n
      				.prop("cgc.label.callme")), ontap: "callMeNow", ondown : "onSelectCallMeNowButtonColor",
					onup : "onReleaseCallMeNowButtonColor", onleave : "onReleaseCallMeNowButtonColor"}
          ]}
    ],
    onSelectCallMeNowButtonColor : function(inSender, inEvent) {
		if (cgcCallMeNumberText.length != 0){
			this.$.CallMeImgNowButton.removeClass("cgcCallMeButtonEnableBackground");
			this.$.CallMeImgNowButton.addClass("cgcCallMeButtonOnPressBackground");
		}
	},
	onReleaseCallMeNowButtonColor : function(inSender, inEvent) {
		if (cgcCallMeNumberText.length != 0){
			this.$.CallMeImgNowButton.removeClass("cgcCallMeButtonOnPressBackground");
			this.$.CallMeImgNowButton.addClass("cgcCallMeButtonEnableBackground");
		}
	},
    allowNumberAfter : function(inSender, inEvent) {
		if (inEvent.ctrlKey == true && inEvent.keyCode === 86) {
			var myString = this.$.callMeNumberText.value;
			myString = myString.replace(/[^\d +-]/g, '');
			this.$.callMeNumberText.set("value", myString);
		}
		cgcCallMeNumberText = this.$.callMeNumberText.value;
		if (cgcCallMeNumberText.length == 0){
			this.$.CallMeImgNowButton.removeClass("cgcCallMeButtonEnableBackground");
			this.owner.owner.setActive(false);
			this.$.cgcCallMeNumberText.removeClass("cgcCallMeNumberActiveTextBorder");
		} else {
			this.$.CallMeImgNowButton.addClass("cgcCallMeButtonEnableBackground");
			this.owner.owner.setActive(true);
			this.$.cgcCallMeNumberText.addClass("cgcCallMeNumberActiveTextBorder");
		}
		
	},
	allowNumberBefore : function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			this.callMeNow(inSender);
			return true;
		}
		if (((inEvent.shiftKey != true && inEvent.keyCode === 189) || inEvent.shiftKey == true
				&& inEvent.keyCode === 187)
				|| (inEvent.shiftKey != true && inEvent.keyCode > 47 && inEvent.keyCode < 58)
				|| (inEvent.keyCode > 95 && inEvent.keyCode < 106)
				|| inEvent.keyCode === 46
				|| inEvent.keyCode === 8
				|| inEvent.keyCode === 9
				|| inEvent.keyCode === 32
				|| inEvent.keyCode === 37
				|| inEvent.keyCode === 39
				|| inEvent.keyCode === 107 || inEvent.keyCode === 109) {
			return true;
		}
		if (inEvent.ctrlKey == true
				&& (inEvent.keyCode === 86 || inEvent.keyCode === 67
						|| inEvent.keyCode === 88 || inEvent.keyCode === 65)) {
			return true;
		}
		inEvent.preventDefault();
		return false;
	},
    callMeNow: function() {
    	enyo.Signals.send("onCallMeNowSignal",
                {dialno:this.$.callMeNumberText.getValue()}
        );
    	cgcCallMeNumberText = "";
    	this.$.callMeNumberText.set("value","");
    	this.render();
    }
});

enyo.kind({tag : "div",
	name : "kind.cgc.com.broadsoft.AlterNumber",
	style : "display: initial;",
	published : {
		isShowAlter : false
	},
	attributes : {
		title : htmlEscape(jQuery.i18n
				.prop("cgc.tooltip.altnumber.expand"))
	},
	components:[{
		tag : "img",
		classes : "cgcAlternativeExpand",
		src	: "branding/assets/down-arrow.svg",
		ontap:"showAlterDialInInfo"
		},{
			name : "alternativeNumberPopup",
			kind : "enyo.Popup",
			classes : "cgcAlternativeNumberPopup cgcAlternativeNumberPopupBackground cgcAlternativeNumberPopupText",
			floating: true, centered: true,
			onHide:"hideAlterDialInInfo",
	          components: [
	            {
	            	tag : "div",
					name : "alternativeNumberPopupContent",
					allowHtml : true,
					content: ""
					}
	        ]
	}],
	showAlterDialInInfo : function(panel){
	enyo.Signals.send("onAlternativNumberSignal");
	},
	hideAlterDialInInfo : function(panel){
		enyo.Signals.send("onAleternativeNumberHideSignal");
		}
});

/** Dial In Widgent **/
enyo.kind({
    name: "kind.cgc.com.broadsoft.DialInOption",
    kind: "enyo.FittableRows",
    classes:"cgcDialInfoWidget",
    components: [
        {name: "title", tag:"div", allowHtml:true, classes:"cgcDialInfoLabel", 
         content:htmlEscape(jQuery.i18n
					.prop("cgc.label.dialinoption"))+"<br><br>"
        },
        
        {kind: "enyo.FittableRows", 
        	
            components:[
				{tag : "div",
				 allowHtml : "true",
				 name:"conferenceNumber",
				 content:htmlEscape(jQuery.i18n
							.prop("cgc.label.dialinnumber"))

				 },
				 {tag : "div",
	                     allowHtml : "true",
	         			   name:"conferenceId",            	  
	                     content: htmlEscape(jQuery.i18n
	     						.prop("cgc.label.conferenceid"))

	            },
                {tag : "div",
                    allowHtml : "true",
     			   name:"securityPin",               
                    content:htmlEscape(jQuery.i18n
    						.prop("cgc.label.securitypin")) 
                }
          ],
          rendered: function(){
        	  //this.inherited(arguments);
        	  this.parent.$.conferenceNumber.setContent(htmlEscape(jQuery.i18n
						.prop("cgc.label.dialinnumber"))+": "
						+ window.cgcProfile.dialNum);
        	  this.parent.$.conferenceId.setContent(htmlEscape(jQuery.i18n
						.prop("cgc.label.conferenceid"))+": "+ window.cgcProfile.confId);
        	  if( !isNullOrEmpty(window.cgcProfile.securityPin)){
        	  this.parent.$.securityPin.setContent(htmlEscape(jQuery.i18n
						.prop("cgc.label.securitypin"))+": "+ window.cgcProfile.securityPin);
        	  this.parent.$.securityPin.show(); 
        	  }else{
        		  this.parent.$.securityPin.hide(); 
        	  }
          }
        }
    ]
});



/** Alternate DialIn option Widget **/
enyo.kind({
    name: "kind.cgc.com.broadsoft.AlternateDialInOptionWidget",
     isCallMeDailed : false,
    components: [
        {kind: "kind.cgc.com.broadsoft.Drawer",
         name:"drawer"
        },
        {kind: "Signals", onCallMeNowSignal: "callMeNow",onAlternativNumberSignal : "showAlterDialInInfo",onAleternativeNumberHideSignal:"hideAlterDialInInfo"}

    ],
    
    rendered: function(){
    	
    	this.$.drawer.setTitle(htmlEscape(jQuery.i18n
				.prop("cgc.label.additionalcalloptions.link"))); 
    	if(window.cgcConfig.callMeNowEnabled && window.cgcProfile.dialNum != "" &&  window.cgcProfile.confId != ""){
	    	if(!this.$.drawer.$.items.$.callMeComp){
		    		this.$.drawer.addElement({ kind:"kind.cgc.com.broadsoft.CallMeOption",name :"callMeComp"});
		    		
	    	}
    	}
    	if(window.cgcProfile.dialNum != "" &&  window.cgcProfile.confId != ""){
    		if(!this.$.drawer.$.items.$.DialInOption){
	    	    this.$.drawer.addElement({ kind:"kind.cgc.com.broadsoft.DialInOption", name :"DialInOption"});
	    	    if(window.cgcProfile.altDialNum){
	    	    	this.$.drawer.addElement({ kind:"kind.cgc.com.broadsoft.AlterNumber", name:"AlterNumber"});
	    	    }
	    	}
    	}
		if(!isViewWebrtc() ){
			this.$.drawer.hideHeaderBar();
		}else{
			this.$.drawer.showHeaderBar();
		}
		if(window.cgcProfile.dialNum == ""){
			this.$.drawer.hide();
		}else{
			this.$.drawer.show();
		}
		this.$.drawer.render();

    },
	hideAlterDialInInfo : function(){
		this.showAlterDialInInfo(null);
	},
	showAlterDialInInfo : function(panel){
		var allow = false;
		if(panel == null){
			if(window.cgcComponent.timeoutHidePopup){
				clearTimeout(window.cgcComponent.timeoutHidePopup);
			}
			window.cgcConfig.isHidden = true;
			window.cgcComponent.timeoutHidePopup = setTimeout(function(){window.cgcConfig.isHidden=false},200);
			allow = true;
		}else if (!window.cgcConfig.isHidden){
			allow = true;
		}
		if(allow){
			if (window.cgcProfile.securityPin != "")
				securityPin = "<br/> "+htmlEscape(jQuery.i18n
						.prop("cgc.label.securitypin"))
						+ ":" + window.cgcProfile.securityPin;
			
			
			
			if(window.cgcProfile.altDialNum != null &&
					window.cgcProfile.altDialNum && 
					window.cgcProfile.altDialNum != "" && 
					window.cgcProfile.altDialNum != "undefined"){
				if(this.$.drawer.$.items.$.AlterNumber.getIsShowAlter()){
					this.$.drawer.$.items.$.AlterNumber.setIsShowAlter(false);
					this.$.drawer.$.items.$.AlterNumber.$.alternativeNumberPopup.hide();
					this.$.drawer.$.items.$.AlterNumber.setAttribute("title", htmlEscape(jQuery.i18n
							.prop("cgc.tooltip.altnumber.expand")));
				}else{
					var alterNumbers = window.cgcProfile.altDialNum.split(',');
					var values ="<b><u>"+htmlEscape(jQuery.i18n
							.prop("cgc.label.dialinfo.alternatenumbers"))+"</b></u>";
					for(var i = 0 ; i<alterNumbers.length;i++){
						if(alterNumbers[i].trim() != ""){
							if(values == ""){
								values = alterNumbers[i].trim();
							}else{
								values = values + "<br><br>"+alterNumbers[i].trim();
							}
							
						}
					}
					window.cgcComponent.alternativeNumberPopup = this.$.drawer.$.items.$.AlterNumber.$.alternativeNumberPopup;
					this.$.drawer.$.items.$.AlterNumber.$.alternativeNumberPopupContent.setContent(values);
					x = window.currentMousePos.x-8;
					y = window.currentMousePos.y+8;
					this.$.drawer.$.items.$.AlterNumber.$.alternativeNumberPopup.show();
					this.$.drawer.$.items.$.AlterNumber.$.alternativeNumberPopup.applyStyle("top",y+"px !important");
					this.$.drawer.$.items.$.AlterNumber.$.alternativeNumberPopup.applyStyle("left",x+"px !important;");
					this.$.drawer.$.items.$.AlterNumber.setIsShowAlter(true);
					this.$.drawer.$.items.$.AlterNumber.setAttribute("title", htmlEscape(jQuery.i18n
							.prop("cgc.tooltip.altnumber.hide")));
				}
			}
		}
	},
	callMeNow : function(inSender, inEvent) {

		var callMeNumber = inEvent.dialno;
		if ( isCallMeDailed == false && callMeNumber.trim() != "") {
			isCallMeDailed = true;
			var pathArray = window.location.pathname.split('/');
			$.post(urls.callMeNowServletUrl, {
				bridgeId : window.cgcProfile.confBridgeId,
				leaderBWUserId : window.cgcProfile.broadworksId,
				phoneNumber : callMeNumber,
				conferenceId : window.cgcProfile.confId,
				confType : window.cgcProfile.confType
				
			}, function(data, textStatus, jqXHR) {
				
				
				var xmlDoc = Strophe.xmlHtmlNode(data);
				responseType = xmlDoc.firstChild.getAttribute("xsi:type");
				if(responseType == "oci:ErrorResponse"){
					errorCode = xmlDoc.firstChild.childNodes[2].innerHTML;
					isCallMeDailed = false;
					if(errorCode == "111213"){
						errorMessage("cgc.error.callme.outdial.disabled",
								window.cgcProfile.conferenceDetailedInformation);
					}
					else if(errorCode == "110873"){
						errorMessage("cgc.error.callme.invalid.conference",
								window.cgcProfile.conferenceDetailedInformation);
					}
					else{
						errorMessage("cgc.error.callme",
							window.cgcProfile.conferenceDetailedInformation);
					}
				}
				
				
				isCallMeDailed = false;
				console.log("Success Response in Call Me Now Option "+callMeNumber);
				BoshSession.sendOnCallPresenceStatus(callMeNumber);
			}).fail(
					function(jqXHR, textStatus, errorThrown) {
						isCallMeDailed = false;
						errorMessage("cgc.error.callme",
								window.cgcProfile.conferenceDetailedInformation);
					});
		}
	},    
    hide:function(){
    	this.$.applyStyle("visibility", "hidden");
    },
    setActive:function(isActive){
    	this.$.drawer.setActive(isActive);
    }
});



enyo.kind({
    name: "kind.cgc.com.broadsoft.DesktopShareWidget",
    desktopShareAccess : "viewonly",
    components: [
        {
        	kind: "kind.cgc.com.broadsoft.DesktopShareDrawer",
        	name:"desktopShareDrawer"
        },
        {kind: "Signals", onShareStatusChangeSignal: "shareStatusChange"},
        {kind: "Signals", onShareStartStopSignal: "desktopShareStartStop"},
        {kind: "Signals", onDesktopShareAccessSignal: "desktopShareAccessChange"}

    ],
    rendered : function() {
    	this.setShowing(isShowDesktopSharePanel());
    	this.$.desktopShareDrawer.setShowing(isShowDesktopSharePanel());
    	if(!isShowDesktopSharePanel()) {
    		this.$.desktopShareDrawer.hideDesktopSharePanel();
    		return;
    	} else {
			this.$.desktopShareDrawer.showDesktopSharePanel();
		}
    	
    	this.desktopSharePanelRender(this.desktopShareAccess);
		if(!this.$.desktopShareDrawer.$.desktopShareItems.$.desktopShareComp){
			this.$.desktopShareDrawer.addElement({ kind:"kind.cgc.com.broadsoft.desktopShare",name :"desktopShareComp"});
		}
		
		this.$.desktopShareDrawer.render();
	},
    
	shareStatusChange: function(inSender, inEvent) {
    	
    	var shareStatus = inEvent.shareStatus;
    	if(shareStatus == "play") {
    		window.cgcComponent.basePanel.removeScreenSharePanel();
    		this.$.desktopShareDrawer.setTitle(htmlEscape(jQuery.i18n
    				.prop("cgc.label.desktopShare.sharing.link"))); 
    		
    	} else if(shareStatus == "pause") {
    		this.$.desktopShareDrawer.setTitle(htmlEscape(jQuery.i18n
    				.prop("cgc.label.desktopShare.paused.link")));
    		
    	} else if(shareStatus == "resume") {
    		this.$.desktopShareDrawer.setTitle(htmlEscape(jQuery.i18n
    				.prop("cgc.label.desktopShare.sharing.link")));
    		
    	} else {
    		if(this.desktopShareAccess == "ready") {
	    		this.$.desktopShareDrawer.setTitle(htmlEscape(jQuery.i18n
	    				.prop("cgc.label.desktopShare.notsharing.link"))); 
    		} else {
    			this.$.desktopShareDrawer.setTitle(htmlEscape(jQuery.i18n
        				.prop("cgc.label.desktopShare.viewonly.link")));
    		}
    	}
    	
    },
    
    desktopShareAccessChange: function(inSender, inEvent) {
    	
    	var access = inEvent.access;
    	if(access) {
    		this.desktopShareAccess = "ready";
    	} else {
    		this.desktopShareAccess = "viewonly";
    	}
    	this.desktopSharePanelRender(this.desktopShareAccess);
    	
    },
    desktopSharePanelRender: function(desktopShareAccess) {
    	if(desktopShareAccess == "ready") {
    		this.$.desktopShareDrawer.setTitle(htmlEscape(jQuery.i18n
    				.prop("cgc.label.desktopShare.notsharing.link")));
    		this.$.desktopShareDrawer.enableDesktopSharePanel();
    	} else {

			enyo.Signals.send("onSharePopupDisplay",
	                {popupDisplay: "hide"}
    			);
			if(document.getElementById("cgcframe") != null) {
				document.getElementById("cgcframe").contentWindow.postMessage({ requestFrom: "collaborate", requestReason : "endShare", extensionId : window.cgcConfig.desktopShareExtId}, "*");
			}
    		this.$.desktopShareDrawer.disableDesktopSharePanel();
    		this.$.desktopShareDrawer.setTitle(htmlEscape(jQuery.i18n
    				.prop("cgc.label.desktopShare.viewonly.link")));
    	}
    	enyo.Signals.send("layoutRefresh");
    },
    
    desktopShareStartStop : function(inSender, inEvent) {
    	console.log("leftpanel:desktopshareStartStop:"+inEvent.desktopShare);
    	if(inEvent.desktopShare == "start") {
    		if(this.$.desktopShareDrawer.$.desktopShareItems.$.desktopShareComp != null) {
    			this.$.desktopShareDrawer.$.desktopShareItems.$.desktopShareComp.onDesktopShareStart();
    		}
    	} else if(inEvent.desktopShare == "stop") {
    		if(this.$.desktopShareDrawer.$.desktopShareItems.$.desktopShareComp != null) {
    			this.$.desktopShareDrawer.$.desktopShareItems.$.desktopShareComp.onDesktopShareEnd();
    		}
    	}
    }
});


enyo.kind({
    name: "kind.cgc.com.broadsoft.desktopShare",
    kind: "enyo.FittableRows",
    classes : "cgcDesktopSharePanel",
    shareStatus : "end",
    listenersAdded : false,
    components: [
        
        {
          layoutKind : "FittableColumnsLayout", 
          components:[
                      
	          {kind: "enyo.Button", name: "startShareButton", classes:"cgcDesktopShareImgButton desktopShareButtonInactiveBackground", 
    				components: [ {kind: "enyo.Image", name: "playPauseBtnImg", src: "branding/assets/play.svg"}],
	    		ontap: "startDesktopShare", onmouseover: "playButtonHover", onmouseout: "playButtonHoverFade"},
	    		
	 	      {tag : "div",
	    		style : "line-height:48px;width:30px;vertical-align:middle;"},
	 
	          {kind: "enyo.Button", name: "endShareButton", classes:"cgcDesktopShareImgButton desktopShareButtonInactiveBackground desktopShareStopButtonDisabled", disabled:true,
	    			components: [ {kind: "enyo.Image", name: "stopBtnImg", src: "branding/assets/stop.svg"} ],
	 	    	ontap: "endDesktopShare", onmouseover: "stopButtonHover", onmouseout: "stopButtonHoverFade"},
	 	    	
		      {name: "shareConfirmPopup", kind: "enyo.Popup", floating: true, centered: true,
				classes: "bsftPopup cgcDesktopSharePopup", onHide: "popupHidden", 
				components: [
				             {
				            	 tag:"div", 
				            	 classes : "cgcDesktopSharePopupText", 
				            	 name:"guestShareConfirmPopupText", 
				            	 id:"guestShareConfirmPopupText",
				            	 allowHtml:true, 
				            	 content:htmlEscape(jQuery.i18n
				         				.prop("cgc.info.uss.screenshare.guestinterrupt.confirm"))
				             } ,
				             {
				            	tag : "br" 
				             },
				             {tag : "div",
	        	    	    		style : "height:7px;width:15px;vertical-align:middle;"},
				        {layoutKind : "FittableColumnsLayout",
        	            	style : "text-align:center;",
				        	components:[
				        	            {kind: "enyo.Button", name: "ConfirmShare", 
				        	            	content: htmlEscape(jQuery.i18n
							         				.prop("cgc.label.desktopShare.confirm.share")) ,
				        	            	ontap: "processDesktopShare", classes:"cgcDesktopSharePopupButton bsftPopupActiveButton"},
				        	            	 {tag : "div",
				        	    	    		style : "line-height:48px;width:15px;vertical-align:middle;"},
				        	            	{kind: "enyo.Button", name: "CancelShare", 
				        	            		content: htmlEscape(jQuery.i18n
								         				.prop("cgc.label.desktopShare.confirm.cancel")) ,
				        	            		ontap: "cancelDesktopShare", classes:"cgcDesktopSharePopupButton bsftPopupInactiveButton"}
				        
				        ]}
				]
			  }	,
		      {kind: "Signals", onSharePopupDisplay: "sharePopupDisplay"}
	        	
          ]}
    ],
    sharePopupDisplay: function(inSender, inEvent) {
	    	
	    var popupDisplay = inEvent.popupDisplay;
	    if( this.$.shareConfirmPopup != null ) {
	    	if(popupDisplay == "show") {
	    		this.$.shareConfirmPopup.show();
	    		this.$.shareConfirmPopup.addClass("cgcDesktopSharePopup");
	    	} else {
	    		this.$.shareConfirmPopup.hide();
	    		this.$.shareConfirmPopup.removeClass("cgcDesktopSharePopup");
	    	}
	    	
	    }
	 },
    playButtonHover : function() {
    	if(this.shareStatus == "end") {
    		this.$.playPauseBtnImg.setSrc("branding/assets/play_i_h.svg");
    	} 
	},
	playButtonHoverFade : function() {
    	if(this.shareStatus == "end") {
    		this.$.playPauseBtnImg.setSrc("branding/assets/play.svg");
    	} 
	},
	stopButtonHover : function() {
		if(this.shareStatus != "end") {
			this.$.stopBtnImg.setSrc("branding/assets/stop_i_h.svg");
		}
	},
	stopButtonHoverFade : function() {
		if(this.shareStatus != "end") {
			this.$.stopBtnImg.setSrc("branding/assets/stop.svg");
		}
	},
    onDesktopShareStart : function() {
    	
		this.$.endShareButton.set("disabled", false);
		this.$.startShareButton.removeClass("desktopShareButtonInactiveBackground");
		this.$.startShareButton.addClass("desktopShareButtonActiveBackground");
		this.$.endShareButton.removeClass("desktopShareStopButtonDisabled");
			
		enyo.Signals.send("onShareStatusChangeSignal",
	                {shareStatus: "play"}
	        );
			
		this.$.playPauseBtnImg.setSrc("branding/assets/pause.svg");
		this.$.stopBtnImg.setSrc("branding/assets/stop.svg");
		this.shareStatus = "play";
    	
    },
	processDesktopShare : function() {
		
		enyo.Signals.send("onSharePopupDisplay",
                {popupDisplay: "hide"}
			);
		console.log('leftpanel:current shareStatus::'+this.shareStatus);
		if(this.shareStatus == "end") {
			
			window.cgcComponent.xmppInterface.startDesktopShare();
		
		} else if(this.shareStatus == "play" || this.shareStatus == "resume") {
			
			pauseDesktopShare();
			enyo.Signals.send("onShareStatusChangeSignal",
	                {shareStatus: "pause"}
	        );
			
			this.$.playPauseBtnImg.setSrc("branding/assets/play_a.svg");
			this.$.stopBtnImg.setSrc("branding/assets/stop.svg");
			this.shareStatus = "pause";
			
		} else {
			
			resumeDesktopShare();
			enyo.Signals.send("onShareStatusChangeSignal",
	                {shareStatus: "resume"}
	        );
			
			this.$.playPauseBtnImg.setSrc("branding/assets/pause.svg");
			this.$.stopBtnImg.setSrc("branding/assets/stop.svg");
			this.shareStatus = "resume";
		}
		
		
	},
	startDesktopShare  : function(){
		
		var desktopShareFrame = document.getElementById("cgcframe");
		if(desktopShareFrame == null) {
			desktopShareFrame = document.createElement("iframe");
			desktopShareFrame.id = "cgcframe";
			desktopShareFrame.src="./cgcframe.jsp";
			desktopShareFrame.style.display = "none";
			desktopShareFrame.width=0;
			desktopShareFrame.height=0;
			document.body.appendChild(desktopShareFrame);
		}
		
		var desktopShareFrameWindow = desktopShareFrame.contentWindow;
		
		if(!this.listenersAdded) {
			console.log('leftpanel: iFrame Listeners to be added');
			var self = this;
			window.addEventListener('message', function (event) {
			    console.log("leftpanel :: iframe response : " + event.data.response);
			    
			    if(event.data.responseFrom == "cgcframe") {
			    	if(event.data.response == "frameReady") {
			    		desktopShareFrameWindow.postMessage({ requestFrom: "collaborate", requestReason : "isExtensionInstalled", extensionId : window.cgcConfig.desktopShareExtId}, "*");
			    	} else if(event.data.response == "extensionInstalled") {
			    	
			    		enyo.Signals.send("onSharePopupDisplay",
				                {popupDisplay: "show"}
			    			);
						console.log('Start desktop share process');
						
			    	} else if(event.data.response == "extensionNotInstalled") {
			    		console.log('Extension is not present');
						enyo.Signals.send("onChatInfoMessage", {
								message : htmlEscape(jQuery.i18n.prop("cgc.info.uss.screenshare.installextension", 
										jQuery.i18n.prop("cgc.label.app.title"),
					    				"https://chrome.google.com/webstore/detail/"+window.cgcConfig.desktopShareExtId)),
								avatar  : false
							});
			    	}
			    	
			    }
			    
			});
			
			this.listenersAdded = true;
		}
		
		if(this.shareStatus == "end") {
			console.log('leftpanel:iFrame is to be refreshed');
			desktopShareFrame.src = "./cgcframe.jsp";
		} else {
			this.processDesktopShare();
		}
		
	},
	cancelDesktopShare  : function(){
		enyo.Signals.send("onSharePopupDisplay",
                {popupDisplay: "hide"}
			);
		this.endDesktopShare();
	},
	onDesktopShareEnd : function() {
		
		this.shareStatus = "end";
		enyo.Signals.send("onShareStatusChangeSignal",
                {shareStatus: "end"}
			);
		
		
		this.$.startShareButton.removeClass("desktopShareButtonActiveBackground");
		this.$.startShareButton.addClass("desktopShareButtonInactiveBackground");
		this.$.endShareButton.addClass("desktopShareStopButtonDisabled");
		this.$.playPauseBtnImg.setSrc("branding/assets/play.svg");
		this.$.endShareButton.set("disabled", true);

	},
	endDesktopShare:function() {
		endDesktopShare();
	}

});



enyo.kind({
	name: "onyx.custom.TabBar",
	kind: "onyx.RadioGroup",
	controlClasses: "onyx-tabbutton",
	
	adjustChildren: function () {
		var children = this.getControls();
		var elWidth = (this.getBounds()).width/children.length;
		for (var i=0;i<children.length;i++) {
			var b = children[i].getBounds();
            // width is computed this way so that we can divide 
            // uneven amounts of space (like, say 577px divided
            // into 5 tabs)
			var w = Math.floor(elWidth*(i+1)) - Math.floor(elWidth*i);
			b.width = (w-1)+"px";
			b.height = "37px";
			children[i].setBounds(b);
		}
	},
	
	reflow: function () {
		this.inherited(arguments);
		this.adjustChildren();
	},
	
	rendered: function () {
		this.inherited(arguments);
		this.adjustChildren();
	},
	
	create: function () {
		this.inherited(arguments);
		this.adjustChildren();
	}
});

enyo.kind({
    name: "kind.cgc.com.broadsoft.TabNavigator",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [
        {tag:"div",classes:"cgcLeftNavicationHeader",
        	components:[{name:"tabBar",classes:"cgcLeftNavicationContent", kind: "onyx.custom.TabBar",  components: [
            {name : "radioButton",
            	allowHtml:true,
            	content: htmlEscape(jQuery.i18n
					.prop("cgc.label.participants")) , 
					classes:"cgcNavigationButton", 
					active: true, index: 0, 
					ontap: "switchTabs"
						}],
        
        switchTabs: function (inSender, inResponse) {
        	this.owner.owner.$.tabNavigator.switchTabs(inSender, inResponse);
        	}
        	}]
        },
        {
        	name: "AppViews", 
        	kind: "Panels", 
        	style : "width: 100%;height:100%", 
        	fit: true,
        	draggable: false,
        	components: [{
		     		name : "participantContent",
		    		kind : "enyo.FittableRows",
		    		classes: "cgcParticipantContent",
		    		components : [{
			     		name : "userHeader",
			    		kind : "enyo.FittableColumns",
			    		classes : "cgcParticipantYou",
			    		components : [
								{
									tag : "div",
									style : "line-height:48px;width:35px;vertical-align-middle;",
									components : [{
										tag : "img",
										name : "Avatar",
										style : "height:35px;width:35px;vertical-align-middle;",
										showing : false
									}]
									
								},{
			    			kind : "enyo.FittableColumns",
			    			style : "display: inline-table;",
			    			components:[{
				    			tag : "div",
				    			classes:"cgcGuestProfile",
				    			allowHtml : true,
				    			attributes : {
				    				title : ""
				    			},
				    			rendered : function() {
									this.setContent(window.cgcProfile.firstName+" "+window.cgcProfile.lastName);
									var namelength = window.cgcProfile.firstName.length+window.cgcProfile.lastName.length;
									if(namelength > 35){
										this.setAttribute("title",window.cgcProfile.firstName+" "+window.cgcProfile.lastName);
									}
								}
				    		},{
				    			tag : "div",
				    			classes:"cgcGuestYou",
				    			allowHtml : true,
				    			rendered : function() {
									this.setContent("( " + jQuery.i18n.prop(
											"cgc.label.you") + " )");
								}
				    		}]
			    		}]
		    		},
		        {
		    		kind : "enyo.Scroller",
		    		name : "contactItems",
		    		ontap:"setScrollofParicipants",
		    		components : [],
		    		autoScroll : function() {
		    			if(window.navigator.platform.toLowerCase().indexOf('mac') !== -1){
		    				this.addClass("cgcContactPanelMac");
		    			}else{
		    				this.addClass("scrollbar-inner");
		    				this.addClass("cgcContactPanelNonMac");
		    			}
		    			this.applyStyle("height",(getHeight(this.owner.id)-87)+"px");
		    			window.heightOfParticipantsDiv = this.id;
		    			var scroller = document.getElementById(window.heightOfParticipantsDiv);
		    			if(scroller != null){
		    				
		    				var height = scroller.scrollHeight - $(scroller).height();
		    				$("#"+window.heightOfParticipantsDiv).scrollTop( height );
		    				window.heightOfParticipantsPanel = getHeight(this.owner.id);
		    				window.participantsCustomScrollar = jQuery('.scrollbar-inner').scrollbar();
		    				window.participantsCustomScrollar.setScrollCurrentPosition(height);
		    			}
		    		}
		    	}]
			},
            {
				name:"ChatContainer",
				classes:"cgcChatContainer",
				tag:"div"
			}
        ]}
    ],
	setScrollofParicipants : function(inSender, inEvent){
		window.isChatPanel = false;
		window.isParicipantsPanel = true;
	},
    
    switchTabs: function (inSender, inResponse) {
    	var children = this.owner.$.tabNavigator.$.tabBar.getControls();
    	if(children.length == 2){
	    	if(inResponse.originator.index == 1){
	    		window.cgcComponent.basePanel.setIsViewableChat(true);
	    		
	    		if(this.owner.$.tabNavigator.$.radioButton){
	    			this.owner.$.tabNavigator.$.radioButton.removeClass("cgcActive");
	    			this.owner.$.tabNavigator.$.radioButton.addClass("cgcDeactive");
	    		}
	    		if(this.owner.$.tabNavigator.$.tabBar.$.radioButton){
	    			this.owner.$.tabNavigator.$.tabBar.$.radioButton.removeClass("cgcDeactive");
	    			this.owner.$.tabNavigator.$.tabBar.$.radioButton.addClass("cgcActive");
	    			
	    		}
	    		window.cgcComponent.basePanel.$.cgcRightPanel.hidePopup();
	    	}else{
	    		if(this.owner.$.tabNavigator.$.radioButton){
	    			this.owner.$.tabNavigator.$.radioButton.addClass("cgcActive");
	    			this.owner.$.tabNavigator.$.radioButton.removeClass("cgcDeactive");
	    		}
	    		if(this.owner.$.tabNavigator.$.tabBar.$.radioButton){
	    			this.owner.$.tabNavigator.$.tabBar.$.radioButton.addClass("cgcDeactive");
	    			this.owner.$.tabNavigator.$.tabBar.$.radioButton.removeClass("cgcActive");
	    			
	    		}
	    		window.cgcComponent.basePanel.setIsViewableChat(false);
	    	}
	    	if(inResponse.originator.index == 1){
	    		window.cgcComponent.basePanel.setIsViewableChat(true);
	    	}else{
	    		window.cgcComponent.basePanel.setIsViewableChat(false);
	    	}
	    	
    	}
        this.$.AppViews.setIndex(inResponse.originator.index);
    }
});

//participant record
enyo.kind({
	
	layoutKind : "FittableColumnsLayout",
	name : "kind.com.broadsoft.cgc.RosterItem",
	
	classes : "cgcParticipantDetails",
	components : [ {
		tag : "div",
		style : "line-height:48px;width:35px;vertical-align:middle;",
		components : [{
			tag : "img",
			name : "Avatar",
			style : "height:35px;width:35px;vertical-align:middle",
			showing : false
		}]
		
	},{
		king :"enyo.FittableColumns",
		
		fit : true,
		components : [ {
			tag : "div",
			name : "RosterName",
			allowHtml : true,
			classes : "cgcParticipantRecord",
			attributes : {
				title : ""
			}
		},{
			tag : "div",
			name : "RosterRole",
			classes :"cgcGuestRole",
			allowHtml : true
		} ]
	} ],
	updateImage : function(img) {
		if(img != null){
			this.$.Avatar.setSrc(img);
			this.$.Avatar.setShowing(true);
		}
	}
});


enyo.kind({
	name : "kind.com.broadsoft.cgc.VideoPanel",
	kind : "onyx.Item",
	allowHtml : true
});

enyo.kind({
	tag : "img",
	name : "kind.com.broadsoft.cgc.Image",
	style : "margin-top:auto !important;margin-bottom:auto !important;",
})


enyo.kind({
	name : "kind.com.broadsoft.cgc.CustomButtonWidget",
	tag : "div",

	published:{
		isActivated : false,
		deactiveDefaultClass : "",
		deactiveHOverImage : "",

		deactiveHOverClass : "",
		deactiveDefaultImage : "",
		
		deactiveOnPressClass : "",
		deactiveOnPressImage : "",
		
		activeDefaultClass : "",
		activeDefaultImage : "",
		
		activeHOverClass : "",
		activeHOverImage : "",
		
		activeOnPressClass : "",
		activeOnPressImage : "",
		defaultClass       : "cgcConnectorButton",	
		componentClasses : "",

		imageComp : undefined,
		compName : "",
	},
	create : function() {
		this.inherited(arguments);
		this.addClass(this.getDefaultClass());
		this.$.compName.addClass(this.getComponentClasses());
		this.$.compName.setSrc(this.getDeactiveDefaultImage());
		this.setShowing(isViewWebrtc());
		this.reset();
	},
	components : [ {
		kind : "onyx.Item",
		style : "width:100%;padding: 0px;vertical-align: middle;text-align: center;",
		events: {
			onmouseover : "hOverAction",
			onmouseout : "onOutAction",
			onmousedown:"onClickDown",
			onmouseup:"onClickUp"
		 },
		components : [ {
			tag : "img",
			name : "compName",
			style:"vertical-align: middle;text-align: center;max-height:22px;max-width:22px",
			src : ""
				
		} ]
	}]
	,
	reset : function(inSender, inEvent) {
		this.removeAllClasses();
		this.addClass(this.getDefaultClass());
		if(this.getIsActivated()){
			if(!isNullOrEmpty(this.getActiveDefaultClass())){
				this.addClass(this.getActiveDefaultClass());
			}else{
				this.addClass(this.getDeactiveDefaultClass());
			}
			if(!isNullOrEmpty(this.getActiveDefaultImage())){
				this.$.compName.setSrc(this.getActiveDefaultImage());
			}else{
				this.$.compName.setSrc(this.getDeactiveDefaultImage());
			}
		}else{
			this.addClass(this.getDeactiveDefaultClass());
			this.$.compName.setSrc(this.getDeactiveDefaultImage());
		}
	},
	setActivate : function(flag){
		this.setIsActivated(flag);
		this.reset();
	},
	removeAllClasses : function(){
		this.removeClass(this.getActiveDefaultClass());
		this.removeClass(this.getDeactiveDefaultClass());
		this.removeClass(this.getActiveHOverClass());
		this.removeClass(this.getDeactiveHOverClass());
		this.removeClass(this.getActiveOnPressClass());
		this.removeClass(this.getDeactiveOnPressClass());
	},
	hOverAction : function(inSender, inEvent) {
		this.removeAllClasses();
		if(this.getIsActivated()){
			if(!isNullOrEmpty(this.getActiveHOverClass()))
				this.addClass(this.getActiveHOverClass());
			if(!isNullOrEmpty(this.getActiveHOverImage()))
				this.$.compName.setSrc(this.getActiveHOverImage());
			
		}else{
			if(!isNullOrEmpty(this.getDeactiveHOverClass()))
				this.addClass(this.getDeactiveHOverClass());
			if(!isNullOrEmpty(this.getDeactiveHOverImage()))
				this.$.compName.setSrc(this.getDeactiveHOverImage());
			
		}
	},
	onOutAction : function(inSender, inEvent) {
		this.removeAllClasses();
		if(this.getIsActivated()){
			if(!isNullOrEmpty(this.getActiveDefaultClass()))
				this.addClass(this.getActiveDefaultClass());
			if(!isNullOrEmpty(this.getActiveDefaultImage()))
				this.$.compName.setSrc(this.getActiveDefaultImage());
		}else{
			if(!isNullOrEmpty(this.getDeactiveDefaultClass()))
				this.addClass(this.getDeactiveDefaultClass());
			if(!isNullOrEmpty(this.getDeactiveDefaultImage()))
				this.$.compName.setSrc(this.getDeactiveDefaultImage());
		}
	},
	onClickDown : function(inSender, inEvent) {
		this.removeAllClasses();
		
		if(this.getIsActivated()){
			if(!isNullOrEmpty(this.getActiveOnPressClass()))
				this.addClass(this.getActiveOnPressClass());
			if(!isNullOrEmpty(this.getActiveOnPressImage()))
				this.$.compName.setSrc(this.getActiveOnPressImage());
		}else{
			if(!isNullOrEmpty(this.getDeactiveOnPressClass()))
				this.addClass(this.getDeactiveOnPressClass());
			if(!isNullOrEmpty(this.getDeactiveOnPressImage()))
				this.$.compName.setSrc(this.getDeactiveOnPressImage());
		}
	},
	onClickUp : function(inSender, inEvent) {
		this.removeAllClasses();
		if(this.getIsActivated()){
			if(!isNullOrEmpty(this.getActiveDefaultClass()))
				this.addClass(this.getActiveDefaultClass());
			if(!isNullOrEmpty(this.getActiveDefaultImage()))
				this.$.compName.setSrc(this.getActiveDefaultImage());
		}else{
			if(!isNullOrEmpty(this.getDeactiveDefaultClass()))
				this.addClass(this.getDeactiveDefaultClass());
			if(!isNullOrEmpty(this.getDeactiveDefaultImage()))
				this.$.compName.setSrc(this.getDeactiveDefaultImage());
		}
	}
});

enyo.kind({
	name : "kind.com.broadsoft.cgc.ButtonWidget",
	kind : "onyx.Item",
	create : function() {
		this.inherited(arguments);
		this.setShowing(isViewWebrtc());
	}
});



enyo
		.kind({
			name : "kind.com.broadsoft.cgc.ConferenceWidget",
			kind : "onyx.Item",
			classes : "cgcConferencePanel",
			layoutKind : "FittableRowsLayout",
			rendered:function(){
				this.inherited(arguments);
				this.$.connectorPanel.setShowing(isViewWebrtc());
			},
			components : [
				{
					kind : "enyo.Signals",
					name : "conferenceViewsignal",
					onConfDisco : "showConferencePanel", // When conference Information is available
					
				},
				{
					kind : "enyo.FittableColumns",
					fit : true,
					classes : "cgcWebRTCPanel",
					name : "connectorPanel",
					components : [
					              {

										name : "webrtcButtonEnd",
										kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
										ontap : "goForWebRTCEnd",
										classes : "cgcConnectorButton cgcHide ",
										
										rendered : function() {
											this.setShowing(isViewWebrtc() && !window.cgcComponent.basePanel.getIsWebRTCSessionInitated());
										},
										attributes : {
											title : htmlEscape(jQuery.i18n
													.prop("cgc.tooltip.end"))
										},
										isActivated : false,
										activeDefaultClass : "cgcEndActive",
										activeHOverClass : "cgcEndHover",
										activeOnPressClass : "cgcEndPress",
										componentClasses : "",
										activeDefaultImage : "branding/assets/end_a.svg",
										activeHOverImage : "branding/assets/end_a_h.svg",
										activeOnPressImage : "branding/assets/end_a_h.svg",
										imageComp : undefined,
										compName : "endIcon",  
					              },
									{
										name : "webrtcButtonAudio",
										kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
										ontap : "goForWebRTCAudio",
										
										rendered : function() {
											this.setShowing(isViewWebrtc() && !window.cgcComponent.basePanel.getIsWebRTCSessionInitated());
										},
										attributes : {
											title : htmlEscape(jQuery.i18n
													.prop("cgc.tooltip.audio"))
										},
										isActivated : false,
										deactiveDefaultClass : "cgcAudio",
										deactiveDefaultImage : "branding/assets/audio_i.svg",
										
										deactiveHOverClass : "cgcAudioHover",
										deactiveHOverImage : "branding/assets/audio_i_h.svg",
										
										deactiveOnPressClass : "cgcAudioPress",
										deactiveOnPressImage : "branding/assets/audio_i_h.svg",	
										
										componentClasses : "",
										
															
										imageComp : undefined,
										compName : "audioIcon",
									},
									{

										name : "webrtcButtonVideo",
										published : {
											isConnected : false,
											isSelfView : true
										},
										kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
										ontap : "goForWebRTCVideo",
									
										rendered : function() {
											this.setShowing(window.cgcConfig.webRTCVideoEnabled && isViewWebrtc());
										},
										attributes : {
											title : htmlEscape(jQuery.i18n
													.prop("cgc.tooltip.video"))
										},
										isActivated : false,
										activeDefaultClass : "cgcVideoOn",
										deactiveDefaultClass : "cgcVideoOff",
										activeHOverClass : "cgcVideoOnHover",
										deactiveHOverClass : "cgcVideoOffHover",
										activeOnPressClass : "cgcVideoOnPress",
										deactiveOnPressClass : "cgcVideoOffPress",
										componentClasses : "",
										activeDefaultImage : "branding/assets/video_a.svg",
										deactiveDefaultImage : "branding/assets/video_i.svg",
										activeHOverImage : "branding/assets/video_a_h.svg",
										deactiveHOverImage : "branding/assets/video_i_h.svg",
										activeOnPressImage : "branding/assets/video_a_h.svg",
										deactiveOnPressImage : "branding/assets/video_i_h.svg",
										imageComp : undefined,
										compName : "videoIcon",
									
									},
									{
										name : "webrtcButtonMute",
										kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
										ontap : "goForWebRTCMute",
										classes : "cgcConnectorButton goForWebRTCMute",
										
										rendered : function() {
											this.setShowing(isViewWebrtc());
										},
										attributes : {
											title : htmlEscape(jQuery.i18n
													.prop("cgc.tooltip.mute"))
										},
										isActivated : false,
										activeDefaultClass : "cgcMuteOn",
										deactiveDefaultClass : "cgcMuteOff",
										activeHOverClass : "cgcMuteOnHover",
										deactiveHOverClass : "cgcMuteOff",
										activeOnPressClass : "cgcMuteOnPress",
										deactiveOnPressClass : "cgcMuteOff",
										componentClasses : "",
										activeDefaultImage : "branding/assets/mute_a.svg",
										deactiveDefaultImage : "branding/assets/mute_i.svg",
										activeHOverImage : "branding/assets/mute_a_h.svg",
										deactiveHOverImage : "branding/assets/mute_i.svg",
										activeOnPressImage : "branding/assets/mute_a_h.svg",
										deactiveOnPressImage : "branding/assets/mute_i.svg",
										imageComp : undefined,
										compName : "muteIcon",
									}]
				},{
				    name: "alternateDialInOptionWidget",
				    kind: "kind.cgc.com.broadsoft.AlternateDialInOptionWidget",
				}
			],
			showConferencePanel: function(){
				
				if(isViewWebrtc()){
					this.$.connectorPanel.applyStyle("display","");
					
				}
				this.$.alternateDialInOptionWidget.applyStyle("display","");
				this.render();
				//
			},
			goForWebRTCVideo : function(inSender, inEvent) {
				cgcCallMeNumberText = "";
				//if go to webrtc call, callme type content will be clear 
				if (!isViewWebrtc()) {
					return;
				}
				if (this.$.webrtcButtonVideo.getIsConnected()) {
					this.$.webrtcButtonVideo.setIsConnected(false);
					window.cgcComponent.basePanel.startWebRTCVideo(false);
					isVideoActivated = false;
//					this.onOutVideoButtonChange();
				} else {
					this.$.webrtcButtonVideo.setIsConnected(true);
					window.cgcComponent.basePanel.startWebRTCVideo(true);
					isVideoActivated = true;
				}
				
			},
			// Audio can be clicked only to start the WebRTC in audio mode.
			// After the WebRTC session is started, audio button is hidden.
			goForWebRTCAudio : function(inSender, inEvent) {
				cgcCallMeNumberText = "";
				try {
				//if go to webrtc call, callme type content will be clear 
				// Don't do ui thing here
				if (!isViewWebrtc()) {
					return;
				}
				window.cgcComponent.basePanel.startWebRTCVideo(false);
				isAudioActivated = true;
				}
				catch(err) {
					if(err.stack)
				   console.log(err.stack);
				}
			},
			goForWebRTCMute : function(inSender, inEvent) {
				cgcCallMeNumberText = "";
				window.cgcComponent.basePanel.muteWebRTC();
			},
			goForWebRTCSelfView : function(inSender, inEvent) {
				cgcCallMeNumberText = "";
				if(window.cgcComponent.webrtcPanel){
					window.cgcComponent.webrtcPanel.goSelfVeiw(!this.$.webrtcButtonVideo.getIsSelfView());
				}
				if(this.$.webrtcButtonVideo.getIsSelfView()){
					
					$('.localVideo').addClass("cgcHide");
					this.$.webrtcButtonVideo.setIsSelfView(false);
				}else{
					
					$('.localVideo').removeClass("cgcHide");
					this.$.webrtcButtonVideo.setIsSelfView(true);
				}
				
			},
			goForWebRTCEnd : function(inSender, inEvent) {
				cgcCallMeNumberText = "";
				window.cgcComponent.basePanel.setIsEndWebRTCRequested(true);
				window.endWebRTCRequested = true;
				this.$.webrtcButtonVideo.setIsConnected(false);
				window.cgcComponent.basePanel.endWebRTC();
				isVideoActivated = false;
				isAudioActivated = false;
			},
			onStartWebRTC : function(isVideo) {
				cgcCallMeNumberText = "";
				if (isVideo) {
					this.$.webrtcButtonVideo.setIsConnected(true);
					this.$.webrtcButtonVideo.setAttribute("title", htmlEscape(jQuery.i18n
							.prop("cgc.tooltip.audio")));
					this.$.webrtcButtonVideo.setActivate(true);
					isVideoActivated = true;
				}
				this.$.webrtcButtonMute.setDeactiveHOverImage("branding/assets/mute_i_h.svg");
				this.$.webrtcButtonMute.setDeactiveOnPressImage("branding/assets/mute_i_h.svg");
				this.$.webrtcButtonMute.setDeactiveOnPressClass("cgcMuteOffPress");
				this.$.webrtcButtonMute.setDeactiveDefaultClass("cgcMuteOff");
				this.$.webrtcButtonMute.setDeactiveHOverClass("cgcMuteOffHover");
				this.$.webrtcButtonEnd.removeClass("cgcHide");
				this.$.webrtcButtonEnd.addClass("cgcShow");
				this.$.webrtcButtonMute.setActivate(false);
				this.$.webrtcButtonEnd.setActivate(true);
				this.$.webrtcButtonAudio.setActivate(true);
				isAudioActivated = true;
				this.$.webrtcButtonAudio.hide();
				this.owner.owner.resized();
			},
			switchVideo : function() {
				cgcCallMeNumberText = "";
				this.$.webrtcButtonVideo.setAttribute("title", htmlEscape(jQuery.i18n
						.prop("cgc.tooltip.audio")));
				this.$.webrtcButtonVideo.setActivate(true);
				this.$.webrtcButtonVideo.setIsConnected(true);
				this.owner.owner.resized();
			},
			switchAudio : function() {
				cgcCallMeNumberText = "";
				this.$.webrtcButtonVideo.setAttribute("title", htmlEscape(jQuery.i18n
						.prop("cgc.tooltip.video")));
				this.$.webrtcButtonVideo.setIsConnected(false);
				this.$.webrtcButtonVideo.setActivate(false);
				this.owner.owner.resized();
			},
			goMute : function(isMute) {
				cgcCallMeNumberText = "";
				isMuted = isMute;
				
				if (isMute) {
					this.$.webrtcButtonMute.setActivate(true);
					this.$.webrtcButtonMute.setAttribute("title",
							htmlEscape(jQuery.i18n.prop("cgc.tooltip.unmute")));
				} else {
					this.$.webrtcButtonMute.setActivate(false);
					this.$.webrtcButtonMute.setAttribute("title",
							htmlEscape(jQuery.i18n.prop("cgc.tooltip.mute")));
				}
				this.owner.owner.resized();
			},
			endCall : function() {
				cgcCallMeNumberText = "";
				this.$.webrtcButtonVideo.setIsConnected(false);
				this.$.webrtcButtonEnd.addClass("cgcHide");
				this.$.webrtcButtonEnd.removeClass("cgcShow");
				this.$.webrtcButtonAudio.show();
				this.$.webrtcButtonAudio.setActivate(false);
				this.$.webrtcButtonVideo.setActivate(false);
				this.$.webrtcButtonMute.setActivate(false);
				this.$.webrtcButtonMute.setDeactiveHOverImage("branding/assets/mute_i.svg");
				this.$.webrtcButtonMute.setDeactiveOnPressImage("branding/assets/mute_i.svg");
				this.$.webrtcButtonMute.setDeactiveOnPressClass("cgcMuteOff");
				this.$.webrtcButtonMute.setDeactiveDefaultClass("cgcMuteOff");
				this.$.webrtcButtonMute.setDeactiveHOverClass("cgcMuteOff");
				
				
				this.$.webrtcButtonVideo.setIsConnected(false);
				this.$.webrtcButtonVideo.setAttribute("title", htmlEscape(jQuery.i18n
						.prop("cgc.tooltip.video")));
				this.$.webrtcButtonMute.setAttribute("title", htmlEscape(jQuery.i18n
						.prop("cgc.tooltip.mute")));
				this.$.webrtcButtonVideo.setIsSelfView(true);
				this.owner.owner.resized();
				enyo.Signals.send("layoutRefresh");
			}

		});

enyo.kind({
	name : "kind.com.broadsoft.cgc.LeftPanel",
	kind : "enyo.FittableRows",
	allowHtml : true,
	published : {
		videoWidget : undefined,
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
		classes : "cgcProfileBar",
		fit : true,
		allowHtml:true,
		rendered : function() {
			if(window.cgcProfile.name.length > 35){
				this.setAttribute("title", jQuery.i18n.prop("cgc.label.room.title",
						window.cgcProfile.name));
			}
			this.setContent(jQuery.i18n.prop("cgc.label.room.title",
					window.cgcProfile.name));
		}
	},
	{
		kind : "kind.com.broadsoft.cgc.ConferenceWidget"
	},
	{
	    name: "desktopShareWidget",
	    kind: "kind.cgc.com.broadsoft.DesktopShareWidget",
	}, 
	{
		kind : "kind.com.broadsoft.cgc.VideoPanel",
		name : "VideoPanel",
		classes : "cgcVideoPanel"
	}, 
	{
		name : "accordionItems",
		kind : "enyo.FittableRows",
		classes: "cgcAccordionItems",
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
			var accordionItemsHeight =  getHeight(this.id);
			this.owner.$.tabNavigatorBar.applyStyle("height",accordionItemsHeight+"px");
		}
	} ],
	create : function() {
		this.inherited(arguments);
		window.cgcComponent.cgcLeftPanel = this;
		for ( var item in window.cgcComponent.xmppInterface.initialRoster) {
			var contact = window.cgcComponent.xmppInterface.initialRoster[item];
			if (contact != null && contact.name) {
				this.presenceReceived("", contact);
			}

		}
		BoshSession.isJoined = true;
	},
	addItem : function(contact) {
		try{
		var name = contact.name+" "+contact.owner;
		var isAdded = false;
		var parName = "";
		if (name.length > 38) {
			parName = name;
		}
		var isNeedToAdd = true;
		var nick = contact.nick;
		var components = this.$.tabNavigator.$.contactItems.getComponents();
		for ( var comp in components) {			
			if (components[comp].getName() == nick) {
				isNeedToAdd = false;
				break;
			}
		}
		
		if(isNeedToAdd){
			contact.rosterItem = this.$.tabNavigator.$.contactItems.createComponent({
				kind : "kind.com.broadsoft.cgc.RosterItem",
				name : contact.nick
			});
//			participantsCount = participantsCount + 1;
			this.$.tabNavigator.$.contactItems.render();
			this.$.tabNavigatorBar.render();
			contact.rosterItem.$.RosterName.setContent(contact.name);
			if(contact.owner == ""){
				contact.rosterItem.$.RosterRole.setContent(contact.owner);
			} else {
				contact.rosterItem.$.RosterRole.setContent("( " + contact.owner + " )");
			}
			contact.rosterItem.$.RosterName.setAttribute("title", parName);
				var i=0;
				
				for ( ;i < window.cgcComponent.xmppInterface.backupRoster.length;i++) {
					var contactCache = window.cgcComponent.xmppInterface.backupRoster[i];
					if (contactCache != null && contactCache.resource === contact.resource) {
						isAdded = true;
						break;
					}
				}
				if(!isAdded){
					window.cgcComponent.xmppInterface.backupRoster.push(contact);
					enyo.Signals.send("onChatInfoMessage", {
						message : contact.name,
						avatar : true,
						action : htmlEscape(jQuery.i18n
								.prop("cgc.info.muc.participant.join"))
					});
					this.layoutRefresh();
				}
			}
		}
		catch(err) {
			if(err.stack)
		   console.log(err.stack);
		}
	},
	removeItem : function(nick) {
		try{
		var components = this.$.tabNavigator.$.contactItems.getComponents();
		for ( var comp in components) {			
			if (components[comp].getName() == nick) {
				components[comp].destroy();				
			}
		}
		var i=0;
		for ( ;i < window.cgcComponent.xmppInterface.backupRoster.length;i++) {
			var contact = window.cgcComponent.xmppInterface.backupRoster[i];
			if (contact != null && contact.resource === nick) {
				window.cgcComponent.xmppInterface.backupRoster.splice(i, 1);
				enyo.Signals.send("onChatInfoMessage", {
					message : contact.name,
					avatar : true,
					action : htmlEscape(jQuery.i18n
							.prop("cgc.info.muc.participant.left"))
				});
				
				if(contact.owner != "") {
					enyo.Signals.send("onDesktopShareAccessSignal", {
						access : false
					});
				}
				this.layoutRefresh();
				break;
			}

		}
		
//		participantsCount = participantsCount - 1;
		this.$.tabNavigator.$.contactItems.render();
		this.$.tabNavigatorBar.render();
		}
		catch(err) {
			if(err.stack)
		   console.log(err.stack);
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
					window.cgcComponent.xmppInterface.republishUSSRoom();
					}
				if (contact.presence == "unavailable") {
					this.removeItem(contact.nick);
				}
			}
		}
		catch(err) {
			if(err.stack)
		   console.log(err.stack);
		}
	},
	updateAvatar : function(inEvent,data) {
		try{
		var components = this.$.tabNavigator.$.contactItems.getComponents();
		var component = undefined;
		for ( var comp in components) {			
			if (components[comp].getName() == data.jid) {
				component = components[comp];
				component.updateImage(data.img);
			}
		}
		if(component){
				var contact;
				for ( i=0;i < window.cgcComponent.xmppInterface.backupRoster.length;i++) {
					contact = window.cgcComponent.xmppInterface.backupRoster[i];
					if (contact != null && contact.resource == component.getName()) {
						contact.image = data.img;
						break;
					}

				}
			}
		}
		catch(err) {
			if(err.stack)
		   console.log(err.stack);
		}
	},
	setChatPanel : function(chatPanel) {
		this.$.tabNavigator.$.tabBar.createComponent({
			content: "<div style='height: 34px;line-height: 34px;margin-left: 10px;'>"+htmlEscape(jQuery.i18n
					.prop("cgc.label.chat.chat"))+"</div>", 
			name : "radioButton",
			style:"float:left;",
			index: 1,
			allowHtml:true,
			classes:"cgcNavigationButton cgcActive", 
			active : true,
			ontap: "switchTabs"
				});
		chatPanel.setContainer(this.$.tabNavigator.$.ChatContainer);
		chatPanel.setOwner(this.$.tabNavigator.$.ChatContainer);
		
		this.$.tabNavigator.render();
		this.$.tabNavigator.$.tabBar.addClass("cgcNavigationEnabled");
		if(this.$.tabNavigator.$.radioButton){
			this.$.tabNavigator.$.radioButton.addClass("cgcDeactive");
			this.$.tabNavigator.$.radioButton.removeClass("active");
			this.$.tabNavigator.$.radioButton.removeClass("cgcActive");
		}
		
		
		this.$.tabNavigator.$.AppViews.setIndex(1);
		this.render();
		chatPanel.swapChatPanel(false);
		enyo.Signals.send("layoutRefresh");
	},
	removeChatPanel : function() {
		if(this.$.tabNavigator.$.tabBar.$.radioButton){
			this.$.tabNavigator.$.tabBar.$.radioButton.destroy();
			window.cgcComponent.basePanel.setIsViewableChat(true);
		}
		
		if(this.$.tabNavigator.$.radioButton){
			this.$.tabNavigator.$.radioButton.removeClass("cgcDeactive");
			this.$.tabNavigator.$.radioButton.addClass("active");
			this.$.tabNavigator.$.radioButton.removeClass("cgcActive");
		}
		this.$.tabNavigator.$.tabBar.removeClass("cgcNavigationEnabled");
		this.$.tabNavigator.render();
		this.$.tabNavigator.$.AppViews.setIndex(0);
		this.$.accordionItems.setIsViewChatPanel(false);

	},
	showChatPanel : function(chatPanel) {
		this.setChatPanel(chatPanel);
		// TODO try to remove applyStyle
		chatPanel.applyStyle("height", "100%");

	},
	renderChatPane : function() {
		this.$.ChatPanelContainer.render();
	},
	renderVideoPane : function() {
		this.$.VideoPanel.render();
	},
	endWebRTC : function() {
		if (this.getVideoWidget()) {
			this.getVideoWidget().destroy();
			this.setVideoWidget(undefined);
		}
	},
	prepareVideoPanel : function(isVideo) {
		var video = new kind.com.broadsoft.cgc.webrtc();
		video.setId("leftPanelWebRTC");
		

		video.setContainer(this.$.VideoPanel);
		video.setOwner(this.$.VideoPanel);
		this.setVideoWidget(video);
		if(isVideo){
			this.$.VideoPanel.applyStyle("height", "240px");
			this.$.VideoPanel.resized();
		}
		this.setVideoDisable(!isVideo);
		this.render();
	},
	showVideo : function(isVideo) {
		var videoPanel = document.getElementById("leftPanelWebRTC");
		if(videoPanel == undefined){
			this.prepareVideoPanel(isVideo);
			
		}else{
			this.setVideoDisable(!isVideo);
			this.render();
		}
		videoPanel = document.getElementById("leftPanelWebRTC");
		window.wrsclient.client.appendTo(videoPanel);
		window.wrsclient.video.updateSessionStreams();
		if(this.getVideoWidget())
		this.getVideoWidget().reloadWebRTC(true);
		enyo.Signals.send("layoutRefresh");

	},
	destroyVideoWidget : function() {
		if (this.getVideoWidget()) {
			this.getVideoWidget().destroy();
			this.setVideoWidget(undefined);

		}
	},
	setVideoDisable : function(isVideo) {
		if (this.getVideoWidget()) {
			if (!isVideo) {
				this.getVideoWidget().applyStyle("display", "inline-block");
			} else {
				this.getVideoWidget().applyStyle("display", "none");
			}
		}
		if (!isVideo) {
			this.$.VideoPanel.applyStyle("height", "100%");
		} else {
			this.$.VideoPanel.applyStyle("height", "0px");
		}
		enyo.Signals.send("layoutRefresh");
	},
	getVideoPanel : function() {
		return this.getVideoWidget();
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
	endCall : function() {
		this.$.conferenceWidget.endCall();
	},
	layoutRefresh : function(isVideo) {
		
		var webrtc = this.getVideoWidget();
		var chatpanel = this.$.tabNavigator.$.ChatContainer.$.chatPanel;
		var panelHeight = getHeight(this.owner.id);
		
			var accordionHeight = panelHeight
					- getHeight(this.$.conferenceWidget.id)
					- getHeight(this.$.VideoPanel.id)
					- getHeight(this.$.desktopShareWidget.id)- 32;
//			this.$.tabNavigatorBar.render();
			this.$.accordionItems.applyStyle("height", accordionHeight
					+ "px");
			this.$.accordionItems.render();
			this.$.tabNavigator.$.radioButton.setContent("<div style='height: 34px;line-height: 34px;margin-left: 10px;'>" + htmlEscape(jQuery.i18n
					.prop("cgc.label.participants")) +"</div> <div class='cgcParticipantsCount'>"+window.cgcComponent.xmppInterface.backupRoster.length+"</div>");
			this.$.accordionItems.layoutRefresh();
			this.$.tabNavigator.$.contactItems.autoScroll();
			
		if (chatpanel != undefined) {
			var chatpanelHeight =  getHeight(this.$.accordionItems.id)- 50;
			this.$.tabNavigator.$.ChatContainer.applyStyle("height", chatpanelHeight
					+ "px");
			this.$.tabNavigator.$.ChatContainer.render();
			chatpanel.resized();
			
			chatpanel.autoscroll();
		}
		
	}

});
