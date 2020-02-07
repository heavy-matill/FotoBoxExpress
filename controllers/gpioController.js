const Gpio = require('pigpio').Gpio; //https://www.npmjs.com/package/pigpio
var fotoBoxController = require('./fotoBoxController');

// trigger attached to pin 3
const button = new Gpio(3, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_UP,
  edge: Gpio.EITHER_EDGE
});
// Level must be stable for 10 ms before an alert event is emitted.
button.glitchFilter(10000);
 
button.on('interrupt', (level) => {
  console.log('triggered ' + level);
});

/*gpioShooting.on("change", function(val) {
	// value will report either 1 or 0 (number) when the value changes 
	console.log("gpio is ", val);
	if(val){
		console.log("pausing thumbnail creation queue due to io interrupt");
		fotoBoxController.stopQueue();
	}
});*/
