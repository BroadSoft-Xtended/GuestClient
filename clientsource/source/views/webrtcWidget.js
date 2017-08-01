/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

var isSelfView = true;
var isLowResolutionSelf = undefined;
enyo
		.kind({
			name : "kind.com.broadsoft.cgc.webrtc",

			classes : "nice-padding",
			fit : true,
			allowHtml : true,
			reloadWebRTC : function(isLowResolution) {
				window.cgcComponent.webrtcPanel = this;
				isLowResolutionSelf = isLowResolution;
				console
				.log("CollaborateGuestClient:webrtcWidget:reloadWebRTC: Resizing the video frame");
				var webrtcDiv = document.getElementById('client');

				var parentHeight = null;
				var parentWidth = null;
				if (!isLowResolution) {
					this.addClass("cgcRightPanelVideoBackground");
					this.removeClass("cgcLeftPanelVideoBackground");
					window.clientDivWidth = "640";
					window.clientDivHeight = "480";
					ClientConfig.displayResolution = "640x480";
					ClientConfig.encodingResolution = "640x480";
				} else {
					this.addClass("cgcLeftPanelVideoBackground");
					this.removeClass("cgcRightPanelVideoBackground");
					window.clientDivWidth = "320";
					window.clientDivHeight = "240";
					ClientConfig.displayResolution = "320x240";
					ClientConfig.encodingResolution = "320x240";
				}
				if (webrtcDiv != null) {
					var cgcSelfView = document.getElementById("selfview");
					var selfviewTitle = htmlEscape(jQuery.i18n
							.prop("cgc.tooltip.selfview.off"));
					if(!isSelfView){
						selfviewTitle = htmlEscape(jQuery.i18n
								.prop("cgc.tooltip.selfview.on"));
					}
					
					
						if(!cgcSelfView){
							$( ".video" ).prepend('<img id="selfview" title = "'+selfviewTitle+'" class= "cgcSelfView" src="branding/assets/self-view_i.svg" />');
							$('#selfview').bind('click', selfViewOnOrOff);
							$('#selfview').bind('mouseover', selfViewOnMouseover);
							$('#selfview').bind('mouseout', selfViewOnMouseout);
							$('#selfview').bind('mousedown', selfViewOnKeydown);
							$('#selfview').bind('mouseup', selfViewOnMouseover);
						}else{
							$('#selfview').prop('title', selfviewTitle);
						}
						
					parentHeight = parseInt(window.getComputedStyle(
							webrtcDiv.parentNode.parentNode.parentNode, null)
							.getPropertyValue("height"), 10);
					parentWidth = parseInt(window.getComputedStyle(
							webrtcDiv.parentNode.parentNode.parentNode, null)
							.getPropertyValue("width"), 10);

					var aspectRatio = window.clientDivWidth
							/ window.clientDivHeight;
					webrtcDiv.style.width = window.clientDivWidth + "px";
					webrtcDiv.style.height = window.clientDivHeight + "px";
					
//					if (window.clientDivHeight <= parentHeight
//							&& window.clientDivWidth <= parentWidth) {
//						webrtcDiv.style.width = window.clientDivWidth + "px";
//						webrtcDiv.style.height = window.clientDivHeight + "px";
//
//					} else if (window.clientDivHeight <= parentHeight) {
//						var newWidth = parentWidth;
//						var newHeight = (window.clientDivHeight * newWidth)
//								/ window.clientDivWidth;
//						webrtcDiv.style.width = newWidth + "px";
//						webrtcDiv.style.height = newHeight + "px";
//
//					} else if (window.clientDivWidth <= parentWidth) {
//						var newHeight = parentHeight;
//						var newWidth = (window.clientDivWidth * newHeight)
//								/ window.clientDivHeight;
//						webrtcDiv.style.width = newWidth + "px";
//						webrtcDiv.style.height = newHeight + "px";
//					} else {
//						var newWidth = parentWidth;
//						var newHeight = (window.clientDivHeight * newWidth)
//								/ window.clientDivWidth;
//						if (newHeight <= parentHeight) {
//							webrtcDiv.style.width = newWidth + "px";
//							webrtcDiv.style.height = newHeight + "px";
//						} else {
//							newHeight = parentHeight;
//							var newWidth = (window.clientDivWidth * newHeight)
//									/ window.clientDivHeight;
//							webrtcDiv.style.width = newWidth + "px";
//							webrtcDiv.style.height = newHeight + "px";
//						}
//					}

//					var compDivHeight = parseInt(window.getComputedStyle(
//							webrtcDiv, null).getPropertyValue("height"), 10);
//					var compDivWidth = parseInt(window.getComputedStyle(
//							webrtcDiv, null).getPropertyValue("width"), 10);
//
//					var top = (parseInt(parentHeight) - parseInt(compDivHeight,
//							10)) / 2;
//					var left = (parseInt(parentWidth) - parseInt(compDivWidth,
//							10)) / 2;
//					if (isLowResolution) {
//						top = 0;
//						left = 0;
//					}
//					webrtcDiv.style.marginTop = top + "px";
//					webrtcDiv.style.top = top + "px";
//					webrtcDiv.style.left = left + "px";

				}
			},
			goSelfVeiw : function(isSelfViewChange) {
				isSelfView = isSelfViewChange;
				this.reloadWebRTC(isLowResolutionSelf);
			}

		})