/**
	_onyx.Button_ is an [enyo.Button](#enyo.Button) with Onyx styling	applied. The
	color of the button may be customized by specifying a background color.

	The *onyx-affirmative*, *onyx-negative*, and *onyx-blue* classes provide some
	built-in presets.

		{kind: "onyx.Button", content: "Button"},
		{kind: "onyx.Button", content: "Affirmative", classes: "onyx-affirmative"},
		{kind: "onyx.Button", content: "Negative", classes: "onyx-negative"},
		{kind: "onyx.Button", content: "Blue", classes: "onyx-blue"},
		{kind: "onyx.Button", content: "Custom", style: "background-color: purple; color: #F1F1F1;"}

	For more information, see the documentation on
	[Buttons](building-apps/controls/buttons.html) in the Enyo Developer Guide.
*/
enyo.kind({
	name: "onyx.Button",
	kind: "enyo.Button",
	classes: "onyx-button enyo-unselectable",
	handlers: {
		ondown: "down",
		onenter: "enter",
		ondrag: "drag",
		onleave: "leave",
		onup: "up"
	},
	down: function(inSender, inEvent) {
		this.addClass("pressed");
		this._isInControl = true;
	},
	enter: function(inSender, inEvent) {
		this._isInControl = true;
	},
	drag: function(inSender, inEvent) {
		this.addRemoveClass("pressed", this._isInControl);
	},
	leave: function(inSender, inEvent) {
		this.removeClass("pressed");
		this._isInControl = false;
	},
	up: function(inSender, inEvent) {
		this.removeClass("pressed");
		this._isInControl = false;
	}
});