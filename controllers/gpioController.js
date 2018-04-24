var gpio = require("gpio");
var fotoBoxController = require('./fotoBoxController');

var gpio4 = gpio.export(4, {
	direction: "in",
	ready: function() {
	}
});

gpio4.on("change", function(val) {
	// value will report either 1 or 0 (number) when the value changes 
	console.log("gpio is ", val);
	if(val){
		fotoBoxController.stopQueue();
	}
});
