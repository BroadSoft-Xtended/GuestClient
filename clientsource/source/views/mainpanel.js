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
			id : "com.broadsoft.cgc.MainPanel",
			name : "kind.com.broadsoft.cgc.MainPanel",
			style:"width: 100%;height:100%;",
			components : [{
				kind : "enyo.FittableColumns",
				id : "com.broadsoft.cgc.ProfilePanel",
				name : "cgcProfilePanel",
				
				fit : true,
				style:"background-image:url('branding/assets/userprofile.png');",
				classes : "cgcHeaderBarStyle",
					components : [{
					tag : "div",
					name : "ProfileHeader",
					content : "",
					fit : true,
					classes : "cgcProfilePanel",
					rendered : function() {
						this.setContent(jQuery.i18n.prop(
								"cgc.label.room.title",
								window.cgcProfile.name));
					}
				}, {
						tag : "div",
						components : [{
							tag : "img",
							id : "com.broadsoft.cgc.CompanyLogo",
							name : "companyPageLogo",
							classes : "cgcCompanyLogo",
							src : "branding/assets/companylogo.png",
							}]
				}]
			}, {
				tag : "div",
				name : "mainBasePanel",
				style:"height:100%;"
			}],

			postLogin : function() {
				console
				.log("CollaborateGuestClient:mainpanels:postLogin: User has logined successfully");
				window.cgcComponent.basePanel = this.$.mainBasePanel.createComponent({
					kind : "kind.com.broadsoft.cgc.BasePanel",
					id : "BasePanel",
					name : "panels"
				});
				this.render();
			}
			
		});
