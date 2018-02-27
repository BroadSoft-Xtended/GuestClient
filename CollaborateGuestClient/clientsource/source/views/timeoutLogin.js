/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

enyo.kind({
	kind : "Control",
	kind : "FittableRows",
	name : "kind.com.broadsoft.cgc.TimeoutJoinPage",
//	fit : true,
	create : function() {
		this.inherited(arguments);
		window.cgcComponent.joinPage = this;
		if (window.cgcProfile.err != undefined) {
            
            LOGGER.API.warn("timeoutLogin.js", "Could not load login page due to invalid profile " + window.cgcProfile.err);
			this.$.joinError.setContent(window.cgcProfile.err);
			this.$.joinPageLogo.destroy();
			this.$.LoginBox.destroy();
		} else {
			document.title = htmlEscape(jQuery.i18n.prop(
					"cgc.label.room.title", window.cgcProfile.name));
		}
	},
	components : [ 
	 {kind: "FittableColumns", fit: true, style: "text-align:center;", components: [{
	        classes : "cgcJoinPageOuterBox bsftSeparators", 
		    components:[
				{
					
					tag : "div",
					classes : "cgcJoinPageLogoOuterBox",
					components : [ {
						
							tag : "img",
							id : "com.broadsoft.cgc.joinPageLogo",
							name : "joinPageLogo",
							classes : "cgcJoinPageLogo",
							src : "branding/assets/applogo.png?ts=" + window.ts,
							
					}]
					
				},
				{tag : "div", classes : "cgcLogoSeperator", name: "logoSeperatorDIV"},
				{
					name: "LoginBox",
				    kind: "kind.com.broadsoft.cgc.TimeoutLoginWidgetActual",
				    classes:"cgcLoginBox"
				
				},
				{
					tag : "div",
					classes : "cgcJoinPageFooterBox",
					components : [ {
							tag : "img",
							id : "com.broadsoft.cgc.joinPageLogo",
							name : "joinPageFooter",
							classes : "cgcJoinPageFooterLogo",
							src : "branding/assets/footer_logo_129x29.png?ts=" + window.ts,
					}]
				}
				

			]
	    },
		{
			tag : "div",
			classes : "cgcAppVersion bsftVersionText",
			content : window.cgcConfig.warVersion
		}
	
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
							classes : "cgcLoginHeader bsftHeaders bsftMediumFont",
							allowHtml:true,
							rendered : function() {
								this.setContent(jQuery.i18n.prop(
										"cgc.label.room.title",
										window.cgcProfile.name));
							}
						},
						{
							tag : "div",
							classes: "cgcLoginTimeoutErrorBox",
							components : [{
							name : "TimeoutHeader",
							content : "",
							allowHtml : true,
							classes : "cgcLoginTimeoutError bsftMediumFont bsftSymbolicRed",
							rendered : function() {
								this.setContent(jQuery.i18n.prop(
										"cgc.error.muc.join.request.timeout"));
							}
							}]
						},						
						{tag : "div", classes : "cgcRoomHeaderSeparator", name: "timeOutSeparator"},
						
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
											classes : "nice-padding cgcFirstandLastNameText bsftContentBackground bsftInputFieldOutline bsftInputBoxBorder",
											id : "loginFirstName",
											components : [ {
												name : "FirstNameText",
												kind : "onyx.Input",
												classes : "cgcLoginFirstAndLastNameText bsftDimmedText bsftPrimaryContentText",
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
											classes : "nice-padding cgcFirstandLastNameText bsftContentBackground bsftInputFieldOutline bsftInputBoxBorder",
											id : "loginLastName",
											components : [ {
												name : "LastNameText",
												kind : "onyx.Input",
												classes : "cgcLoginFirstAndLastNameText bsftDimmedText bsftPrimaryContentText",
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
									{
										tag : "div",
										name : "loginDiv",
										classes : "cgcJoinButtonBox",
										components : [ {
											kind : "onyx.Button",
											id : "com.broadsoft.cgc.joinButton",
											name : "joinButton",
											disabled : false,
											classes : "cgcJoinButton bsftPrimaryButton bsftPrimaryButtonReverse",
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
			create: function(){
				this.inherited(arguments);
				this.$.FirstNameText.setValue(window.cgcProfile.firstName);
				this.$.LastNameText.setValue(window.cgcProfile.lastName);
			},
			doJoin : function(inSender, inEvent) {

				window.cgcProfile.firstName = this.$.FirstNameText.value;
				window.cgcProfile.lastName = this.$.LastNameText.value;

				this.$.joinButton.setDisabled(true);
				$
				.post(
						window.cgcConfig.ServiceAPIs.paServletUrl,
						{
							leaderBWUserId : window.cgcProfile.broadworksId,
							impFirstName : window.cgcProfile.firstName,
							impLastName : window.cgcProfile.lastName,
							impMucHash : window.cgcProfile.muchashedroom,
							impMucSeed : window.cgcProfile.mucseed

						},
						function(data, textStatus, jqXHR) {
							if(LOGGER.API.isDebug()){
                                LOGGER.API.debug("timeoutLogin.js:", "doJoin Successfuly received response against provisioning the guest in the IMP guest domain", data);
								
                            }
							window.cgcProfile.guestImpDetails = data;
                           
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
					this.$.joinButton.addClass("cgcJoinButton");
					return;
				}

				if (inEvent && inEvent.keyCode === 13) {

					this.doJoin(inSender, inEvent);
				}

			},
			
			onBlurLoginButtonColor : function(inSender, inEvent) {
			},

			onOutLoginButtonColor : function(inSender, inEvent) {
			},
			
			onSelectLoginButtonColor : function(inSender, inEvent) {
				if(this.isEnableAction()){
				this.$.joinButton.addClass("cgcJoinButtonOnSelectColor");
				}
			},
			
			onReleaseLoginButtonColor : function(inSender, inEvent) {
				if(this.isEnableAction()){
				this.$.joinButton.removeClass("cgcJoinButtonOnSelectColor");
				}
			}
		});



