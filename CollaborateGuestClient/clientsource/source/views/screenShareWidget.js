/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

var cursorImage = document.createElement('img');
enyo
		.kind({
			name : "cgc.ScreenArea",
			kind : "FittableRows",
			fit : true,
			published : {
                isActive:false,
                isShowing:false,
                isInitialImageLoaded : false,
                shareBaseImageWidth : 0,
                shareBaseImageHeight : 0
            },

			components : [

			{
				name : "screenContainer",
				fit : true,
				tag : "div",
				id : "screenContainer",
				classes : "cgcFullHeight bsftCallBackground ",
				components : [

						{
							name : "imageCanvas",
							style : "background:#C8D6E4; z-index: 1; position: absolute; left: 0px; width:100%",
							tag : "canvas",
							id : "imageCanvas",
							doLayout: function(parentScreenArea){

								
								if (parentScreenArea.getIsInitialImageLoaded()) {

									var imageHeight = parentScreenArea.getShareBaseImageHeight();
									var imageWidth = parentScreenArea.getShareBaseImageWidth();
									
									var imageCanvas = document
											.getElementById('imageCanvas');
									var cursorImageCanvas = document
											.getElementById('cursorImageCanvas');
									
									
									
									var parentHeight = parseInt(window
											.getComputedStyle(
													imageCanvas.parentNode,
													null).getPropertyValue(
													"height"), 10);
									var parentWidth = parseInt(window
											.getComputedStyle(
													imageCanvas.parentNode,
													null).getPropertyValue(
													"width"), 10);


										var newWidth = parentWidth;
										var newHeight = (imageHeight * newWidth)
												/ imageWidth;
										if (newHeight <= parentHeight) {
											imageCanvas.style.width = newWidth
													+ "px";
											imageCanvas.style.height = newHeight
													+ "px";
											cursorImageCanvas.style.width = newWidth
													+ "px";
											cursorImageCanvas.style.height = newHeight
													+ "px";
										} else {
											newHeight = parentHeight;
											var newWidth = (imageWidth * newHeight)
													/ imageHeight;
											imageCanvas.style.width = newWidth
													+ "px";
											imageCanvas.style.height = newHeight
													+ "px";
											cursorImageCanvas.style.width = newWidth
													+ "px";
											cursorImageCanvas.style.height = newHeight
													+ "px";
										}

									var compHeight = window.getComputedStyle(
											imageCanvas, null)
											.getPropertyValue("height");
									var compWidth = window.getComputedStyle(
											imageCanvas, null)
											.getPropertyValue("width");

									var top = (parseInt(parentHeight) - parseInt(
											compHeight, 10)) / 2;
									var left = (parseInt(parentWidth) - parseInt(
											compWidth, 10)) / 2;
									imageCanvas.style.top = top + "px";
									imageCanvas.style.left = left + "px";
									cursorImageCanvas.style.top = top + "px";
									cursorImageCanvas.style.left = left + "px";
								}
							
							},
							resizeHandler: function(){
								this.doLayout(this.parent.parent);
							}
						},
						{
							name : "CursorScreen",
							style : "z-index: 2; position: absolute; left: 0px; width: 100%",
							tag : "canvas",
							id : "cursorImageCanvas",

						} ]
			} ],
			showFullScreen : function(inSender, inEvent) {
				this.owner.showFullScreen();
				this.resized();
			},layoutRefresh: function(){
				
				
			},stop: function(){
				this.setContainer("");
				this.setOwner("");
				this.setIsActive(false);
				this.setIsShowing(false);
				this.setIsInitialImageLoaded(false);
				this.setShareBaseImageWidth(0);
				this.setShareBaseImageHeight(0);

			}, prepare: function(){
				this.setIsActive(true);
				
			}, onShareImageDeltas: function(imageFormat, shareDetails, imageData){
				var imageDeltas = shareDetails.deltas;
				var image = document.createElement('img');
				image.src = 'data:' + imageFormat+ ';base64,' + imageData;
				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("screenWidget.js", "[TAG:IMAGE] Delta image received rev= "+shareDetails.rev, {imageFormat:imageFormat,imageData:imageData});				

				}
				image.onload = function() {
					if(LOGGER.API.isDebug()){
						LOGGER.API.debug("screenWidget.js", "[TAG:IMAGE] Delta image loaded rev= "+shareDetails.rev);				

					}
					var imageCanvas = document.getElementById('imageCanvas');
					if(imageCanvas != null) {
						var context = imageCanvas.getContext('2d');
						var sl = 0;
						if(LOGGER.API.isDevDebug()){
							LOGGER.API.devDebug("screenWidget.js", "About to draw image " + imageDeltas.length + " to ", context);				

						}
						for (var i = 0; i < imageDeltas.length; i++) {
							context.drawImage(image, sl, 0, imageDeltas[i].w,
									imageDeltas[i].h, imageDeltas[i].l,
									imageDeltas[i].t, imageDeltas[i].w,
									imageDeltas[i].h);
							sl = sl + imageDeltas[i].w;
						}
						

						if(this.width != sl) {
							LOGGER.API.warn("screenWidget.js", "Delta image data not correct for image ", image.src);				
						}
						
						
						
						
					}else{
						LOGGER.API.warn("screenWidget.js", "Failed to draw delta image - image canvas missing.");
					}
				}


				
			},onShareBaseImage: function (imageFormat, shareDetails, imageData){
				
				if(this.getIsActive() && !this.getIsShowing()){
					this.setIsShowing(true);
					window.cgcComponent.basePanel.onParticipantShareStarted();
					
				}
					
				
				var self = this;
				
				var image = document.createElement('img');
				image.src = 'data:' + imageFormat + ';base64,' + imageData;
				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("screenWidget.js", "[TAG:IMAGE] Base Image received rev= "+shareDetails.rev, {imageFormat:imageFormat, imageData:imageData});				

				}
				// Wait for base image to load before retrieving height and width
				// In I.E, safari the images tend to load slow hence processing onload
				image.onload = function() {
					if(LOGGER.API.isDebug()){
						LOGGER.API.debug("screenWidget.js", "[TAG:IMAGE] Base Image loaded rev= "+shareDetails.rev);				

					}
					var imageCanvas = document.getElementById('imageCanvas');
					if(imageCanvas != null){
						self.setIsInitialImageLoaded(true);
						var cursorImageCanvas = document.getElementById('cursorImageCanvas');
						
				
				
						imageCanvas.width = this.width;
						imageCanvas.height = this.height;
						cursorImageCanvas.width = this.width;
						cursorImageCanvas.height = this.height;
				
		               
		                self.setShareBaseImageWidth(this.width);
		                self.setShareBaseImageHeight(this.height);
		                
		                self.$.imageCanvas.doLayout(self);
		                var context = imageCanvas.getContext('2d');
						context.drawImage(this, 0, 0);
					
					}else{
						LOGGER.API.warn("screenWidget.js", "Failed to draw base image - image canvas missing.");
					}
					image = null;
				}
				
			}, onCursorImageUpdate: function(imageFormat, cursorImageData, posX, posY) {
				if(LOGGER.API.isDevDebug()){
					LOGGER.API.devDebug("screenWidget.js", "[TAG:IMAGE] Cursor Image received ", {imageFormat:imageFormat, imageData:cursorImageData, posX:posX, posY:posY});				

				}

				if(cursorImageData){
					
					cursorImage.src = 'data:' + imageFormat + ';base64,' + cursorImageData;
				}
				
				var cursorImageCanvas = document.getElementById('cursorImageCanvas');
				if(cursorImageCanvas != null) {
					var context = cursorImageCanvas.getContext('2d');
					context.clearRect(0, 0, cursorImageCanvas.width,
							cursorImageCanvas.height);
					context.drawImage(cursorImage, posX,posY);
				}
			}
		});
