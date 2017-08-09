/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

enyo.kind({
	kind : "Control",
	kind : "FittableRows",
	name : "kind.com.broadsoft.cgc.WaitForLeaderAcceptance",
	fit : true,
	create : function() {
		this.inherited(arguments);
		window.cgcComponent.joinPage = this;
		if (window.cgcProfile.err != undefined) {
			console.log("CollaborateGuestClient:loginWidget:create Login Page is not loaded for " + window.cgcProfile.err);
		} else {
			document.title = htmlEscape(jQuery.i18n.prop(
					"cgc.label.room.title", window.cgcProfile.name));
		}
	},
	components : [ {
		tag : "div",
		id : "com.broadsoft.cgc.joinPageHeader",
		name : "joinError",
		allowHtml : true,
		classes : "cgcJoinPageHeader",

		content : ""
	}, 

	{kind: "FittableColumns", style: "text-align:center;", components: [{
        classes : "cgcJoinPageOuterBox", 
        components:[
			{
				tag : "img",
				id : "com.broadsoft.cgc.joinPageLogo",
				name : "joinPageLogo",
				classes : "cgcJoinPageLogo",
				src : "branding/assets/applogo.png",
				
			},
			{tag : "div", classes : "cgcLogoSeperator", name: "logoSeperatorDIV"},
			{
				tag : "div",
				classes : "cgcJoinPage",
				components : [ {
					kind : "kind.com.broadsoft.cgc.WaitForLeaderAcceptanceWidget",
					id : "com.broadsoft.cgc.WaitForLeaderAcceptanceBox",
					name : "WaitForLeaderAcceptanceBox"
					
		
				}]
			}]
	    }
	
	]}
	
	]
});

enyo
	.kind({
		name : "kind.com.broadsoft.cgc.WaitForLeaderAcceptanceWidget",
		components : [
		              {
							kind : "Signals",
							onStatusMsg : "showStatusMessage"
						},
			{
				name : "LoginHeader",
				content : "",
				fit : true,
				classes : "cgcLoginHeader",
				rendered : function() {
					if(window.cgcProfile.name){
						this.setContent(jQuery.i18n.prop(
								"cgc.label.room.title",
								window.cgcProfile.name));
					}
				}
			},

			{

				tag : "div",
				classes : "cgcLoginOuterBox",
				components : [
								
								{
									tag : "div",
									classes : "cgcApploadingimgBox",
									name : "progressImage",
									allowHtml : true
								},
								{
									name : "statusMessageBox",
									content : "",
									allowHtml : true,
									fit : true,
									classes : "cgcStatusMessageBox"
								},
								{
									name : "statusProgressInfoMessageBox",
									content : "",
									allowHtml : true,
									fit : true,
									classes : "cgcStatusProgressInfoMessageBox"
								},
								{
									name : "statusProgressWarningMessageBox",
									content : "",
									allowHtml : true,
									fit : true,
									classes : "cgcStatusProgressWarningMessageBox"
								}
				]
			
			}
		],
		showStatusMessage : function(event, data) {
			if (data.message == "cgc.info.sign-in.progress.pending") {
				var opts = {
						  lines: 13, // The number of lines to draw
						  length: 10, // The length of each line
						  width: 5, // The line thickness
						  radius: 15, // The radius of the inner circle
						  corners: 1, // Corner roundness (0..1)
						  rotate: 0, // The rotation offset
						  direction: 1, // 1: clockwise, -1: counterclockwise
						  color: '#000', // #rgb or #rrggbb or array of colors
						  speed: 1, // Rounds per second
						  trail:60, // Afterglow percentage
						  shadow: false, // Whether to render a shadow
						  hwaccel: false, // Whether to use hardware acceleration
						  className: 'spinner', // The CSS class to assign to the spinner
						  zIndex: 2e9 // The z-index (defaults to 2000000000)
						  
						};
						var target = document.getElementById('com.broadsoft.cgc.WaitForLeaderAcceptanceBox_progressImage');
						window.spinner = new Spinner(opts).spin(target);
						//the following line is to make the image fixed to the progressImage box.
						//Without this if the screen is resized, then image also moves to different position
						document.getElementsByClassName('spinner')[0].style.position = "relative";
						//spinner.setStyle("position","relative");
						
						
				this.$.statusMessageBox
					.setContent(htmlEscape(jQuery.i18n.prop("cgc.info.sign-in.progress.pending")));
				
				this.$.statusProgressInfoMessageBox
				.setContent("<br>" + htmlEscape(jQuery.i18n.prop("cgc.info.sign-in.progress.status")));
				
				this.$.statusProgressWarningMessageBox
				.setContent("<br>" + htmlEscape(jQuery.i18n.prop("cgc.info.sign-in.progress.warning")));
				
			} else {
				
				if(window.spinner){
					window.spinner.stop();
				}
				this.$.progressImage.hide();
				if(data.message == "cgc.error.muc.guest.kicked" || data.message == "cgc.error.muc.session.closed"){
					this.$.statusMessageBox.setContent(htmlEscape(jQuery.i18n.prop(
							data.message,
							window.cgcProfile.name)));
					this.$.statusMessageBox.addClass("cgcInfoPanel");
				}else{
					
				if(data.message == "cgc.error.unsupported.browser"){
						this.$.statusMessageBox.setContent(htmlEscape(jQuery.i18n.prop(data.message,browserName+" v."+fullVersion)));
						this.$.statusProgressWarningMessageBox.removeClass("cgcStatusProgressWarningMessageBox");
						this.$.statusProgressWarningMessageBox.addClass("cgcStatusUnSupportedBrowerMessageBox");
						this.$.statusMessageBox.addClass("cgcBrowserSupportErrorPanel");
						this.$.statusProgressWarningMessageBox.setContent(htmlEscape(jQuery.i18n.prop("cgc.info.supported.browserlist")));
					}else{
						this.$.statusMessageBox.setContent(data.message);
						this.$.statusMessageBox.addClass("cgcErrorPanel");
					}
				}
			}
			
		
		}
	});






