var xmppInterface = null;

var uss = null;
var cursorImage = null;
var imageShareWidth = null;
var imageShareHeight = null;
var initialImgLoad = null;

var ussConfig = {
	ussUrl : null,
	jid : null,
	roomID : null,
	email : null,
	name : null,
	isReceiver:true
}

function isUSSConnected(){
	return (uss != null)?true:false;
}


function isFloorHolder(){
	return (uss && uss.isFloorHolder());
}
function startShare(){
	if(uss && uss.isFloorHolder()){
		uss.start();
	}
	
}



function onShareImageDeltas(imageFormat, shareDetails, imageData){
	var imageDeltas = shareDetails.deltas;
	var image = document.createElement('img');
	image.src = 'data:' + imageFormat+ ';base64,' + imageData;
	image.onload = function() {
		var imageCanvas = document.getElementById('imageCanvas');
		if(imageCanvas != null) {
			var context = imageCanvas.getContext('2d');
			var sl = 0;
	
			for (var i = 0; i < imageDeltas.length; i++) {
				context.drawImage(image, sl, 0, imageDeltas[i].w,
						imageDeltas[i].h, imageDeltas[i].l,
						imageDeltas[i].t, imageDeltas[i].w,
						imageDeltas[i].h);
				sl = sl + imageDeltas[i].w;
			}
			

			if(this.width != sl) {
				
				console.log("SSInfo processing delta image verify fails =>  " + this.width +"!=" +sl);
				console.log("SSInfo processing delta image verify fails for image src =>" + image.src);
				
			}
			
			
			
			
		}
	}


	
}
function onShareBaseImage(imageFormat, imageData, dimension){
	

	var image = document.createElement('img');
	image.src = 'data:' + imageFormat + ';base64,' + imageData;
	// Wait for base image to load before retrieving height and width
	// In I.E, safari the images tend to load slow hence processing onload
	image.onload = function() {
		var imageCanvas = document.getElementById('imageCanvas');
		if(imageCanvas != null){
		var cursorImageCanvas = document
				.getElementById('cursorImageCanvas');

			imageCanvas.width = this.width;
			imageCanvas.height = this.height;
			cursorImageCanvas.width = this.width;
			cursorImageCanvas.height = this.height;

			var compHeight = window.getComputedStyle(imageCanvas, null)
					.getPropertyValue("height");
			var compWidth = window.getComputedStyle(imageCanvas, null)
					.getPropertyValue("width");

			imageShareHeight = compHeight;
			imageShareWidth = compWidth;
			initialImgLoad = true;

			var imageHeight = parseInt(window.getComputedStyle(imageCanvas,
					null).getPropertyValue("height"), 10);
			var imageWidth = parseInt(window.getComputedStyle(imageCanvas,
					null).getPropertyValue("width"), 10);

			var parentHeight = parseInt(window.getComputedStyle(
					imageCanvas.parentNode, null)
					.getPropertyValue("height"), 10);
			var parentWidth = parseInt(
					window.getComputedStyle(imageCanvas.parentNode, null)
							.getPropertyValue("width"), 10);
			var aspectRatio = imageWidth / imageHeight;

			if (imageHeight <= parentHeight && imageWidth <= parentWidth) {
				imageCanvas.style.width = imageWidth + "px";
				imageCanvas.style.height = imageHeight + "px";

			} else if (imageHeight <= parentHeight) {
				var newWidth = parentWidth;
				var newHeight = (imageHeight * newWidth) / imageWidth;
				imageCanvas.style.width = newWidth + "px";
				imageCanvas.style.height = newHeight + "px";

			} else if (imageWidth <= parentWidth) {
				var newHeight = parentHeight;
				var newWidth = (imageWidth * newHeight) / imageHeight;
				imageCanvas.style.width = newWidth + "px";
				imageCanvas.style.height = newHeight + "px";
			} else {
				var newWidth = parentWidth;
				var newHeight = (imageHeight * newWidth) / imageWidth;
				if (newHeight <= parentHeight) {
					imageCanvas.style.width = newWidth + "px";
					imageCanvas.style.height = newHeight + "px";
					cursorImageCanvas.style.width = newWidth + "px";
					cursorImageCanvas.style.height = newHeight + "px";
				} else {
					newHeight = parentHeight;
					var newWidth = (imageWidth * newHeight) / imageHeight;
					imageCanvas.style.width = newWidth + "px";
					imageCanvas.style.height = newHeight + "px";
					cursorImageCanvas.style.width = newWidth + "px";
					cursorImageCanvas.style.height = newHeight + "px";
				}
			}

			var compHeight = window.getComputedStyle(imageCanvas, null)
					.getPropertyValue("height");
			var compWidth = window.getComputedStyle(imageCanvas, null)
					.getPropertyValue("width");

			var top = (parseInt(parentHeight) - parseInt(compHeight, 10)) / 2;
			var left = (parseInt(parentWidth) - parseInt(compWidth, 10)) / 2;
			imageCanvas.style.top = top + "px";
			imageCanvas.style.left = left + "px";
			cursorImageCanvas.style.top = top + "px";
			cursorImageCanvas.style.left = left + "px";

			var context = imageCanvas.getContext('2d');
			context.drawImage(this, 0, 0);
		
		}
	}
	
}
function oncursorimageupdate(imageformat, cursorImageData, posX, posY) {
	if(cursorImageData){
		cursorImage.src = 'data:' + imageformat + ';base64,' + cursorImageData;
	}
	var cursorImageCanvas = document.getElementById('cursorImageCanvas');
	if(cursorImageCanvas != null) {
		var context = cursorImageCanvas.getContext('2d');
		context.clearRect(0, 0, cursorImageCanvas.width,
				cursorImageCanvas.height);
		context.drawImage(cursorImage, posX,posY);
	}
}

