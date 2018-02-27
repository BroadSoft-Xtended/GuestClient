/**
 * BroadWorks Copyright (c) 2014 BroadSoft, Inc. All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

var isViewWebrtc = function() {
	if (isChrome() && window.cgcConfig.webRTCEnabled
	        && window.cgcProfile.dialNum != "") {
		return true;
	} else {
		return false;
	}
}

var isShowDesktopSharePanel = function() {
	return isChrome() && window.cgcConfig.desktopShareExtId != null
	        && window.cgcConfig.desktopShareExtId.trim() != "";
}

enyo
        .kind({
            name : "kind.com.broadsoft.cgc.ConferenceWidget",
            kind : "onyx.Item",
            classes : "cgcConferencePanel",
            layoutKind : "FittableRowsLayout",
            rendered : function() {
	            this.inherited(arguments);
	            this.$.connectorPanel.setShowing(isChrome());
            },
            components : [
                    {
                        kind : "enyo.Signals",
                        name : "conferenceViewsignal",
                        onConfDisco : "showControlPanel", // When conference
															// Information is
															// available

                    },
                    {
                        kind : "enyo.FittableColumns",
                        fit : true,
                        classes : "cgcWebRTCPanel bsftCallControlsBackground",
                        name : "connectorPanel",
                        components : [
                                {

                                    name : "webrtcButtonEnd",
                                    kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
                                    ontap : "goForWebRTCEnd",
                                    classes : "cgcConnectorButton cgcHide",

                                    rendered : function() {
	                                    // this.setShowing(isViewWebrtc());
	                                    this
	                                            .setAttribute(
	                                                    "title",
	                                                    htmlEscape(jQuery.i18n
	                                                            .prop("cgc.tooltip.endcall")));
                                    },
                                    attributes : {
	                                    tooltip : htmlEscape(jQuery.i18n
	                                            .prop("cgc.label.end"))
                                    },
                                    isActivated : false,
                                    allowActiveBorder : false,
                                    activeDefaultClass : "",
                                    activeHOverClass : "",
                                    activeOnPressClass : "",
                                    componentClasses : "",
                                    activeDefaultImage : "branding/assets/end.svg?ts=" + window.ts,
                                    activeHOverImage : "",
                                    activeOnPressImage : "",
                                    imageComp : undefined,
                                    compName : "endIcon",
                                },
                                {
                                    name : "webrtcButtonAudio",
                                    kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
                                    ontap : "goForWebRTCAudio",
                                    classes : "cgcConnectorButton bsftDisabledBG",
                                    disabled : true,

                                    rendered : function() {
	                                    if (!isChrome()
	                                            || !window.cgcConfig.webRTCEnabled) {
		                                    this.setShowing(false);
	                                    } else if (isViewWebrtc()) {
		                                    this.removeClass("bsftDisabledBG");
		                                    this.$.fgcover.removeClass("cgcDisabled");
		                                    this.disabled = false;
		                                    this
		                                            .setAttribute(
		                                                    "title",
		                                                    htmlEscape(jQuery.i18n
		                                                            .prop("cgc.tooltip.audio.startcall")));
	                                    } else {
		                                    this
		                                            .setAttribute(
		                                                    "title",
		                                                    htmlEscape(jQuery.i18n
		                                                            .prop("cgc.tooltip.audio.disabled")));
		                                    this.$.fgcover
		                                            .addClass("cgcDisabled");
	                                    }
                                    },
                                    attributes : {
	                                    tooltip : htmlEscape(jQuery.i18n
	                                            .prop("cgc.label.audio"))
                                    },
                                    isActivated : false,
                                    allowActiveBorder : false,
                                    deactiveDefaultClass : "",
                                    deactiveDefaultImage : "branding/assets/audio.svg?ts=" + window.ts,

                                    deactiveHOverClass : "",
                                    deactiveHOverImage : "branding/assets/audio.svg?ts=" + window.ts,

                                    deactiveOnPressClass : "bsftActiveHoverBackground",
                                    deactiveOnPressImage : "branding/assets/audio.svg?ts=" + window.ts,

                                    componentClasses : "",

                                    imageComp : undefined,
                                    compName : "audioIcon",
                                },
                                {
                                    name : "webrtcButtonMute",
                                    kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
                                    ontap : "goForWebRTCMute",
                                    classes : "cgcConnectorButton goForWebRTCMute cgcDisabled",

                                    rendered : function() {
	                                    // this.setShowing(isViewWebrtc());
	                                    if (!isChrome()
	                                            || !window.cgcConfig.webRTCEnabled) {
		                                    this.setShowing(false);
	                                    }
                                    },
                                    attributes : {
	                                    tooltip : htmlEscape(jQuery.i18n
	                                            .prop("cgc.label.mute"))
                                    },
                                    isActivated : false,
                                    activeDefaultClass : "",
                                    deactiveDefaultClass : "",
                                    activeHOverClass : "bsftHoverBackground",
                                    deactiveHOverClass : "",
                                    activeOnPressClass : "bsftActiveHoverBackground",
                                    deactiveOnPressClass : "",
                                    componentClasses : "",
                                    activeDefaultImage : "branding/assets/mute_a.svg?ts=" + window.ts,
                                    deactiveDefaultImage : "branding/assets/mute.svg?ts=" + window.ts,
                                    activeHOverImage : "",
                                    deactiveHOverImage : "",
                                    activeOnPressImage : "",
                                    deactiveOnPressImage : "",
                                    imageComp : undefined,
                                    compName : "muteIcon",
                                },
                                {

                                    name : "webrtcButtonVideo",
                                    published : {
                                        isConnected : false,
                                        isSelfView : true
                                    },
                                    kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
                                    ontap : "goForWebRTCVideo",
                                    classes : "cgcConnectorButton bsftDisabledBG",
                                    disabled : true,

                                    rendered : function() {

	                                    if (!isChrome()
	                                            || !window.cgcConfig.webRTCEnabled
	                                            || !window.cgcConfig.webRTCVideoEnabled) {
		                                    this.setShowing(false);
	                                    } else if (isViewWebrtc()) {
		                                    if (this.disabled) {// on vedeo call
																// active,
																// shouldn't
																// enter inside
			                                    this.removeClass("bsftDisabledBG");
			                                    this.$.fgcover.removeClass("cgcDisabled");
			                                    this.disabled = false;
			                                    this
			                                            .setAttribute(
			                                                    "title",
			                                                    htmlEscape(jQuery.i18n
			                                                            .prop("cgc.tooltip.video.startcall")));
		                                    }
	                                    } else {
		                                    this
		                                            .setAttribute(
		                                                    "title",
		                                                    htmlEscape(jQuery.i18n
		                                                            .prop("cgc.tooltip.video.disabled")));
		                                    this.$.fgcover
		                                            .addClass("cgcDisabled");
	                                    }
                                    },
                                    attributes : {
	                                    tooltip : htmlEscape(jQuery.i18n
	                                            .prop("cgc.label.video"))
                                    },
                                    isActivated : false,
                                    activeDefaultClass : "",
                                    deactiveDefaultClass : "",
                                    activeHOverClass : "bsftHoverBackground",
                                    deactiveHOverClass : "",
                                    activeOnPressClass : "bsftActiveHoverBackground",
                                    deactiveOnPressClass : "",
                                    componentClasses : "",
                                    activeDefaultImage : "branding/assets/video_a.svg?ts=" + window.ts,
                                    deactiveDefaultImage : "branding/assets/video.svg?ts=" + window.ts,
                                    activeHOverImage : "branding/assets/video_a.svg?ts=" + window.ts,
                                    deactiveHOverImage : "branding/assets/video.svg?ts=" + window.ts,
                                    activeOnPressImage : "branding/assets/video_a.svg?ts=" + window.ts,
                                    deactiveOnPressImage : "branding/assets/video.svg?ts=" + window.ts,
                                    imageComp : undefined,
                                    compName : "videoIcon",

                                },
                                {
                                    kind : "kind.cgc.com.broadsoft.desktopShare",
                                    name : "desktopShareComp",
                                    classes : "cgcConnectorShareButton"
                                } ]
                    } ],
            showControlPanel : function() {

	            // if(isViewWebrtc()){
	            // this.$.connectorPanel.applyStyle("display","");
	            //					
	            // }
	            this.render();
	            //
            },
            goForWebRTCVideo : function(inSender, inEvent) {
	            cgcCallMeNumberText = "";
	            // if go to webrtc call, callme type content will be clear
	            if (!isViewWebrtc()) {
		            return;
	            }
	            if (this.$.webrtcButtonVideo.getIsConnected()) {

		            window.cgcComponent.basePanel.startWebRTCVideo(false);
	            } else {

		            window.cgcComponent.basePanel.startWebRTCVideo(true);
	            }

            },
            // Audio can be clicked only to start the WebRTC in audio mode.
            // After the WebRTC session is started, audio button is hidden.
            goForWebRTCAudio : function(inSender, inEvent) {
	            cgcCallMeNumberText = "";
	            try {
		            // if go to webrtc call, callme type content will be clear
		            // Don't do ui thing here
		            if (!isViewWebrtc()) {
			            return;
		            }
		            window.cgcComponent.basePanel.startWebRTCVideo(false);
	            } catch (err) {
		            LOGGER.error("controlpanel.js",
		                    "Noticed an error at goForWebRTCAudio %o", err);
	            }
            },
            goForWebRTCMute : function(inSender, inEvent) {
	            cgcCallMeNumberText = "";
	            window.cgcComponent.basePanel.muteUnMuteWebRTC();
            },
            goForWebRTCEnd : function(inSender, inEvent) {
	            cgcCallMeNumberText = "";
	            this.$.webrtcButtonVideo.setIsConnected(false);
	            window.cgcComponent.basePanel.endWebRTC();
	            this.$.webrtcButtonVideo.setAttribute("title",
	                    htmlEscape(jQuery.i18n
	                            .prop("cgc.tooltip.video.startcall")));

            },
            onStartWebRTC : function(isVideo) {
	            cgcCallMeNumberText = "";
	            if (isVideo) {
		            this.$.webrtcButtonVideo.setIsConnected(true);
		            // this.$.webrtcButtonVideo.setAttribute("title",
					// htmlEscape(jQuery.i18n
		            // .prop("cgc.tooltip.audio")));
		            this.$.webrtcButtonVideo.setTooltip(htmlEscape(jQuery.i18n
		                    .prop("cgc.label.video.end")));
		            this.$.webrtcButtonVideo.setActivate(true);
		            this.$.webrtcButtonVideo
		                    .setAttribute("title", htmlEscape(jQuery.i18n
		                            .prop("cgc.label.video.end")));
	            }
	            this.$.webrtcButtonMute.removeClass("cgcDisabled");
	            this.$.webrtcButtonMute
	                    .setDeactiveHOverImage("branding/assets/mute.svg?ts=" + window.ts);
	            this.$.webrtcButtonMute
	                    .setDeactiveOnPressImage("branding/assets/mute.svg?ts=" + window.ts);
	            
	            this.$.webrtcButtonMute.setAttribute("title",
	                    htmlEscape(jQuery.i18n
	                            .prop("cgc.tooltip.mutemicrophone")));

	            this.$.webrtcButtonEnd.removeClass("cgcHide");
	            // this.$.webrtcButtonEnd.addClass("cgcShow");
	            this.$.webrtcButtonMute.setActivate(false);
	            this.$.webrtcButtonEnd.setActivate(true);
	            this.$.webrtcButtonAudio.setActivate(true);
	            this.$.webrtcButtonAudio.hide();
	            // this.owner.owner.resized();

	            this.owner.collapseAlternateDialInOptionWidget();
            },
            switchVideo : function() {
	            cgcCallMeNumberText = "";
	            this.$.webrtcButtonVideo.setTooltip(htmlEscape(jQuery.i18n
	                    .prop("cgc.label.video.end")));
	            this.$.webrtcButtonVideo.setActivate(true);
	            this.$.webrtcButtonVideo.setIsConnected(true);

	            this.$.webrtcButtonVideo.setAttribute("title",
	                    htmlEscape(jQuery.i18n.prop("cgc.label.video.end")));

	            // this.owner.owner.resized();
            },
            switchAudio : function() {
	            cgcCallMeNumberText = "";
	            this.$.webrtcButtonVideo.setTooltip(htmlEscape(jQuery.i18n
	                    .prop("cgc.label.video")));
	            this.$.webrtcButtonVideo.setIsConnected(false);
	            this.$.webrtcButtonVideo.setActivate(false);
	            this.$.webrtcButtonVideo.setAttribute("title",
	                    htmlEscape(jQuery.i18n
	                            .prop("cgc.tooltip.video.startcall")));
	            // this.owner.owner.resized();
            },
            goMute : function(isMute) {
	            cgcCallMeNumberText = "";

	            if (isMute) {
		            this.$.webrtcButtonMute.setActivate(true);
		            this.$.webrtcButtonMute.setTooltip(htmlEscape(jQuery.i18n
		                    .prop("cgc.tooltip.unmute")));
		            this.$.webrtcButtonMute.setAttribute("title",
		                    htmlEscape(jQuery.i18n
		                            .prop("cgc.tooltip.unmutemicrophone")));
	            } else {
		            this.$.webrtcButtonMute.setActivate(false);
		            this.$.webrtcButtonMute.setTooltip(htmlEscape(jQuery.i18n
		                    .prop("cgc.label.mute")));
		            this.$.webrtcButtonMute.setAttribute("title",
		                    htmlEscape(jQuery.i18n
		                            .prop("cgc.tooltip.mutemicrophone")));
	            }
	            // this.owner.owner.resized();
            },
            endCall : function() {

	            cgcCallMeNumberText = "";
	            this.$.webrtcButtonVideo.setIsConnected(false);
	            this.$.webrtcButtonEnd.addClass("cgcHide");
	            // this.$.webrtcButtonEnd.removeClass("cgcShow");
	            this.$.webrtcButtonAudio.show();
	            this.$.webrtcButtonAudio.setActivate(false);
	            this.$.webrtcButtonVideo.setActivate(false);
	            this.$.webrtcButtonMute.setActivate(false);
	            this.$.webrtcButtonMute
	                    .setDeactiveHOverImage("branding/assets/mute.svg?ts=" + window.ts);
	            this.$.webrtcButtonMute
	                    .setDeactiveOnPressImage("branding/assets/mute.svg?ts=" + window.ts);

	            this.$.webrtcButtonMute.addClass("cgcDisabled");
	            this.$.webrtcButtonMute.attributes.tooltip = "";

	            this.$.webrtcButtonVideo.setIsConnected(false);
	            this.$.webrtcButtonVideo.setTooltip(htmlEscape(jQuery.i18n
	                    .prop("cgc.label.video")));
	            this.$.webrtcButtonMute.setTooltip(htmlEscape(jQuery.i18n
	                    .prop("cgc.label.mute")));
	            this.$.webrtcButtonVideo.setIsSelfView(true);
	            // this.owner.owner.resized();
	            // enyo.Signals.send("layoutRefresh");
            }

        });

// Share button
enyo
        .kind({
            name : "kind.cgc.com.broadsoft.desktopShare",
            kind : "enyo.FittableRows",
            shareStatus : "end",
            listenersAdded : false,
            desktopShareAccess : "viewonly",
            shareRequestTimeout : null,
            components : [

                    {
                        kind : "kind.com.broadsoft.cgc.CustomButtonWidget",
                        name : "startShareButton",
                        isActivated : false,
                        activeDefaultClass : "",
                        deactiveDefaultClass : "",
                        activeHOverClass : "bsftHoverBackground",
                        deactiveHOverClass : "",
                        activeOnPressClass : "",
                        deactiveOnPressClass : "",
                        componentClasses : "",
                        activeDefaultImage : "branding/assets/share_a.svg?ts=" + window.ts,
                        deactiveDefaultImage : "branding/assets/share.svg?ts=" + window.ts,
                        activeHOverImage : "branding/assets/share_a.svg?ts=" + window.ts,
                        deactiveHOverImage : "branding/assets/share.svg?ts=" + window.ts,
                        activeOnPressImage : "branding/assets/share_a.svg?ts=" + window.ts,
                        deactiveOnPressImage : "branding/assets/share.svg?ts=" + window.ts,
                        imageComp : undefined,
                        attributes : {
	                        tooltip : htmlEscape(jQuery.i18n
	                                .prop("cgc.tooltip.desktopShare.disabled"))
                        },
                        compName : "shareIcon",
                        ontap : "onShareClicked"
                    },

                    /*
					 * {kind: "enyo.Button", name: "endShareButton",
					 * classes:"cgcDesktopShareImgButton
					 * desktopShareButtonInactiveBackground
					 * desktopShareStopButtonDisabled", disabled:true,
					 * components: [ {kind: "enyo.Image", name: "stopBtnImg",
					 * src: "branding/assets/stop.svg?ts=" + window.ts} ], ontap:
					 * "endDesktopShare", onmouseover: "stopButtonHover",
					 * onmouseout: "stopButtonHoverFade"},
					 */
                    {
                        name : "popupBGDiv",
                        classes : "cgcPopuBackground"
                    },
                    {
                        name : "shareConfirmPopup",
                        kind : "enyo.Popup",
                        floating : true,
                        centered : true,
                        classes : "cgcDesktopSharePopup bsftSharePopupBackground bsftSeparators",
                        onHide : "popupHidden",
                        autoDismiss : false,
                        components : [
                                {
                                    tag : "img",
                                    name : "icon",
                                    classes : "cgcDesktopSharePopupIcon",
                                    src : "branding/assets/share.svg?ts=" + window.ts
                                },
                                {
                                    tag : "div",
                                    classes : "cgcDesktopSharePopupText",
                                    name : "guestShareConfirmPopupText",
                                    id : "guestShareConfirmPopupText",
                                    allowHtml : true,
                                    content : htmlEscape(jQuery.i18n
                                            .prop("cgc.info.uss.screenshare.guestinterrupt.confirm"))
                                },
                                {
                                    layoutKind : "FittableColumnsLayout",
                                    style : "text-align:center;",
                                    components : [
                                            {
                                                classes : "cgcPostionRelative",
                                                ontap : "onCancelShareByUser",
                                                components : [
                                                        {
                                                            kind : "enyo.Button",
                                                            name : "CancelShare",
                                                            content : htmlEscape(jQuery.i18n
                                                                    .prop("cgc.label.desktopShare.confirm.cancel")),
                                                            classes : "bsftDesktopSharePopupCancleBtn cgcDesktopSharePopupButton bsftPrimaryButtonBorder bsftSelectedIcon cgcTextEllipsis"
                                                        },
                                                        {
                                                            tag : "div",
                                                            name : "cancleFGCover",
                                                            classes : "cgcShareButtonHoverCover bsftShareButtonHoverBackground",
                                                            content : "",
                                                            attributes : {
                                                            	title : htmlEscape(jQuery.i18n
                                                            			.prop("cgc.label.desktopShare.confirm.cancel")),
                                                            }
                                                        } ]
                                            },
                                            {
                                                tag : "div",
                                                style : "line-height:48px;width:15px;vertical-align:middle;"
                                            },
                                            {
                                                classes : "cgcPostionRelative",
                                                ontap : "onConfirmShareByUser",
                                                components : [
                                                        {
                                                            kind : "enyo.Button",
                                                            name : "ConfirmShare",
                                                            content : htmlEscape(jQuery.i18n
                                                                    .prop("cgc.label.desktopShare.confirm.share")),
                                                            classes : "cgcDesktopSharePopupButton bsftPrimaryButtonReverse bsftPrimaryButton bsftPrimaryButtonBorder cgcTextEllipsis"
                                                        },
                                                        {
                                                            tag : "div",
                                                            name : "shareFGCover",
                                                            classes : "cgcShareButtonHoverCover bsftShareButtonHoverBackground",
                                                            content : "",
                                                            attributes : {
                                                            	title : htmlEscape(jQuery.i18n
                                                            			.prop("cgc.label.desktopShare.confirm.share")),
                                                            }
                                                        } ]
                                            }

                                    ]
                                } ]
                    }, {
                        kind : "Signals",
                        onSharePopupDisplay : "sharePopupDisplay"
                    }, {
                        kind : "enyo.Signals",
                        onShareStatusChangeSignal : "shareStatusChange"
                    }, {
                        kind : "enyo.Signals",
                        onDesktopShareAccessSignal : "desktopShareAccessChange"
                    },

                    {
                        kind : "enyo.Signals",
                        onShareStartStopSignal : "desktopShareStartStop"
                    }

            ],
            // popupHidden: function(inSender, inEvent) {
            // // this.$.popupBGDiv.addClass("cgcHide");
            // },
            rendered : function() {
	            this.validateActiveState();
            },
            shareStatusChange : function(inSender, inEvent) {
	            var shareStatus = inEvent.shareStatus;
	            if (shareStatus == "play") {
	            	this.$.startShareButton.removeClass("bsftDisabledBG");
		            this.$.startShareButton.setTooltip(htmlEscape(jQuery.i18n
		                    .prop("cgc.tooltip.desktopShare.stopsharing")));

		            this.$.startShareButton.disabled = false;
		            
		            this.$.startShareButton
		                    .setAttribute(
		                            "title",
		                            htmlEscape(jQuery.i18n
		                                    .prop("cgc.tooltip.desktopShare.stopsharing")));

	            } else {
		            // if(this.desktopShareAccess == "ready") {
		            //    			
		            // this.$.startShareButton.setTooltip(htmlEscape(jQuery.i18n
		            // .prop("cgc.label.desktopShare.share.link")));
		            // } else {
		            // this.$.startShareButton.setTooltip(htmlEscape(jQuery.i18n
		            // .prop("cgc.label.desktopShare.viewonly.link")));
		            // }

		            this.$.startShareButton.setTooltip(htmlEscape(jQuery.i18n
		                    .prop("cgc.label.desktopShare.share.link")));
		            if (this.desktopShareAccess == "ready") {
			            this.$.startShareButton.disabled = false;
			            this.$.startShareButton.removeClass("bsftDisabledBG");
			            this.$.startShareButton
			                    .setAttribute(
			                            "title",
			                            htmlEscape(jQuery.i18n
			                                    .prop("cgc.tooltip.desktopShare.startsharing")));
		            } else {
			            this.$.startShareButton.disabled = true;
			            this.$.startShareButton.addClass("bsftDisabledBG");
			            this.$.startShareButton
			                    .setAttribute(
			                            "title",
			                            htmlEscape(jQuery.i18n
			                                    .prop("cgc.tooltip.desktopShare.disabled")));
		            }
	            }

            },

            desktopShareAccessChange : function(inSender, inEvent) {
	            var access = inEvent.access;
	            if (isShowDesktopSharePanel() && access) {
		            this.desktopShareAccess = "ready";
	            } else {
		            this.desktopShareAccess = "viewonly";
	            }
	            this.validateActiveState();

            },
            desktopShareStartStop : function(inSender, inEvent) {
	            this.clearShareRequestTimeout();
	            if (inEvent.desktopShare == "start") {
		            this.onDesktopShareStart();
	            } else if (inEvent.desktopShare == "stop") {
		            this.onDesktopShareEnd();
	            }
            },
            validateActiveState : function() {

            	
	            if (!window.cgcConfig.desktopShareExtId) {
		            this.setShowing(false);
	            } else if(!window.ussController.isFloorHolder()) {
	

		            this.$.startShareButton.setTooltip(htmlEscape(jQuery.i18n
		                    .prop("cgc.label.desktopShare.share.link")));
		            if (this.desktopShareAccess == "ready") {
		            	this.$.startShareButton.removeClass("bsftDisabledBG");
			            this.$.startShareButton
			                    .setAttribute(
			                            "title",
			                            htmlEscape(jQuery.i18n
			                                    .prop("cgc.tooltip.desktopShare.startsharing")));
			            this.$.startShareButton.disabled = false;
			            
		            } else {
			            enyo.Signals.send("onSharePopupDisplay", {
				            popupDisplay : "hide"
			            });
			            if (document.getElementById("cgcframe") != null) {
				            document.getElementById("cgcframe").contentWindow
				                    .postMessage(
				                            {
				                                requestFrom : "collaborate",
				                                requestReason : "endShare",
				                                extensionId : window.cgcConfig.desktopShareExtId
				                            }, "*");
			            }
			            this.$.startShareButton.disabled = true;
			            this.$.startShareButton.addClass("bsftDisabledBG");

			            this.$.startShareButton
			                    .setAttribute(
			                            "title",
			                            htmlEscape(jQuery.i18n
			                                    .prop("cgc.tooltip.desktopShare.disabled")));
		            }
	            }
            },
            sharePopupDisplay : function(inSender, inEvent) {

	            this.$.cancleFGCover.removeClass("active");
	            this.$.shareFGCover.removeClass("active");

	            var popupDisplay = inEvent.popupDisplay;
	            if (this.$.shareConfirmPopup != null) {
		            if (popupDisplay == "show") {
			            this.$.shareConfirmPopup.show();
			            this.$.shareConfirmPopup
			                    .addClass("cgcDesktopSharePopup");
			            this.$.popupBGDiv.removeClass("cgcHide");
			            this.$.shareConfirmPopup.resized();
		            } else {
			            this.$.popupBGDiv.addClass("cgcHide");
			            this.$.shareConfirmPopup.hide();
			            this.$.shareConfirmPopup
			                    .removeClass("cgcDesktopSharePopup");
		            }

	            }
            },
            setShareRequestTimeout : function() {
	            var self = this;
	            this.shareRequestTimeout = setTimeout(function() {
	            	if(ussController.isFloorHolder()){
	            		self.endDesktopShare();
	            	}else{
	            		self.onDesktopShareEnd();
	            	}
	            }, 60000);
            },
            clearShareRequestTimeout : function() {
	            clearTimeout(this.shareRequestTimeout);
	            this.shareRequestTimeout = null;
            },
            onConfirmShareByUser : function() {
	            if (LOGGER.API.isInfo()) {
		            LOGGER.API.info("controlpanel.js",
		                    'User confirmed desktop share process');
	            }
	            enyo.Signals.send("onSharePopupDisplay", {
		            popupDisplay : "hide"
	            });

	            if (this.shareStatus == "end") {
		            //			this.$.startShareButton.addClass("cgcDisabled");
		            this.$.startShareButton.addClass("bsftDisabledBG");
		            this.$.startShareButton.disabled = true;
		            this.$.startShareButton
		                    .setAttribute(
		                            "title",
		                            htmlEscape(jQuery.i18n
		                                    .prop("cgc.tooltip.desktopShare.sharepreparing")));

		            window.cgcComponent.xmppInterface.requestDesktopShare();
		            this.$.shareFGCover.addClass("active");

		            this.setShareRequestTimeout();
	            } else {
		            if (LOGGER.API.isInfo()) {
			            LOGGER.API
			                    .info("controlpanel.js",
			                            'Share already running. So new desktop share request is to be cancelled');
		            }
		            this.onCancelShareByUser();
	            }
            },
            onShareClicked : function() {
	            if (!this.$.startShareButton.disabled) {
		            if (this.shareStatus == "end") {
			            var desktopShareFrame = document
			                    .getElementById("cgcframe");
			            if (desktopShareFrame == null) {
				            desktopShareFrame = document
				                    .createElement("iframe");
				            desktopShareFrame.id = "cgcframe";
				            desktopShareFrame.src = "./cgcframe.jsp";
				            desktopShareFrame.style.display = "none";
				            desktopShareFrame.width = 0;
				            desktopShareFrame.height = 0;
				            document.body.appendChild(desktopShareFrame);
			            }

			            var desktopShareFrameWindow = desktopShareFrame.contentWindow;

			            if (!this.listenersAdded) {

				            var self = this;
				            window
				                    .addEventListener(
				                            'message',
				                            function(event) {

					                            if (event.data.responseFrom == "cgcframe") {
						                            if (event.data.response == "frameReady") {
							                            desktopShareFrameWindow
							                                    .postMessage(
							                                            {
							                                                requestFrom : "collaborate",
							                                                requestReason : "isExtensionInstalled",
							                                                extensionId : window.cgcConfig.desktopShareExtId
							                                            }, "*");
						                            } else if (event.data.response == "extensionInstalled") {

							                            enyo.Signals
							                                    .send(
							                                            "onSharePopupDisplay",
							                                            {
								                                            popupDisplay : "show"
							                                            });
							                            if (LOGGER.API.isInfo()) {
								                            LOGGER.API
								                                    .info(
								                                            "controlpanel.js",
								                                            'Start desktop share process');
							                            }

						                            } else if (event.data.response == "extensionNotInstalled") {
							                            if (LOGGER.API.isInfo()) {
								                            LOGGER.API
								                                    .info(
								                                            "controlpanel.js",
								                                            'Extension is not present');
							                            }

							                            enyo.Signals
							                                    .send(
							                                            "onChatInfoMessage",
							                                            {
							                                                message : htmlEscape(jQuery.i18n
							                                                        .prop(
							                                                                "cgc.info.uss.screenshare.installextension",
							                                                                jQuery.i18n
							                                                                        .prop("cgc.label.app.title"),
							                                                                "https://chrome.google.com/webstore/detail/"
							                                                                        + window.cgcConfig.desktopShareExtId)),
							                                                avatar : false
							                                            });
						                            }

					                            }

				                            });

				            this.listenersAdded = true;
			            }

			            desktopShareFrame.src = "./cgcframe.jsp";
		            } else {
			            //this.processDesktopShare();
			            this.endDesktopShare();
		            }
	            }
            },
            onCancelShareByUser : function() {
	            if (LOGGER.API.isInfo()) {
		            LOGGER.API.info("controlpanel.js",
		                    'User cancelled desktop share process');
	            }
	            enyo.Signals.send("onSharePopupDisplay", {
		            popupDisplay : "hide"
	            });
	            this.endDesktopShare();
	            this.$.cancleFGCover.addClass("active");
            },
            onDesktopShareStart : function() {

	            this.shareStatus = "play";
	            enyo.Signals.send("onShareStatusChangeSignal", {
		            shareStatus : "play"
	            });
	            this.$.startShareButton.setActivate(true);
	            this.hideShareConfirmPopup();
            },
            onDesktopShareEnd : function() {

	            this.shareStatus = "end";
	            enyo.Signals.send("onShareStatusChangeSignal", {
		            shareStatus : "end"
	            });

	            this.$.startShareButton.setActivate(false);

	            //		this.$.playPauseBtnImg.setSrc("branding/assets/play.svg?ts=" + window.ts);
	            //		this.$.endShareButton.set("disabled", true);

            },
            endDesktopShare : function() {
	            ussController.endDesktopShare();
	            this.hideShareConfirmPopup();
            },
            hideShareConfirmPopup : function() {
	            this.$.shareConfirmPopup.setShowing(false);
            }

        });

