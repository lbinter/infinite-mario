/**
	Base class to represent a double buffered canvas object.
	Code by Rob Kleffner, 2011
*/

Enjine.GameCanvas = function () {
	this.canvasId = null;
	this.Canvas = null;
	this.Context2D = null;
	this.BackBuffer = null;
	this.BackBufferContext2D = null;
};

Enjine.GameCanvas.prototype = {
	Initialize: function (canvasId, resWidth, resHeight) {
		this.canvasId = canvasId;
		this.Canvas = document.getElementById(canvasId);
		this.Context2D = this.Canvas.getContext("2d");
		this.BackBuffer = document.createElement("canvas");
		this.BackBuffer.width = resWidth;
		this.BackBuffer.height = resHeight;
		this.BackBufferContext2D = this.BackBuffer.getContext("2d");
	},

	BeginDraw: function () {
		this.BackBufferContext2D.clearRect(0, 0, this.BackBuffer.width, this.BackBuffer.height);
		this.Context2D.clearRect(0, 0, this.Canvas.width, this.Canvas.height);
	},

	EndDraw: function () {
		this.Context2D.drawImage(this.BackBuffer, 0, 0, this.BackBuffer.width, this.BackBuffer.height, 0, 0, this.Canvas.width, this.Canvas.height);
	},

	ResizeEditor: function (elementId, width = null, height = null) {
		let clientWidth = width;
		if (!clientWidth) {
			let container = document.getElementById(elementId);
			clientWidth = container.clientWidth;
		}
		this.Canvas.width = clientWidth;
		this.BackBuffer.width = clientWidth / 2;
		if (height) {
			this.Canvas.height = height;
			this.BackBuffer.height = height / 2;
		}
		this.BackBufferContext2D = this.BackBuffer.getContext("2d");
	}
};