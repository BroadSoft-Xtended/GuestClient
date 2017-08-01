/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

enyo.kind({
	kind : "Control",
	kind : "FittableRows",
	name : "kind.com.broadsoft.cgc.TimeoutJoinPage",
	fit : true,
	create : function() {
		this.inherited(arguments);
		window.cgcComponent.joinPage = this;
		if (window.cgcProfile.err != undefined) {
			console.log("CollaborateGuestClient:loginWidget:create Login Page is not loaded for " + window.cgcProfile.err);
			this.$.joinError.setContent(window.cgcProfile.err);
			this.$.joinPageLogo.destroy();
			this.$.LoginBox.destroy();
		} else {
			document.title = htmlEscape(jQuery.i18n.prop(
					"cgc.label.room.title", window.cgcProfile.name));
		}
	},
	components : [ 
	 {

			tag : "div",
			id : "com.broadsoft.cgc.rejoinHeader",
			name : "rejoinHeader",
			classes : "cgcTimeoutRejoinHeader",
		
	 },
	 {kind: "FittableColumns", fit: true, style: "text-align:center;", components: [{
	        classes : "cgcJoinPageOuterBox", 
		    components:[
				{
					
					tag : "div",
					classes : "cgcJoinPageLogoOuterBox",
					components : [ {
						
							tag : "img",
							id : "com.broadsoft.cgc.joinPageLogo",
							name : "joinPageLogo",
							classes : "cgcJoinPageLogo",
							src : "branding/assets/applogo.png",
							
					}]
					
				},
				{tag : "div", classes : "cgcLogoSeperator", name: "logoSeperatorDIV"},
				{
					name: "LoginBox",
				    kind: "kind.com.broadsoft.cgc.TimeoutLoginWidgetActual",
				    classes:"cgcLoginBox"
				
				},
				
				/*{
					tag : "div",
					id : "com.broadsoft.cgc.Footerbox",
					name : "Footerbox",
					allowHtml : true,
					classes : "cgcFooterbox",
					components : [ {
						tag : "div",
						classes : "cgcFooterInnerbox",
								components : [ {
									tag : "img",
									id : "com.broadsoft.cgc.CompanyLogo",
									name : "cgcCompanyLogo",
									classes : "cgcCompanyLogo",
									src : "branding/assets/companylogo.png",
									}]
					}]
				}*/
			]
	    },
	
	]}
	],

	
	showError : function(errMsg) {
		this.$.joinError.setContent(errMsg);
	}
});


