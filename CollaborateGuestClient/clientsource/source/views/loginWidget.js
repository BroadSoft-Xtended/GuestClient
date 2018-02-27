/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

var isAccessRecaptcha = false;
var recaptchCapDiv = undefined;
var Recaptcha;
enyo.kind({
	kind : "Control",
	kind : "FittableRows",
	name : "kind.com.broadsoft.cgc.JoinPage",
//	fit : true,
	create : function() {
		this.inherited(arguments);
		window.cgcComponent.joinPage = this;
			document.title = htmlEscape(jQuery.i18n.prop(
					"cgc.label.room.title", window.cgcProfile.name));
	},
	components : [ 
	{
		tag : "div",
		id : "com.broadsoft.cgc.joinPageHeader",
		name : "toppaddingLoginpage",
		allowHtml : true,
		classes : "cgcJoinPageHeader",

		content : ""
	}, 
	{kind: "FittableColumns", style: "text-align:center;", components: [
	    {
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
				    kind: "kind.com.broadsoft.cgc.LoginWidgetActual",
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
		this.$.LoginBox.$.captchaError.setContent(errMsg);
	}
});


enyo
		.kind({
			name : "kind.com.broadsoft.cgc.LoginWidgetActual",
			components : [ {
				name : "LoginWidgetWrapper",
				classes : "cgcJoinPage",
				components : [
						{
							name : "LoginHeader",
							content : "",
							classes : "cgcLoginHeader bsftHeaders bsftMediumFont",
							allowHtml:true,
							rendered : function() {
								this.setContent(jQuery.i18n.prop("cgc.label.room.title",
										window.cgcProfile.name));
							}
						},
						{
							name : "RoomHeader",
							content : "",
							allowHtml : true,
							classes : "cgcRoomHeader cgcLoginPageLabel",
							rendered : function() {
								this.setContent(jQuery.i18n.prop(
										"cgc.info.sign-in.instruction",
										window.cgcProfile.name));
							}
						},
						{tag : "div", classes : "cgcRoomHeaderSeparator", name: "roomHeaderSeparator"},
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
												onkeypress : "avoidSpace",
												onkeyup : "joinKeyTap",
												onkeydown : "restrictPaste",
												defaultFocus : true
											} ]
										} ]
									},
									{tag : "div", classes : "cgcLoginInputSeparator", name: "firstNameSeparator"},
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
												onkeypress : "avoidSpace",
												onkeyup : "joinKeyTap",
												onkeydown : "restrictPaste"
											} ]
										} ]
									},
									
									{
										tag : "div",
										style : "padding-top:20px",
										name : "recaptchCap",
										classes : 'cgcHide'
									},
									{
										tag : "div",
										name : "captchaOuterBox",
										classes : "cgcCaptchaErrorBorderDiv cgcHide",
										components : [{
											tag : "div",
											id : "com.broadsoft.cgc.captchaErrorLabel",
											name : "captchaError",
											fit : true,
											allowHtml : true,
											classes : "cgcCaptchaErrorLabel bsftMediumFont bsftSymbolicRed cgcHide",

											content : ""
										},
										{
											tag : "div",
											name : "dynamic_recaptcha",
											id : "dynamic_recaptcha",
											allowHtml : true,

											rendered : function() {
												this.owner.captureImage(initate);

											}
										}]
									},
									{
										tag : "div",
										name : "loginDiv",
										classes : "cgcJoinButtonBox",
										components : [ {
											kind : "onyx.Button",
											id : "com.broadsoft.cgc.joinButton",
											name : "joinButton",
											disabled : true,
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
			captureImage : function(reInit) {
				if (window.cgcConfig.enableCaptcha == "true" && window.cgcConfig.reCaptchaPublicKey != "") {
					this.$.dynamic_recaptcha.addClass("cgcRecaptchaBox");

					recaptchCapDiv = this.$.captchaError;
					this.$.recaptchCap.removeClass("cgcHide");
					this.$.captchaOuterBox.removeClass("cgcHide");
					
					if(Recaptcha){
					var value = Recaptcha.create(window.cgcConfig.reCaptchaPublicKey,
							"dynamic_recaptcha", {
								theme : "white",
								callback : reInit
							});
					}else{
						LOGGER.API.warn("loginWidget:", "reCaptcha is not reachable");
						window.cgcComponent.viewControl.logOut(htmlEscape(jQuery.i18n.prop(
								"cgc.error.pa.provision",
								window.cgcProfile.name)),false);
					}
				}
			},

			doJoin : function(inSender, inEvent) {

				// validate recaptcha
				var recaptcha_challenge_field = "";
				var recaptcha_response_field = "";
				if (isAccessRecaptcha && window.cgcConfig.enableCaptcha == "true" && window.cgcConfig.reCaptchaPublicKey != "") {
					if (Recaptcha.get_response() == "") {
												
						window.cgcComponent.joinPage.showError(htmlEscape(jQuery.i18n
								.prop("cgc.error.captcha.response.failed")));
						this.$.joinButton.setDisabled(false);
						return;
					}

					recaptcha_challenge_field = Recaptcha.get_challenge();
					recaptcha_response_field = Recaptcha.get_response();
				}

				// start joining process

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
									impMucSeed : window.cgcProfile.mucseed,
									challenge : recaptcha_challenge_field,
									answered : recaptcha_response_field

								},
								function(data, textStatus, jqXHR) {

									window.cgcProfile.guestImpDetails = data;
									enyo.Signals.send("onLogin");

								})
						.fail(
								function(data, jqXHR, textStatus, errorThrown) {
									try{
										window.cgcProfile.guestImpDetails = JSON
										.parse(data.responseText);
									}catch(e){}
									
									if (window.cgcProfile.guestImpDetails && window.cgcProfile.guestImpDetails.error == 'cgc.error.captcha.response.failed') {
										LOGGER.API.warn("loginWidget:","There is an error with reCaptcha challenge and reCaptcha response: "
														+ data.responseText);
										window.cgcComponent.joinPage
												.showError(htmlEscape(jQuery.i18n
														.prop("cgc.error.captcha.response.failed")));
										window.cgcComponent.joinPage.$.LoginBox.reloadCaptcha();

									} else {
										LOGGER.API.warn("loginWidget:","Failed to provisioned the guest in the IMP domain: "
														+ data.responseText);
										enyo.Signals.send("onLogin");
									}

								});
			},

			reloadCaptcha : function() {
				
				this.$.joinButton.setDisabled(true);
				this.$.joinButton.addClass("cgcJoinButton");
				this.captureImage(reInitate);

			},
			restrictPaste : function(inSender, inEvent) {
				if (inEvent.ctrlKey == true && inEvent.keyCode === 86) {
					inEvent.preventDefault();
					return false;
				}
				return true;
			},
			avoidSpace : function(inSender, inEvent) {
				var firstName = this.$.FirstNameText.value;
				var lastName = this.$.LastNameText.value;
				if (inEvent.keyCode === 58 || inEvent.keyCode === 59
					|| (inEvent.keyCode >= 33 && inEvent.keyCode <= 47) 
					|| (inEvent.keyCode >= 60 && inEvent.keyCode <= 64)  
					|| (inEvent.keyCode >= 91 && inEvent.keyCode <= 96) 
					|| (inEvent.keyCode >= 123 && inEvent.keyCode <= 126)) {
					inEvent.preventDefault();
					return false;
				}
				return true;
			},
			isEnableAction : function(inSender, inEvent) {
				var firstName = this.$.FirstNameText.value;
				var lastName = this.$.LastNameText.value;
				if (firstName.trim().length != 0 && lastName.trim().length != 0
						&& ((window.cgcConfig.enableCaptcha == "false") || window.cgcConfig.reCaptchaPublicKey == "" ||  !isAccessRecaptcha ||
								(window.cgcConfig.enableCaptcha == "true" && window.cgcConfig.reCaptchaPublicKey != "" && Recaptcha.get_response().trim().length != 0))) {
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
var initate = function() {
	isAccessRecaptcha = true;
	var recaptcha_response_field_Div = document
			.getElementById('recaptcha_response_field');
	recaptcha_response_field_Div.addEventListener('keyup', function(e) {
		window.cgcComponent.joinPage.$.LoginBox.joinKeyTap(null, e);
	}, false);
	
}

var reInitate = function() {
	recaptchCapDiv.removeClass("cgcHide");
	initate();
	Recaptcha.focus_response_field();
}