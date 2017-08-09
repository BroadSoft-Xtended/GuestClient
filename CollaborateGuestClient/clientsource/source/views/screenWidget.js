/*
* BroadWorks
* Copyright (c) 2014 BroadSoft, Inc.  All rights reserved.
* Proprietary Property of BroadSoft, Inc. Gaithersburg, MD.
*/

enyo
		.kind({
			name : "cgc.ScreenArea",
			kind : "FittableRows",
			fit : true,
			components : [

			{
				name : "screenContainer",
				fit : true,
				tag : "div",
				id : "screenContainer",
				style : "height:100%;background-color:#3a3a3a;",
				components : [

						{
							name : "ImageScreen",
							style : "background:#C8D6E4; z-index: 1; position: absolute; left: 0px; width:100%",
							tag : "canvas",
							id : "imageCanvas",
							resizeHandler : function() {
								if (window.initialImgLoad != null) {
									var imageCanvas = document
											.getElementById('imageCanvas');
									var cursorImageCanvas = document
											.getElementById('cursorImageCanvas');
									var imageHeight = parseInt(
											window.imageShareHeight, 10);
									var imageWidth = parseInt(
											window.imageShareWidth, 10);

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
			}
		});
