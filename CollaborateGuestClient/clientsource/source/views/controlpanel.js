/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

/**
 * This file constructs the sliding panels for the application
 */
var isErrorSent = false;
var callStarted = false;
enyo
		.kind({
			kind : "enyo.FittableRows",
			id : "com.broadsoft.cgc.ControlPanel",
			name : "kind.com.broadsoft.cgc.ControlPanel",
			style:"width: 100%;height:100%;position: fixed;",
			initialRoster : [],
			components : [{
				kind : "enyo.Signals",
				name : "loginsignal",
				layoutRefresh : "layoutRefresh",
				doFullScreen : "doFullScreen"
			}, 
			{
				tag : "div",
				name : "CapDiv",
				style:"height:2px;width:100%;background-color: #78B9CE;display: none;"
			},{
				tag : "div",
				name : "BasePanelDiv"
			}],
			resizeHandler : function() {
				this.inherited(arguments);
				this.layoutRefresh();
			},
			doFullScreen : function(){
				window.cgcComponent.basePanel.showFullScreen();
				this.resized();
			},
			postLogin : function() {
				console
				.log("CollaborateGuestClient:controlpanels:postLogin: User has logined successfully");
				window.cgcComponent.basePanel = this.$.BasePanelDiv.createComponent({
					kind : "kind.com.broadsoft.cgc.BasePanel",
					id : "BasePanel",
					name : "panels"
				});
				this.render();
				this.layoutRefresh();
			},
			getImage:function(resourceId){
				var img = undefined;
				for ( var i=0;i < window.cgcComponent.xmppInterface.backupRoster.length;i++) {
					var contact = window.cgcComponent.xmppInterface.backupRoster[i];
					if (contact != null && contact.resource == resourceId) {
						img = contact.image;
						break;
					}

				}
				return img;
			},
			getRole:function(senderUid){
				var role = "";
				for ( var i=0;i < window.cgcComponent.xmppInterface.backupRoster.length;i++) {
					var contact = window.cgcComponent.xmppInterface.backupRoster[i];
					if (contact != null && contact.resource == senderUid) {
						role = contact.owner;
						break;
					}

				}
				return role;
			},layoutRefresh : function(){
				var panelHeight = getHeight(this.id);
				this.$.BasePanelDiv.applyStyle("height",(panelHeight)+"px");
				window.cgcComponent.basePanel.layoutRefresh();
			}
			
		});
