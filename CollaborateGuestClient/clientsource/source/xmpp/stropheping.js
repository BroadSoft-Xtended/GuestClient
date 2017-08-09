/*
 * This plugin is distributed under the terms of the MIT licence.
 * Please see the LICENCE file for details.
 *
 * Copyright (c) Markus Kohlhase, 2010
 * Refactored by Pavel Lang, 2011
 */
/**
 * File: stropheping.js
 * A Strophe plugin for XMPP Ping ( http://xmpp.org/extensions/xep-0199.html )
 */

var PING_INTERVAL = 600000; //Ping sent every 10 minutes

var PING_TIMEOUT = 10000;

Strophe.addConnectionPlugin('ping', {
    connection: null,
    // called by the Strophe.Connection constructor
    init: function(conn) {
        this.connection = conn;
        Strophe.addNamespace('PING', "urn:xmpp:ping");
        console.info("XMPP pings initialized ");
    },
    /**
     * Function: ping
     *
     * Parameters:
     * (String) to - The JID you want to ping
     * (Function) success - Callback function on success
     * (Function) error - Callback function on error
     * (Integer) timeout - Timeout in milliseconds
     */
    ping: function(jid, success, error, timeout) {
        var id = this.connection.getUniqueId('ping');
        var iq = $iq({
            type: 'get',
            to: jid,
            id: id
        }).c(
            'ping', {
                xmlns: Strophe.NS.PING
            });
        
        //Ping should be sent only when Desktop Sharing or Call is active
        //if(isDesktopSharingActive || isCallActive){
        	console.info("Ping sent");
        	this.connection.sendIQ(iq, success, error, timeout);
        //}
    },
    
    /**
     * Starts to send ping in given interval to specified remote JID.
     * This plugin supports only one such task and <tt>stopInterval</tt>
     * must be called before starting a new one.
     * @param remoteJid remote JID to which ping requests will be sent to.
     * @param interval task interval in ms.
     */
    startInterval: function(remoteJid, interval) {
    	 console.info("XMPP ping interval started ");
            if (this.intervalId) {
                console.error("Ping task scheduled already");
                return;
            }
            if (!interval)
                interval = PING_INTERVAL;
            var self = this;
            this.intervalId = window.setInterval(function() {
                self.ping(remoteJid,
                    function(result) {
                	console.info("Ping is successfull");
                        // Ping OK
                    },
                    function(error) {
                        console.error(
                            "Ping " + (error ? "error" : "timeout"), error);
                        //FIXME: react
                    }, PING_TIMEOUT);
            }, interval);
            console.info("XMPP ping will be sent every " + interval + " ms");
        },

        /**
         * Stops current "ping"  interval task.
         */
        stopInterval: function() {
            if (this.intervalId) {
                window.clearInterval(this.intervalId);
                this.intervalId = null;
                console.info("Ping interval cleared");
            }
        }
});