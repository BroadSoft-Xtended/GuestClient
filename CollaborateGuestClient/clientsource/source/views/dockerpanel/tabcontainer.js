/**
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

enyo.kind({
	name: "onyx.custom.TabBar",
	kind: "onyx.RadioGroup",
	controlClasses: "onyx-tabbutton",
	
	adjustChildren: function () {
		var children = this.getControls();
		var elWidth = (this.getBounds()).width/children.length;
		for (var i=0;i<children.length;i++) {
			var b = children[i].getBounds();
            // width is computed this way so that we can divide 
            // uneven amounts of space (like, say 577px divided
            // into 5 tabs)
			var w = Math.floor(elWidth*(i+1)) - Math.floor(elWidth*i);
			b.width = (w-1)+"px";
//			b.height = "37px";
			children[i].setBounds(b);
		}
	},
	
	reflow: function () {
		this.inherited(arguments);
		this.adjustChildren();
	},
	
	rendered: function () {
		this.inherited(arguments);
		this.adjustChildren();
	},
	
	create: function () {
		this.inherited(arguments);
		this.adjustChildren();
	}
});

enyo.kind({
    name: "kind.cgc.com.broadsoft.TabNavigator",
    kind: "FittableRows",
    classes: "enyo-fit",
    components: [
        {tag:"div",classes:"cgcDockerNavicationHeader bsftPrimarySeparator",
        	components:[{name:"tabBar",classes:"cgcDockerNavicationContent", kind: "onyx.custom.TabBar",  components: [
            {name : "radioButton",
            	allowHtml:true,
            	content: htmlEscape(jQuery.i18n
					.prop("cgc.label.participants")) , 
					classes:"cgcNavigationButton bsftHeaders bsftPrimarySeparator cgcBorderNone bsftMediumFont", 
					active: true, index: 0, 
					ontap: "switchTabs"
						}],
        
        switchTabs: function (inSender, inResponse) {
        	this.owner.owner.$.tabNavigator.switchTabs(inSender, inResponse);
        	}
        	}]
        },
        {
        	name: "AppViews", 
        	kind: "Panels", 
        	style : "width: 100%;height:100%", 
        	fit: true,
        	draggable: false,
        	components: [{
		     		name : "participantContent",
		    		kind : "enyo.FittableRows",
		    		classes: "cgcParticipantContent",
		    		components : [{
			     		name : "userHeader",
			    		kind : "enyo.FittableColumns",
			    		classes : "cgcParticipantYou bsftSeparators",
			    		components : [
								{
									tag : "div",
//									style : "line-height:48px;width:35px;vertical-align-middle;",
									classes : "cgcParticipantAvatarContainer",
									components : [{
										tag : "img",
										name : "Avatar",
										style : "height:35px;width:35px;vertical-align-middle;",
										showing : false
									},
									{
										tag : "div",
										classes: "cgcParticipantDefaultAvatar bsftChatPrimaryText bsftDefaultAvatarBorder bsftFontRobotoLightItalic ",
										showing : true,
										content: "",
										rendered : function() {
											if(window.cgcProfile.name.length > 35){
												this.setAttribute("title", jQuery.i18n.prop("cgc.label.room.title",
														getFirstAndLastName_Character(window.cgcProfile.guestImpDetails)));
											}
											this.setContent(getFirstAndLastName_Character(window.cgcProfile.guestImpDetails));
										}
									}]
									
								},{
			    			kind : "enyo.FittableColumns",
			    			classes : "cgcDisplayInline",
			    			fit : true,
			    			components:[{
				    			tag : "div",
				    			classes:"cgcGuestProfile bsftPrimaryContentText bsftMediumFont",
				    			allowHtml : true,
				    			attributes : {
				    				title : ""
				    			},
				    			rendered : function() {
									this.setContent(window.cgcProfile.firstName+" "+window.cgcProfile.lastName);
									var namelength = window.cgcProfile.firstName.length+window.cgcProfile.lastName.length;
									if(namelength > 35){
										this.setAttribute("title",window.cgcProfile.firstName+" "+window.cgcProfile.lastName);
									}
								}
//				    		},{
//				    			tag : "div",
//				    			classes:"cgcGuestYou",
//				    			allowHtml : true,
//				    			rendered : function() {
//									this.setContent("(" + jQuery.i18n.prop(
//											"cgc.label.you") + ")");
//								}
				    		}]
			    		}]
		    		},
		        {
		    		kind : "enyo.Scroller",
		    		name : "contactItems",
		    		ontap:"setScrollofParicipants",
		    		components : [],
		    		autoScroll : function() {
		    			if(window.navigator.platform.toLowerCase().indexOf('mac') !== -1){
		    				this.addClass("cgcContactPanelMac");
		    			}else{
		    				this.addClass("scrollbar-inner");
		    				this.addClass("cgcContactPanelNonMac");
		    			}
		    			
		    			var pScrollerHeight = (getHeight(this.owner.id) - 94) + "px !important";
		    			this.applyStyle("max-height",pScrollerHeight);
						this.applyStyle("min-height",pScrollerHeight);
						
		    			window.heightOfParticipantsDiv = this.id;
		    			var scroller = document.getElementById(window.heightOfParticipantsDiv);
		    			if(scroller != null){
		    				
		    				var height = scroller.scrollHeight - $(scroller).height();
		    				$("#"+window.heightOfParticipantsDiv).scrollTop( height );
		    				window.heightOfParticipantsPanel = getHeight(this.owner.id);
		    				window.participantsCustomScrollar = jQuery('.scrollbar-inner').scrollbar();
		    				window.participantsCustomScrollar.setScrollCurrentPosition(height);
		    			}
		    		}
		    	}]
			},
            {
				name:"ChatContainer",
				classes:"cgcChatContainer",
				tag:"div"
			}
        ]}
    ],
	setScrollofParicipants : function(inSender, inEvent){
		window.isChatPanel = false;
		window.isParicipantsPanel = true;
	},
    
    switchTabs: function (inSender, inResponse) {
    	var children = this.owner.$.tabNavigator.$.tabBar.getControls();
    	if(children.length == 2){
	    	if(inResponse.originator.index == 1){
	    		window.cgcComponent.basePanel.setIsChatPaneShowing(true)
	    		
	    		if(this.owner.$.tabNavigator.$.radioButton){
	    			this.owner.$.tabNavigator.$.radioButton.removeClass("cgcActiveNavigator");
	    			this.owner.$.tabNavigator.$.radioButton.addClass("cgcDeactive");
	    		}
	    		if(this.owner.$.tabNavigator.$.tabBar.$.radioButton){
	    			this.owner.$.tabNavigator.$.tabBar.$.radioButton.removeClass("cgcDeactive");
	    			this.owner.$.tabNavigator.$.tabBar.$.radioButton.addClass("cgcActiveNavigator");
	    			
	    		}
	    		window.cgcComponent.basePanel.hideChatPopup();
	    		this.owner.$.tabNavigator.$.ChatContainer.$.chatPanel.autoscroll();
	    	}else{
	    		if(this.owner.$.tabNavigator.$.radioButton){
	    			this.owner.$.tabNavigator.$.radioButton.addClass("cgcActiveNavigator");
	    			this.owner.$.tabNavigator.$.radioButton.removeClass("cgcDeactive");
	    		}
	    		if(this.owner.$.tabNavigator.$.tabBar.$.radioButton){
	    			this.owner.$.tabNavigator.$.tabBar.$.radioButton.addClass("cgcDeactive");
	    			this.owner.$.tabNavigator.$.tabBar.$.radioButton.removeClass("cgcActiveNavigator");
	    			
	    		}
	    		window.cgcComponent.basePanel.setIsChatPaneShowing(false);
	    	}

	    	
    	}
        this.$.AppViews.setIndex(inResponse.originator.index);
    }
});


//participant record
enyo.kind({
	
	layoutKind : "FittableColumnsLayout",
	name : "kind.com.broadsoft.cgc.RosterItem",
	
	classes : "cgcParticipantDetails bsftSeparators",
	published : {
        isLeader:false,
    },

	components : [ {
		tag : "div",
//		style : "line-height:48px;width:35px;vertical-align:middle;",
		classes : "cgcParticipantAvatarContainer",
		components : [{
			tag : "img",
			name : "Avatar",
			classes : "cgcParticipantAvatar",
			showing : false
		},
		{
			tag : "div",
			name : "defaultAvatar",
			classes: "cgcParticipantDefaultAvatar bsftChatPrimaryText bsftDefaultAvatarBorder bsftFontRobotoLightItalic ",
			showing : true,
			content: ""
		}]
		
	},{
		kind :"enyo.FittableColumns",
		
		fit : true,
		components : [ {
			tag : "div",
			name : "RosterName",
			allowHtml : true,
			classes : "cgcParticipantRecord bsftPrimaryContentText bsftMediumFont",
			attributes : {
				title : ""
			}
//		},{
//			tag : "div",
//			name : "RosterRole",
//			classes :"cgcGuestRole",
//			allowHtml : true
		} ]
	} ],
	updateImage : function(img) {
		if(img != null){
			this.$.Avatar.setSrc(img);
			this.$.Avatar.setShowing(true);
			this.$.defaultAvatar.setShowing(false);
		}
	}
});