enyo
        .kind({
            name : "kind.com.broadsoft.cgc.CustomButtonWidget",

            published : {
                isActivated : false,
                allowActiveBorder : true,
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
                defaultClass : "",
                componentClasses : "",

                fullScreenIconClass : "",

                imageComp : undefined,
                compName : "",
                showIconOnly : false
            },
            create : function() {
	            this.inherited(arguments);
	            this.addClass(this.getDefaultClass());
	            this.$.compName.addClass(this.getComponentClasses());
	            this.$.compName.setSrc(this.getDeactiveDefaultImage());

	            if (this.getShowIconOnly()) {//ViewPane FullScreen Icons
		            //bellow are no need for FullScreen Icons
		            this.$.iconTitle.destroy();
		            this.$.tooltip.destroy();
		            this.$.fgcover.destroy();

		            this.$.iconBox.removeClass("cgcConnectorButtonIconBox");
		            this.$.iconBox.addClass("cgcFullScreenIconBox");

		            this.$.compName.removeClass("cgcConnectorButtonIcon");

		            if (this.getFullScreenIconClass()) {
			            this.$.compName.addClass(this.getFullScreenIconClass());
		            } else {
			            this.$.compName.addClass("cgcFullScreenButtonIcon");
		            }

	            }
	            this.setTooltip(this.getAttributes().tooltip);
	            this.reset();
            },
            components : [
                    {
                        kind : "onyx.Item",
                        name : "iconBox",
                        classes : "cgcConnectorButtonIconBox",
                        events : {
                            onmouseover : "hOverAction",
                            onmouseout : "onOutAction",
                            onmousedown : "onClickDown",
                            onmouseup : "onClickUp"
                        },
                        components : [ {
                            tag : "img",
                            name : "compName",
                            classes : "cgcConnectorButtonIcon",
                            src : ""

                        } ]
                    },
                    {
                        tag : "div",
                        name : "iconTitle",
                        classes : "cgcConnectorButtonIconTitle bsftIcon bsftFontRobtoCondensed cgcTextEllipsis",
                        content : ""
                    },
                    {
                        tag : "div",
                        name : "tooltip",
                        classes : "cgcConnectorButtonTooltip bsftTooltipText bsftTooltipBackground",
                        content : ""
                    },
                    {
                        tag : "div",
                        name : "fgcover",
                        classes : "cgcConnectorButtonHoverCover bsftHoverBackground",
                        content : ""
                    } ],
            reset : function(inSender, inEvent) {
	            this.removeAllClasses();
	            this.addClass(this.getDefaultClass());
	            if (this.getIsActivated()) {
		            if (!isNullOrEmpty(this.getActiveDefaultClass())) {
			            this.addClass(this.getActiveDefaultClass());
		            } else {
			            this.addClass(this.getDeactiveDefaultClass());
		            }
		            if (!isNullOrEmpty(this.getActiveDefaultImage())) {
			            this.$.compName.setSrc(this.getActiveDefaultImage());
		            } else {
			            this.$.compName.setSrc(this.getDeactiveDefaultImage());
		            }
	            } else {
		            this.addClass(this.getDeactiveDefaultClass());
		            this.$.compName.setSrc(this.getDeactiveDefaultImage());
	            }
            },
            setActivate : function(flag) {
	            this.setIsActivated(flag);
	            if (this.getAllowActiveBorder()) {
		            if (flag) {
			            this.addClass("active");
		            } else {
			            this.removeClass("active");
		            }

		            if (!this.getShowIconOnly()) {
			            if (flag) {
				            this.$.iconTitle
				                    .addClass("bsftPrimarySeparator bsftSelectedIcon");
			            } else {
				            this.$.iconTitle
				                    .removeClass("bsftPrimarySeparator bsftSelectedIcon");
			            }
		            }
	            }
	            this.reset();
            },
            setTooltip : function(content) {
	            if (!this.getShowIconOnly()) {
		            //			window.hideIconTitle = true;
		            if (window.hideIconTitle) {
			            this.$.tooltip.setContent(content);
			            this.$.iconTitle.addClass("cgcFontTransparent");
			            this.$.tooltip
			                    .addClass("cgcConnectorButtonTooltipVisble");
		            } else {
			            this.$.iconTitle.setContent(content);
		            }
	            } else {
		            this.setAttribute("title", content);
	            }
            },
            removeAllClasses : function() {
	            this.removeClass(this.getActiveDefaultClass());
	            this.removeClass(this.getDeactiveDefaultClass());
	            this.removeClass(this.getActiveHOverClass());
	            this.removeClass(this.getDeactiveHOverClass());
	            this.removeClass(this.getActiveOnPressClass());
	            this.removeClass(this.getDeactiveOnPressClass());
            },
            hOverAction : function(inSender, inEvent) {
	            this.removeAllClasses();
	            if (this.getIsActivated()) {
		            if (!isNullOrEmpty(this.getActiveHOverClass()))
			            this.addClass(this.getActiveHOverClass());
		            if (!isNullOrEmpty(this.getActiveHOverImage()))
			            this.$.compName.setSrc(this.getActiveHOverImage());

	            } else {
		            if (!isNullOrEmpty(this.getDeactiveHOverClass()))
			            this.addClass(this.getDeactiveHOverClass());
		            if (!isNullOrEmpty(this.getDeactiveHOverImage()))
			            this.$.compName.setSrc(this.getDeactiveHOverImage());

	            }
            },
            onOutAction : function(inSender, inEvent) {
	            this.removeAllClasses();
	            if (this.getIsActivated()) {
		            if (!isNullOrEmpty(this.getActiveDefaultClass()))
			            this.addClass(this.getActiveDefaultClass());
		            if (!isNullOrEmpty(this.getActiveDefaultImage()))
			            this.$.compName.setSrc(this.getActiveDefaultImage());
	            } else {
		            if (!isNullOrEmpty(this.getDeactiveDefaultClass()))
			            this.addClass(this.getDeactiveDefaultClass());
		            if (!isNullOrEmpty(this.getDeactiveDefaultImage()))
			            this.$.compName.setSrc(this.getDeactiveDefaultImage());
	            }
            },
            onClickDown : function(inSender, inEvent) {
	            this.removeAllClasses();

	            if (this.getIsActivated()) {
		            if (!isNullOrEmpty(this.getActiveOnPressClass()))
			            this.addClass(this.getActiveOnPressClass());
		            if (!isNullOrEmpty(this.getActiveOnPressImage()))
			            this.$.compName.setSrc(this.getActiveOnPressImage());
	            } else {
		            if (!isNullOrEmpty(this.getDeactiveOnPressClass()))
			            this.addClass(this.getDeactiveOnPressClass());
		            if (!isNullOrEmpty(this.getDeactiveOnPressImage()))
			            this.$.compName.setSrc(this.getDeactiveOnPressImage());
	            }
            },
            onClickUp : function(inSender, inEvent) {
	            this.removeAllClasses();
	            if (this.getIsActivated()) {
		            if (!isNullOrEmpty(this.getActiveDefaultClass()))
			            this.addClass(this.getActiveDefaultClass());
		            if (!isNullOrEmpty(this.getActiveDefaultImage()))
			            this.$.compName.setSrc(this.getActiveDefaultImage());
	            } else {
		            if (!isNullOrEmpty(this.getDeactiveDefaultClass()))
			            this.addClass(this.getDeactiveDefaultClass());
		            if (!isNullOrEmpty(this.getDeactiveDefaultImage()))
			            this.$.compName.setSrc(this.getDeactiveDefaultImage());
	            }
            }
        })