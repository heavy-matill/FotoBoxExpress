var gpio = require("gpio");
var fotoBoxController = require('./fotoBoxController');

console.log("gpio is ready");

var gpio4 = gpio.export(4, {
	direction: "in",
	ready: function() {
	}
});

gpio4.on("change", function(val) {
	// value will report either 1 or 0 (number) when the value changes 
	console.log("gpio is ", val);
	if(val){
		console.log("pausing thumbnail creation queue due to io interrupt");
		fotoBoxController.stopQueue();
	}
});
