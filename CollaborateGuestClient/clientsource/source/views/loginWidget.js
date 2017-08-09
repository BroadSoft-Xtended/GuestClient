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
	fit : true,
	create : function() {
		this.inherited(arguments);
		window.cgcComponent.joinPage = this;
			document.title = htmlEscape(jQuery.i18n.prop(
					"cgc.label.room.title", window.cgcProfile.name));
	},
	components : [ {
		tag : "div",
		id : "com.broadsoft.cgc.joinPageHeader",
		name : "joinError",
		allowHtml : true,
		classes : "cgcJoinPageHeader",

		content : ""
	}, 
	{kind: "FittableColumns", fit: true, style: "text-align:center;", components: [
	    {
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
				    kind: "kind.com.broadsoft.cgc.LoginWidgetActual",
				    classes:"cgcLoginBox"
					
				},
				
			]
	    },
	
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
							classes : "cgcLoginHeader",
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
							classes : "cgcRoomHeader",
							rendered : function() {
								this.setContent(jQuery.i18n.prop(
										"cgc.info.sign-in.instruction",
										window.cgcProfile.name));
							}
						},
						{tag : "div", style : "height : 32px;", name: "roomHeaderSeparator"},
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
												onkeypress : "avoidSpace",
												onkeyup : "joinKeyTap",
												onkeydown : "restrictPaste",
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
										classes : "cgcCaptchaErrorBorderDiv",
										components : [{
											tag : "div",
											id : "com.broadsoft.cgc.captchaErrorLabel",
											name : "captchaError",
											fit : true,
											allowHtml : true,
											classes : "cgcCaptchaErrorLabel cgcHide",

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
			captureImage : function(reInit) {
				if (window.cgcConfig.enableCaptcha == "true" && window.cgcConfig.reCaptchaPublicKey != "") {
					this.$.dynamic_recaptcha.addClass("cgcRecaptchaBox");
					console.log("CollaborateGuestClient:loginWidget:captureImage Request for getting captcha image");
					recaptchCapDiv = this.$.captchaError;
					this.$.recaptchCap.removeClass("cgcHide");
					
					if(Recaptcha){
					var value = Recaptcha.create(window.cgcConfig.reCaptchaPublicKey,
							"dynamic_recaptcha", {
								theme : "white",
								callback : reInit
							});
					}else{
						console
						.log("CollaborateGuestClient:loginWidget: reCaptcha is not reachable");
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
						console.log("CollaborateGuestClient:loginWidget:doJoin validate recaptcha");
						
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
								urls.paServletUrl,
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

			reloadCaptcha : function() {
				
				this.$.joinButton.setDisabled(true);
				this.$.joinButton.removeClass("cgcJoinButtonOnBlurColor");
				this.$.joinButton.removeClass("cgcJoinButtonOnSelectColor");
				this.$.joinButton.removeClass("cgcJoinButtonActiveColor");
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
					this.$.joinButton.removeClass("cgcJoinButtonOnBlurColor");
					this.$.joinButton.removeClass("cgcJoinButtonActiveColor");
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