function ondisconnected(refUSS) {
	console.log('CollaborateGuestClient: USS connection', 'Disconnected.');
	
	if (refUSS.isGraceFullyShareEnded != true) {
		enyo.Signals.send("onChatErrorMessage", {
			message : htmlEscape(jQuery.i18n.prop("cgc.error.uss.screenshare"))
		});
	}

	xmppInterface.screenShareEnded();
	
	if(ussConfig.reconnectCallBack){
		ussConfig.reconnectCallBack();
		ussConfig.reconnectCallBack = null;
	}
	enyo.Signals
			.send("onShareStartStopSignal",{desktopShare : "stop" });

	
	uss = null;
}



function onShareStartStop (refThis, isShareActive, src, lastSharer, floorHolder){
	var srcName = null;
	
	
	if(isShareActive){
		if(lastSharer == ussConfig.jid && src != ussConfig.jid){
			var contact = xmppInterface.getContactFromJid(src);
			srcName = (contact && contact.name)? contact.name : xmppInterface.getContactFromJid(src);
			
			if(contact && contact.owner !=  "") {
				srcName = srcName + " (" + htmlEscape(jQuery.i18n
						.prop("cgc.label.owner")) + ")";
			}
			
			enyo.Signals.send("onChatInfoMessage",	{
				message : htmlEscape(jQuery.i18n
					.prop("cgc.info.uss.screenshare.participantinterrupt", srcName)),
					avatar : false
			});			
		} else {
			if(src == ussConfig.jid){
				srcName = window.cgcProfile.firstName+" "+window.cgcProfile.lastName;
			}else {
				var contact = xmppInterface.getContactFromJid(src);
				srcName = (contact && contact.name)? contact.name : xmppInterface.getContactFromJid(src);
			}
				
			if(contact && contact.owner !=  "") {
				srcName = contact.name + " (" + htmlEscape(jQuery.i18n
						.prop("cgc.label.owner")) + ")";
			}
			
			enyo.Signals
			.send(
					"onChatInfoMessage",
					{
						message : htmlEscape(jQuery.i18n
								.prop("cgc.info.uss.screenshare.start", srcName)),
						avatar  : false
					});
			
		}
		
		if(src != ussConfig.jid){
			
			xmppInterface.showScreenSharePanel();
		}
		
	} else {

		if(lastSharer == ussConfig.jid){
			
			if(src == null || src == window.cgcProfile.broadworksId || floorHolder == uss.getOwnerId()) {
				
				enyo.Signals.send("onChatInfoMessage",	{
					message : htmlEscape(jQuery.i18n
						.prop("cgc.info.uss.screenshare.ownerstop", window.cgcProfile.name, jQuery.i18n
								.prop("cgc.label.owner"))),
						avatar : false
				});
				
			} else {
				srcName = window.cgcProfile.firstName+" "+window.cgcProfile.lastName;
				enyo.Signals.send("onChatInfoMessage",	{
					message : htmlEscape(jQuery.i18n
						.prop("cgc.info.uss.screenshare.stop", srcName)),
						avatar : false
				});
			}
		} else {
			var contact = xmppInterface.getContactFromJid(lastSharer);
			srcName = (contact && contact.name)? contact.name : xmppInterface.getContactFromJid(lastSharer);
			
			if(contact && contact.owner !=  "") {
				srcName = contact.name + " (" + htmlEscape(jQuery.i18n
						.prop("cgc.label.owner", srcName)) + ")";
			}
			
			enyo.Signals.send("onChatInfoMessage",	{
				message : htmlEscape(jQuery.i18n
					.prop("cgc.info.uss.screenshare.stop", srcName)),
					avatar : false
			});
		}			
		
		xmppInterface.screenShareEnded();
		//when a share is interrupted by another share, the src is set to null. This is a new change in the USS.
		if(src == ussConfig.jid || src == null){
			enyo.Signals
				.send("onShareStartStopSignal",{desktopShare : "stop" });
		}
		
	}
	
}