enyo
		.kind({
			name : "kind.com.broadsoft.cgc.TimeoutLoginWidgetActual",
			components : [ {
				name : "LoginWidgetWrapper",
				classes : "cgcJoinPage",
				components : [
						{
							name : "LoginHeader",
							content : "",
							fit : true,
							classes : "cgcLoginHeader",
							allowHtml:true,
							rendered : function() {
								this.setContent(jQuery.i18n.prop(
										"cgc.label.room.title",
										window.cgcProfile.name));
							}
						},
						{
							tag : "div",
							components : [{
							name : "TimeoutHeader",
							content : "",
							allowHtml : true,
							classes : "cgcLoginError",
							rendered : function() {
								this.setContent(jQuery.i18n.prop(
										"cgc.error.muc.join.request.timeout"));
							}
							}]
						},						
						{tag : "div", style : "height : 7px;", name: "timeOutSeparator"},
						
						{
							tag : "div",
							classes : "cgcLoginOuterBox",
							components : [
									{
										tag : "div",
										classes : "cgcLoginInputBox",
										components : [ {
											name : "FirstName",
											kind : "onyx.InputDecorator",
											classes : "nice-padding cgcFirstandLastNameText",
											id : "loginFirstName",
											components : [ {
												name : "FirstNameText",
												kind : "onyx.Input",
												classes : "cgcLoginFirstAndLastNameText",
												fit : true,
												attributes : {
													oncontextmenu : "return false;",
													maxlength : 36,
													required : "required"
												},
												placeholder : htmlEscape(jQuery.i18n
														.prop("cgc.label.loginpage.firstname")),
												onkeydown : "avoidSpace",
												onkeyup : "joinKeyTap",
												defaultFocus : true
											} ]
										} ]
									},
									{tag : "div", style : "height : 7px;", name: "firstNameSeparator"},
									{
										tag : "div",
										classes : "cgcLoginInputBox",
										components : [ {
											name : "LastName",
											kind : "onyx.InputDecorator",
											classes : "nice-padding cgcFirstandLastNameText",
											id : "loginLastName",
											components : [ {
												name : "LastNameText",
												kind : "onyx.Input",
												classes : "cgcLoginFirstAndLastNameText",
												attributes : {
													oncontextmenu : "return false;",
													maxlength : 36,
													required : "required"
												},
												fit : true,
												placeholder : htmlEscape(jQuery.i18n
														.prop("cgc.label.loginpage.lastname")),
												onkeydown : "avoidSpace",
												onkeyup : "joinKeyTap"
											} ]
										} ]
									},
									{tag : "div", classes : "cgcJoinButtonBox", name: "joinButtonTopPadding"},
									{
										tag : "div",
										name : "loginDiv",
										components : [ {
											kind : "onyx.Button",
											id : "com.broadsoft.cgc.joinButton",
											name : "joinButton",
											disabled : true,
											classes : "cgcJoinButton",
											events: {
												onmousemove : "onBlurLoginButtonColor",
												onmouseout : "onOutLoginButtonColor",
												ondown : "onSelectLoginButtonColor",
												onleave : "onReleaseLoginButtonColor"
											 },
											attributes : {
												title : htmlEscape(jQuery.i18n
														.prop("cgc.label.loginpage.join"))
											},
											content : htmlEscape(jQuery.i18n
													.prop("cgc.label.loginpage.join")),
											ontap : "doJoin",

										} ]
									} ]
						} ]
			} ],
			doJoin : function(inSender, inEvent) {

				window.cgcProfile.firstName = this.$.FirstNameText.value;
				window.cgcProfile.lastName = this.$.LastNameText.value;

				this.$.joinButton.setDisabled(true);
				$
				.post(
						urls.paServletUrl,
						{
							leaderBWUserId : window.cgcProfile.broadworksId,
							impFirstName : window.cgcProfile.firstName,
							impLastName : window.cgcProfile.lastName,
							impMucHash : window.cgcProfile.muchashedroom,
							impMucSeed : window.cgcProfile.mucseed

						},
						function(data, textStatus, jqXHR) {
							console.log(data);
							window.cgcProfile.guestImpDetails = data;

							console
									.log("CollaborateGuestClient:loginWidget:doJoin Successfuly received response against provisioning the guest in the IMP guest domain");
								enyo.Signals.send("onLogin");

						})
				.fail(
						function(data, jqXHR, textStatus, errorThrown) {

							window.cgcProfile.guestImpDetails = JSON
							.parse(data.responseText);
							if (window.cgcProfile.guestImpDetails.error == 'cgc.error.captcha.response.failed') {
								console
										.log("CollaborateGuestClient:loginWidget:doJoin There is an error with reCaptcha challenge and reCaptcha response: "
												+ data.responseText);
								window.cgcComponent.joinPage
										.showError(htmlEscape(jQuery.i18n
												.prop("cgc.error.captcha.response.failed")));
								window.cgcComponent.joinPage.$.LoginBox.reloadCaptcha();

							} else {
								console
										.log("CollaborateGuestClient:loginWidget:doJoin Failed to provisioned the guest in the IMP domain: "
												+ data.responseText);
								enyo.Signals.send("onLogin");
							}

						});
			},


			avoidSpace : function(inSender, inEvent) {
				var firstName = this.$.FirstNameText.value;
				var lastName = this.$.LastNameText.value;
				if (inEvent.keyCode === 192
						|| (inEvent.shiftKey == true && inEvent.keyCode > 47 && inEvent.keyCode < 58)
						|| inEvent.keyCode === 192 || inEvent.keyCode === 191
						|| inEvent.keyCode === 190 || inEvent.keyCode === 188
						|| inEvent.keyCode === 222 || inEvent.keyCode === 186
						|| inEvent.keyCode === 219 || inEvent.keyCode === 221
						|| inEvent.keyCode === 111 || inEvent.keyCode === 106
						|| inEvent.keyCode === 109 || inEvent.keyCode === 107) {
					inEvent.preventDefault();
					return false;
				}
				if (inEvent.ctrlKey == true && inEvent.keyCode === 86) {
					inEvent.preventDefault();
					return false;
				}
				return true;
			},
			isEnableAction : function(inSender, inEvent) {
				var firstName = this.$.FirstNameText.value;
				var lastName = this.$.LastNameText.value;
				if (firstName.trim().length != 0 && lastName.trim().length != 0) {
					return true;
				}
				return false;
			},
			joinKeyTap : function(inSender, inEvent) {

				var limitNum = 36;
				var firstName = this.$.FirstNameText.value;
				var lastName = this.$.LastNameText.value;
				
				if (firstName.length == 0){
					this.$.FirstName.removeClass("cgcFirstandLastNameActiveTextBorder");
					this.$.FirstNameText.removeClass("cgcLoginFirstAndLastNameTextColor");
				} else {
					this.$.FirstName.addClass("cgcFirstandLastNameActiveTextBorder");
					this.$.FirstNameText.addClass("cgcLoginFirstAndLastNameTextColor");
				}
				
				if (lastName.length == 0){
					this.$.LastName.removeClass("cgcFirstandLastNameActiveTextBorder");
					this.$.LastNameText.removeClass("cgcLoginFirstAndLastNameTextColor");
				} else {
					this.$.LastName.addClass("cgcFirstandLastNameActiveTextBorder");
					this.$.LastNameText.addClass("cgcLoginFirstAndLastNameTextColor");
				}

				if (firstName.length != 0 && firstName.length > limitNum) {
					this.$.FirstNameText.set("value", firstName.substring(0,
							limitNum));
				}
				if (lastName.length != 0 && lastName.length > limitNum) {
					this.$.LastNameText.set("value", lastName.substring(0,
							limitNum));
				}
				if (this.isEnableAction()) {

					this.$.joinButton.setDisabled(false);
					this.onOutLoginButtonColor(inSender, inEvent);
				} else {
					this.$.joinButton.setDisabled(true);
					this.$.joinButton.removeClass("cgcJoinButtonActiveColor");
					this.$.joinButton.removeClass("cgcJoinButtonOnBlurColor");
					this.$.joinButton.addClass("cgcJoinButton");
					return;
				}

				if (inEvent && inEvent.keyCode === 13) {

					this.doJoin(inSender, inEvent);
				}

			},
			
			onBlurLoginButtonColor : function(inSender, inEvent) {
				if(this.isEnableAction()){
				this.$.joinButton.removeClass(".cgcJoinButtonOnBlurColor");
				this.$.joinButton.removeClass("cgcJoinButtonActiveColor");
				this.$.joinButton.addClass("cgcJoinButtonOnBlurColor");
				}
			},

			onOutLoginButtonColor : function(inSender, inEvent) {
				if(this.isEnableAction()){
				this.$.joinButton.addClass("cgcJoinButtonActiveColor");
				}
			},
			
			onSelectLoginButtonColor : function(inSender, inEvent) {
				if(this.isEnableAction()){
				this.$.joinButton.addClass("cgcJoinButtonOnSelectColor");
				}
			},
			
			onReleaseLoginButtonColor : function(inSender, inEvent) {
				if(this.isEnableAction()){
				this.$.joinButton.removeClass("cgcJoinButtonOnSelectColor");
				this.$.joinButton.addClass("cgcJoinButtonActiveColor");
				}
			}
		});



