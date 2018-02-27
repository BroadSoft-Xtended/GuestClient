(function(window) {

	var USSController = function() {
		var xmppInterface = null;

		var ussWrapper = null;
		var ussConfig = {
		    ussUrl : "",
		    jid : null,
		    roomID : null,
		    email : null,
		    name : null,
		    ownerJid:null
		}

		function replaceProtocol(url) {

			if (url != null) {
				url = url.replace('http', 'ws');

			}
			return url;
		}

		this.startUSSConnection = function(url, jid, email, name, roomid,
		        _xmppInterface) {
			if (ussWrapper == null) {
				jid = jid.split("/")[0];
				xmppInterface = _xmppInterface;

				ussConfig.ussUrl = replaceProtocol(url);
				ussConfig.jid = jid;
				ussConfig.roomID = roomid;
				ussConfig.email = email;
				ussConfig.name = name;
				ussConfig.ownerJid= window.cgcProfile.guestImpDetails.ownerId;

				ussWrapper = new USSClass(ussConfig);
				// register callbacks
				ussWrapper.onShareStartStop = function onShareStartStop(
				        refThis, isShareActive, src, lastSharer, floorHolder) {
					var srcName = null;

					// if share is active from a participant
					if (isShareActive) {
						// if the new share is the guest
						srcName = xmppInterface.getContactNameFromJid(src);

						// if share of lastSharer stopped by src
						if (lastSharer == ussConfig.jid && lastSharer != src) {

							enyo.Signals
							        .send(
							                "onChatInfoMessage",
							                {
							                    message : htmlEscape(jQuery.i18n
							                            .prop(
							                                    "cgc.info.uss.screenshare.participantinterrupt",
							                                    srcName)),
							                    avatar : false
							                });
						}

						window.currentSharer = srcName;
						enyo.Signals.send("onChatInfoMessage",
						        {
						            message : htmlEscape(jQuery.i18n.prop(
						                    "cgc.info.uss.screenshare.start",
						                    srcName)),
						            avatar : false
						        });

						// show the screen share panel if the current sharer is
						// not the guest
						if (src != ussConfig.jid) {

							window.cgcComponent.basePanel
							        .showScreenSharePanel();
						}

					} else {

						var source = src ? src : (lastSharer?lastSharer:floorHolder);

						srcName = xmppInterface.getContactNameFromJid2(source);

						window.currentSharer = "";
						if(srcName){
							enyo.Signals.send("onChatInfoMessage", {
							    message : htmlEscape(jQuery.i18n.prop(
							            "cgc.info.uss.screenshare.stop", srcName)),
							    avatar : false
							});
						}
						

						// When guest share is stopped.
						if (source == ussConfig.jid ) {
							enyo.Signals.send("onShareStartStopSignal", {
								desktopShare : "stop"
							});
						}
						// When other participant's share is stopped.
						else {
							window.cgcComponent.basePanel
							        .removeScreenSharePanel();
						}

					}

				};
				ussWrapper.onBaseImage = function(imageFormat, shareDetails,
				        imageData) {
					if (window.cgcComponent.basePanel.getScreenSharePanel()) {
						window.cgcComponent.basePanel.getScreenSharePanel()
						        .onShareBaseImage(imageFormat, shareDetails,
						                imageData);
					}

				};
				ussWrapper.onImageDeltas = function(imageFormat, shareDetails,
				        imageData) {
					if (window.cgcComponent.basePanel.getScreenSharePanel()) {
						window.cgcComponent.basePanel.getScreenSharePanel()
						        .onShareImageDeltas(imageFormat, shareDetails,
						                imageData);
					}

				};

				ussWrapper.onCursorImage = function(imageformat,
				        cursorImageData, posX, posY) {
					if (window.cgcComponent.basePanel.getScreenSharePanel()) {
						window.cgcComponent.basePanel.getScreenSharePanel()
						        .onCursorImageUpdate(imageformat,
						                cursorImageData, posX, posY);
					}

				};
				ussWrapper.onStartError = function(){
					//same as onDisconnect
					
                    LOGGER.API.warn("ussController.js", "Problem starting the USS session" );

					window.cgcComponent.basePanel.removeScreenSharePanel();

					if (ussConfig.reconnectCallBack) {
						ussConfig.reconnectCallBack();
						ussConfig.reconnectCallBack = null;
					}
					enyo.Signals.send("onShareStartStopSignal", {
						desktopShare : "stop"
					});

					ussWrapper = null;
					delete ussWrapper;
				};
				ussWrapper.onDisconnect = function(refUSS) {
					if (refUSS.isGraceFullyShareEnded != true) {
						enyo.Signals.send("onChatErrorMessage", {
							message : htmlEscape(jQuery.i18n
							        .prop("cgc.error.uss.screenshare"))
						});
					}

					window.cgcComponent.basePanel.removeScreenSharePanel();

					if (ussConfig.reconnectCallBack) {
						ussConfig.reconnectCallBack();
						ussConfig.reconnectCallBack = null;
					}
					enyo.Signals.send("onShareStartStopSignal", {
						desktopShare : "stop"
					});

					ussWrapper = null;
					delete ussWrapper;
				};
				ussWrapper.onStarted = function(uss) {

					if (uss.isFloorHolder()) {
						enyo.Signals.send("onShareStartStopSignal", {
							desktopShare : "start"
						});
					}
				};
				ussWrapper.onScreenShareExtensionActiveDeactive = function (isActive) {
					if(!isActive){
						enyo.Signals.send("onShareStartStopSignal", {
							desktopShare : "stop"
						});
					}
					
				};
				ussWrapper.start();
			}

		}

		this.isUSSConnected = function() {
			return (ussWrapper != null) ? true : false;
		}

		this.isFloorHolder = function() {
			return (ussWrapper && ussWrapper.isFloorHolder());
		}
		this.startShare = function() {
			if (ussWrapper && ussWrapper.isFloorHolder()) {
				ussWrapper.start();
			}

		}

		/*
		 * Guest can leave the room to join other room started by the
		 * participant or the leader itself. reconnectCallBack is to join the
		 * next room only after first room and USS connection has been closed
		 * gracefully
		 */
		this.leaveRoom = function(reconnectCallBack) {
			ussConfig.reconnectCallBack = reconnectCallBack;
			// uss.leaveRoom();

			ussWrapper.stop();
		}

		this.pauseDesktopShare = function() {
			if (ussWrapper != null) {
				ussWrapper.pause();
			}

		}

		this.resumeDesktopShare = function() {
			xmppInterface.republishUSSRoom();
			if (ussWrapper != null) {
				ussWrapper.resume();
			}
		}

		this.endDesktopShare = function() {

			if (ussWrapper != null ) {
					ussWrapper.stopShare();
				
			}
		}
		this.endUSSSession = function() {
			if (ussWrapper != null) {
				ussWrapper.end();
				ussWrapper = null;
				delete ussWrapper;
			}
		}
	}
	window.ussController = new USSController();

})(window);