function replaceProtocol(url) {
	
	if (url != null) {
		url = url.replace('http', 'ws');
		
	} 
	return url;
}

function isSameRoom(roomid){
	if( ussConfig.roomID == roomid){
		return true;
	}
	
	return false;
	
}

/*
 * Guest can leave the room to join other room started by the participant or the leader itself.
 * reconnectCallBack is to join the next room only after first room and USS connection has been closed gracefully
 * */
function leaveRoom(reconnectCallBack){
	ussConfig.reconnectCallBack = reconnectCallBack;
	//uss.leaveRoom();

	uss.stop();
}

function onStarted(uss){
	
	if(uss.isFloorHolder()){
		enyo.Signals
			.send("onShareStartStopSignal",{desktopShare : "start" });
	}
}



function startUSSConnection(url, jid, email, name, roomid, _xmppInterface, isReceiver) {
	if(uss == null) {
		jid = jid.split("/")[0];
		xmppInterface = _xmppInterface;
		cursorImage = document.createElement('img');
		
		ussConfig.ussUrl = replaceProtocol(url);
		ussConfig.jid = jid;
		ussConfig.roomID = roomid;
		ussConfig.email = email;
		ussConfig.name = name;
		ussConfig.isReceiver = isReceiver;
		// ussConfig.isReceiver = !isReceiver || isReceiver == true? true:false;
	    console.log('background: isReceiver :: '+isReceiver);
	    
		uss = new USSClass(ussConfig);
		//register callbacks
		uss.onBaseImage = onShareBaseImage;
		uss.onImageDeltas = onShareImageDeltas;
		uss.onShareStartStop = onShareStartStop;
		uss.onCursorImage = oncursorimageupdate;
		uss.onDisconnect = ondisconnected;
	    uss.onStarted = onStarted;
		
		uss.start();
	}
	
}

function pauseDesktopShare() {
	if(uss != null) {
		uss.pause();
	}
	
}

function resumeDesktopShare() {
	xmppInterface.republishUSSRoom();
	if(uss != null) {
		uss.resume();
	}
}

function endDesktopShare() {
	if(uss != null) {
		uss.stopShare();
	}
}