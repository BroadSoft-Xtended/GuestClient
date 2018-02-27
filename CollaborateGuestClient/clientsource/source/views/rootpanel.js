/**
 * BroadWorks
 * Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
 * Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
 */

/**
 * This is the rootpanel of the application which holds the main window on successful login
 */
enyo.kind({
    kind : "enyo.FittableRows",
    id : "com.broadsoft.cgc.RootPanel",
    name : "kind.com.broadsoft.cgc.RootPanel",
    style : "width: 100%;height:100%;position: fixed;",
    components : [ {
        kind : "enyo.Signals",
        name : "layoutSignals",
        layoutRefresh : "layoutRefresh",
        doFullScreen : "doFullScreen"
    }, {
        tag : "div",
        name : "BasePanelDiv"
    } ],
    doFullScreen : function() {
	    window.cgcComponent.basePanel.showFullScreen();
	    this.resized();
    },
    showMainWindow : function() {
	    if (LOGGER.API.isInfo()) {
		    LOGGER.API.info("rootpanel.js", "Showing the main application window on successful login");
	    }

	    window.cgcComponent.basePanel = this.$.BasePanelDiv.createComponent({
	        kind : "kind.com.broadsoft.cgc.BasePanel",
	        id : "BasePanel",
	        name : "panels"
	    });
	    this.render();
	    this.layoutRefresh();
    },
    layoutRefresh : function() {
	    var panelHeight = getHeight(this.id);
	    this.$.BasePanelDiv.applyStyle("height", (panelHeight) + "px");
	    window.cgcComponent.basePanel.layoutRefresh();
    }

});
