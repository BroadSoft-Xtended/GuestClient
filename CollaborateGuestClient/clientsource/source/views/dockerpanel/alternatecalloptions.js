/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

var isCallMeDailed = false;
var isAlternateDialInShow = true;

/** Call Me Now Widgent **/
enyo.kind({
    name: "kind.cgc.com.broadsoft.CallMeOption",
    kind: "enyo.FittableRows",
    classes: "cgcCallMeWidget",
    disabled: true,
    components: [
        {name: "title", tag:"div", allowHtml:true, classes:"cgcCallMeNowLabel bsftTertiaryContentText", content: htmlEscape(jQuery.i18n
				.prop("cgc.label.callmeoption"))},
        {name: "Note",  tag:"div", allowHtml:true, classes:"cgcCallMeLable bsftPrimaryContentText", content: htmlEscape(jQuery.i18n
				.prop("cgc.label.callme.hint"))},
        {layoutKind : "FittableColumnsLayout",  classes:"cgcCallMeNumberTextContainer",
          components:[
              {
            	  kind: "onyx.InputDecorator",
            	  classes:"nice-padding cgcCallMeNumberText bsftContentBackground bsftInputFieldOutline bsftInputBoxBorder",
            	  fit:true,
            	  name : "cgcCallMeNumberText",
            	  components: [{
            		  kind: "onyx.Input",
            		  name : "callMeNumberText",
            		  id: "callMeNumberText",
            		  classes : "cgcCallMeInputText bsftDimmedText bsftPrimaryContentText",
            		  onkeydown : "allowNumberBefore",
            		  onkeyup : "allowNumberAfter",
            		  placeholder: htmlEscape(jQuery.i18n.prop("cgc.label.callmenumber.hint"))
            	  }]
              },
              {kind: "onyx.Button", name: "CallMeImgNowButton", 
            	  classes:"cgcCallMeImgNowButton bsftPrimaryButton bsftPrimaryButtonReverse cgcDisabled", 
            	  content: htmlEscape(jQuery.i18n.prop("cgc.label.callme")), ontap: "callMeNow", 
            	  ondown : "onSelectCallMeNowButtonColor", onup : "onReleaseCallMeNowButtonColor",
            	  onleave : "onReleaseCallMeNowButtonColor",
            	  attributes : {
            			title : htmlEscape(jQuery.i18n.prop("cgc.label.callme"))
            		}
              }
          ]}
    ],
    
    create: function () {
		this.inherited(arguments);
		if(window.cgcProfile.dialNum && window.cgcProfile.confId){
			this.disabled = false;
		} else {
			this.setAttribute("title", htmlEscape(jQuery.i18n.prop("cgc.tooltip.callme.disabled")));
		}
	},
	rendered: function(){
		this.inherited(arguments);
		if(window.cgcProfile.dialNum && window.cgcProfile.confId){
			var thisNode = document.getElementById(this.id);
			if(thisNode){
				thisNode.removeAttribute("title");
			}
			this.disabled = false;
		}
	},
    onSelectCallMeNowButtonColor : function(inSender, inEvent) {
	},
	onReleaseCallMeNowButtonColor : function(inSender, inEvent) {
	},
    allowNumberAfter : function(inSender, inEvent) {
		if (inEvent.ctrlKey == true && inEvent.keyCode === 86) {  //After paste(Ctrl + V)
			var myString = this.$.callMeNumberText.value;
			myString = myString.replace(/[^\d +-]/g, '');
			this.$.callMeNumberText.set("value", myString);
		}
		cgcCallMeNumberText = this.$.callMeNumberText.value;
		if (cgcCallMeNumberText.length == 0){
			this.$.CallMeImgNowButton.addClass("cgcDisabled");
			this.owner.owner.owner.setActive(false);
		} else {
			this.$.CallMeImgNowButton.removeClass("cgcDisabled");
			this.owner.owner.owner.setActive(true);
		}
		
	},
	allowNumberBefore : function(inSender, inEvent) {
		if(window.cgcProfile.dialNum && window.cgcProfile.confId){
			if (inEvent.keyCode === 13) { //Enter key
				this.callMeNow(inSender);
				return true;
			}
			 if ((inEvent.shiftKey != true && inEvent.keyCode > 47 && inEvent.keyCode < 58) //0-9 without shift
				     || (inEvent.keyCode > 95 && inEvent.keyCode < 106) //numpad 0 - 9
				     || inEvent.keyCode === 46 //delete
				     || inEvent.keyCode === 8	//backspace
				     || inEvent.keyCode === 9 //tab
				     || inEvent.keyCode === 32 //space
				     || inEvent.keyCode === 37 //left arrow
				     || inEvent.keyCode === 39 //right arrow
				     || inEvent.key === "+"
				     || inEvent.key === "-"
					 || String(inEvent.key).toUpperCase() === "ADD" //Some keyboards represent the numpad +,- as Add, Subtract 
					 || String(inEvent.key).toUpperCase() === "SUBTRACT"
						  )	{ 
				     return true;
			 }
			if (inEvent.ctrlKey == true
					&& (inEvent.keyCode === 86 || inEvent.keyCode === 67 //Ctrl + A, C, V, X
							|| inEvent.keyCode === 88 || inEvent.keyCode === 65)) {
				return true;
			}
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
    	this.$.CallMeImgNowButton.addClass("cgcDisabled");
    	this.render();
    }
});

enyo.kind({tag : "div",
	name : "kind.cgc.com.broadsoft.AlterNumber",
	classes : "AlternativeExpandContainer",
	showing : false,
	published : {
		isShowAlter : false
	},
	attributes : {
		title : htmlEscape(jQuery.i18n
				.prop("cgc.tooltip.altnumber.expand"))
	},
	components:[{
		tag : "img",
		name : "altDialInNumbersImg",
		classes : "cgcAlternativeExpand",
		src	: "branding/assets/down-arrow.png?ts=" + window.ts,
		ontap:"showAlternateDialInNumbersPopup"
		},{
			name : "alternativeNumberPopup",
			kind : "enyo.Popup",
			classes : "cgcAlternativeNumberPopup bsftAlternateDialInNumbersPopup cgcInvisible",
			floating: true, centered: true,
			onHide:"hideAlternateDialInNumbersPopup",
	          components: [
	            {
	            	tag : "div",
					name : "alternativeNumberPopupContent",
					allowHtml : true,
					content: "",
					classes: "bsftAlternateDialInNumbersPopupBackground cgcAlternativeNumberPopupBox bsftPrimarySeparator"
					}
	        ]
	}],
	create: function(){
		this.inherited(arguments);
		if(window.cgcProfile.altDialNum && window.cgcProfile.altDialNum != "undefined"){
			this.setShowing(true);
			
			var alterNumbers = window.cgcProfile.altDialNum.split(',');
			var values ="<div class='cgcAlternativeNumberHeader bsftSeparators'>"
				+ htmlEscape(jQuery.i18n.prop("cgc.label.dialinfo.alternatenumbers"))
				+"</div><div class='cgcAlternativeNumberBody'>";
			
			for(var i = 0 ; i<alterNumbers.length;i++){
				if(alterNumbers[i].trim() != ""){
					if(values == ""){
						values = alterNumbers[i].trim();
					}else{
						values = values + "<div class='cgcAlternativeNumberRecord'>"+alterNumbers[i].trim() + "</div>";
					}
				}
			}
			values = values + "</div>";
			
			this.$.alternativeNumberPopupContent.setContent(values);
			this.$.alternativeNumberPopup.removeClass("cgcHide")
		}
    },
	showAlternateDialInNumbersPopup : function(panel){
		if(isAlternateDialInShow){
//			if (window.cgcProfile.securityPin != "")
//				securityPin = "<br/> "+htmlEscape(jQuery.i18n.prop("cgc.label.securitypin"))
//						+ ":" + window.cgcProfile.securityPin;
			
			this.$.alternativeNumberPopup.show();
			
			var dimen= document.getElementById(this.$.altDialInNumbersImg.id).getBoundingClientRect();
			var y = dimen.top + dimen.height;
			
			var x = dimen.left + (dimen.width/2);
			x -= (getOuterWidth(this.$.alternativeNumberPopup.id) / 2);
			
			this.$.alternativeNumberPopup.applyStyle("top",y+"px !important");
			this.$.alternativeNumberPopup.applyStyle("left",x+"px !important;");
			this.setIsShowAlter(true);
			this.setAttribute("title", htmlEscape(jQuery.i18n
					.prop("cgc.tooltip.altnumber.hide")));
			this.$.alternativeNumberPopup.removeClass("cgcInvisible");
				
			
		}
	},
	hideAlternateDialInNumbersPopup : function(panel){
		if(this.getIsShowAlter()){
			if(window.cgcComponent.timeoutHidePopup){
				clearTimeout(window.cgcComponent.timeoutHidePopup);
			}
			isAlternateDialInShow = false;
			window.cgcComponent.timeoutHidePopup = setTimeout(function(){isAlternateDialInShow=true},200);
			
			this.setIsShowAlter(false);
			this.$.alternativeNumberPopup.hide();
			this.setAttribute("title", htmlEscape(jQuery.i18n.prop("cgc.tooltip.altnumber.expand")));
		}
	}
});

/** Dial In Widgent **/
enyo.kind({
    name: "kind.cgc.com.broadsoft.DialInOption",
    kind: "enyo.FittableRows",
    classes:"cgcDialInfoWidget",
    components: [
        {kind: "enyo.FittableRows", 
        	
            components:[
				 {
					 classes: "cgcDialInOptionBox",
					 components: [{tag : "div",
						 allowHtml : "true",
						 classes: "cgcDialInOptionLabel bsftTertiaryContentText",
						 content:htmlEscape(jQuery.i18n
									.prop("cgc.label.dialinnumber"))

					 },
					 { 
						 kind:"kind.cgc.com.broadsoft.AlterNumber",
						 name:"AlterNumber"
					 }]
				 },
				 {	 tag : "div",
					 allowHtml : "true",
					 name:"dialInNumber",
					 classes: "cgcDialInNumber bsftPrimaryContentText",
					 content:htmlEscape(jQuery.i18n.prop("cgc.label.dialinnumber"))
				 },
				 {	 tag : "div",
	                 allowHtml : "true",
	                 name:"conferenceId",   
	                 classes: "cgcDialInExtensionLabelSeperator",
	                 components :[{
		                 tag : "div",
		                 allowHtml : "true",
		                 content: htmlEscape(jQuery.i18n.prop("cgc.label.conferenceid")) + ": " ,
		                 classes: "cgcDialInExtensionLabel bsftTertiaryContentText"
	                 },{
		                 tag : "div",
		                 allowHtml : "true",
		                 name:"conferenceNumber",   
		                 content: "",
		                 classes: "cgcDialInExtensionNumber bsftPrimaryContentText"
	                 }]
	            },
	            {	 tag : "div",
	                 allowHtml : "true",
	                 name:"securityPin",   
	                 classes: "cgcDialInExtensionLabelSeperator",
	                 components :[{
		                 tag : "div",
		                 allowHtml : "true",
		                 content: htmlEscape(jQuery.i18n.prop("cgc.label.securitypin")) + ": " ,
		                 classes: "cgcDialInExtensionLabel bsftTertiaryContentText"
	                 },{
		                 tag : "div",
		                 allowHtml : "true",
		                 name:"securityPinNumber",   
		                 content: "",
		                 classes: "cgcDialInExtensionNumber bsftPrimaryContentText"
	                 }]
                }
          ],
          rendered: function(){
        	
        	
        	  this.parent.$.dialInNumber.setContent(window.cgcProfile.dialNum);
        	  this.parent.$.conferenceNumber.setContent(window.cgcProfile.confId);
        	  if( !isNullOrEmpty(window.cgcProfile.securityPin)){
        	  this.parent.$.securityPinNumber.setContent(window.cgcProfile.securityPin);
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
        {kind: "Signals",  onConfDisco : "populateConfDisco",onCallMeNowSignal: "callMeNow",onAlternativNumberSignal : "showAlternateDialInNumbersPopup",onAlternateNumbersHideSignal:"hideAlternateDialInNumbersPopup"}

    ],
    populateConfDisco:function(){
    	this.render();//on render, dialNum and confId will be populated
    },
    create: function(){
    	this.inherited(arguments);
    	this.$.drawer.setTitle(htmlEscape(jQuery.i18n.prop("cgc.label.additionalcalloptions.link"))); 
    	if(!this.$.drawer.$.items.$.DialInOption){
    		this.$.drawer.addElement({ kind:"kind.cgc.com.broadsoft.DialInOption", name :"DialInOption"});
    	}
    	if(window.cgcConfig.callMeNowEnabled && !this.$.drawer.$.items.$.callMeComp){
    		this.$.drawer.addElement({ kind:"kind.cgc.com.broadsoft.CallMeOption",name :"callMeComp"});
    	}
    	
    	
    },
    collapseDrawer : function(){
    	this.$.drawer.closeDrawer();
    },
    hideAlternateDialInNumbersPopup : function(){
		if(this.$.drawer.$.items.$.DialInOption && 
				this.$.drawer.$.items.$.DialInOption.$.AlterNumber.getIsShowAlter()){
			this.$.drawer.$.items.$.DialInOption.$.AlterNumber.hideAlternateDialInNumbersPopup();
		}
	},
	callMeNow : function(inSender, inEvent) {

		var callMeNumber = inEvent.dialno;
		if ( isCallMeDailed == false && callMeNumber.trim() != "") {
			isCallMeDailed = true;
			var pathArray = window.location.pathname.split('/');
			$.post(window.cgcConfig.ServiceAPIs.callMeNowServletUrl, {
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

				window.stropheXMPPInterface.sendOnCallPresenceStatus(callMeNumber);
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
//    	this.$.drawer.setActive(isActive);//to-do
    }
});