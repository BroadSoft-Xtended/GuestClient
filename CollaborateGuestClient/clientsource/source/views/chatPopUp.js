/*
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

var minPopupMessageDispalyedinSeconds=3;
var maxPopupMessageDispalyedinSeconds=5;
var popupMessages=[];
var isShowPopupMessage = false;
MessageQueue = function() {

	this.message = null;
	this.sender = null;
};

enyo
        .kind({
            name : "kind.cgc.basicPopup",
            kind : "enyo.Popup",
            floating : true,
            onHide : "hidePopup",
            classes : "cgcChatMessagePopup",
            onHide : "popupHidden",
            components : [ {
                name : "popupMessage",
                classes : "cgcChatMessagePopupContent",
                content : "",
                allowHtml : true
            } ],
            popupMessages : [],
            minPopupMessageDispalyedinSeconds : 3,
            maxPopupMessageDispalyedinSeconds : 5,
            isShowPopupMessage : false,
            create : function() {
				this.inherited(arguments);
            },
            queuePopup : function() {
	            if (popupMessages.length > 0 && !isShowPopupMessage) {
		            
		            isShowPopupMessage = true;
		            var message = popupMessages.shift();
		            this.$.popupMessage.setContent("<b>" + message.sender
		                    + ":</b>  " + message.message);
		           
		            var viewPanelWidth = parseInt(getWidth(window.cgcComponent.basePanel.getViewPanelId())) ;
		            this.applyStyle("width",
		                    (viewPanelWidth - 20) + "px");

		            if (window.maxPopupMessageDispalyedTimeoutHandle) {
			            clearTimeout(window.maxPopupMessageDispalyedTimeoutHandle);
		            }

		            this.show();
		            var self = this;
		            window.minPopupMessageDispalyedTimeoutHandle = setTimeout(
		                    function() {
			                    if (popupMessages.length > 0) {
				                    clearTimeout(window.maxPopupMessageDispalyedTimeoutHandle);
				                    isShowPopupMessage = false;
				                    self.hide();
				                   self.queuePopup();
			                    }
		                    }, (minPopupMessageDispalyedinSeconds * 1000));

		            window.maxPopupMessageDispalyedTimeoutHandle = setTimeout(
		                    function() {
		                    	self.hide();
			                    isShowPopupMessage = false;
			                    
		                    	if (popupMessages.length > 0) {
				                   self.queuePopup();
			                    }else{
				                    popupMessages = [];
			                    }
		                    }, (maxPopupMessageDispalyedinSeconds * 1000));
	            }

            },
            hidePopup : function(sender, msg) {
	            popupMessages = [];
	            isShowPopupMessage = false;
	            this.hide();
	            clearTimeout(window.minPopupMessageDispalyedTimeoutHandle);
	            clearTimeout(window.maxPopupMessageDispalyedTimeoutHandle);
            },
            showPopup : function(sender, msg) {
	            
		            var message = new MessageQueue();
		            message.message = msg;
		            message.sender = sender;
		            popupMessages.push(message);
		            this.queuePopup();
	            
            },

        });