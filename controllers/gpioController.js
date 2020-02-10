const Gpio = require('pigpio').Gpio; //https://www.npmjs.com/package/pigpio
//var fotoBoxController = require('./fotoBoxController');
var cameraController = require('./cameraController');
var date = require('date-and-time');
// TBD condigurable either edge or just down
// trigger attached to pin 4
const button = new Gpio(4, {
	mode: Gpio.INPUT,
	pullUpDown: Gpio.PUD_UP,
	edge: Gpio.EITHER_EDGE,
	alert: true
});
// Level must be stable for 100 ms before an alert event is emitted.
button.glitchFilter(10000);

button.on('alert', (level) => {
	console.log('triggered ' + level);
	if (cameraController.ready) {
		
		const now = new Date();
		fileName = date.format(now, 'YYYY-MM-DD_HH-mm-ss') + '.jpg';
		cameraController.takePicture(fileName);
	} else {
		console.log("camera not ready!");
	}
});

/*gpioShooting.on("change", function(val) {
	// value will report either 1 or 0 (number) when the value changes
	console.log("gpio is ", val);
	if(val){
		console.log("pausing thumbnail creation queue due to io interrupt");
		fotoBoxController.stopQueue();
	}
});*/
