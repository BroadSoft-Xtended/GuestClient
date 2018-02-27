/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

/**
 * Define and instantiate your enyo.Application kind in this file. Note,
 * application rendering should be deferred until DOM is ready by wrapping it in
 * a call to enyo.ready().
 */


enyo.kind({
	name : "com.broadsoft.CollaborateGuestClient",
	kind : "enyo.Application",
	view : "kind.com.broadsoft.cgc.viewControl",
	classes : "cgcCollaborateGuestClient",
	constructor : function() {
		this.inherited(arguments);
		this.parseJoinURL();

	},
	create : function() {
		this.inherited(arguments);

		window.app = this;

	},

	parseJoinURL : function() {
		
		window.cgcProfile.urlPathArray = window.location.pathname.split('/');
		try {
			var query = window.location.search.substring(1);
			var value = query.indexOf("=");
			var param = query.slice(value + 1);
			if (param.trim().length != 0) {
				var data = decodeURIComponent(escape(atob(param)));
				var profileData = data.split(',');
				var len = profileData.length;
                if (len >= 4) {
					window.cgcProfile.name=window.escapeHTML(data.slice(0, data.lastIndexOf(profileData[len-3])-1));
					window.cgcProfile.broadworksId = profileData[len-3];
					window.cgcProfile.mucseed = profileData[len-2];
					window.cgcProfile.muchashedroom = profileData[len-1];
				} else {
					window.cgcProfile.err = "cgc.error.loginpage.url.invalid";
				}
			} else {
				window.cgcProfile.err = "cgc.error.loginpage.url.invalid";
			}

		} catch (e) {
			window.cgcProfile.err = "cgc.error.loginpage.url.invalid";

		}

	}
});

enyo.ready(function() {
	new com.broadsoft.CollaborateGuestClient();
});
