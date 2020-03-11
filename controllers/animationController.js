const cameraController = require('./cameraController');
const exec = require('child_process').exec;
var date = require('date-and-time');


const SerialPort = require('serialport');


const pathById = '/dev/serial/by-id/';
var pathSerialDev = '';
var serialport;


triggerCamera = function(data) {
    console.log(`received trigger via UART: ${data}`);
    if (cameraController.ready) {		
		const now = new Date();
		fileName = date.format(now, 'YYYY-MM-DD_HH-mm-ss') + '.jpg';
		cameraController.takePicture(fileName);
	} else {
		console.log("camera not ready!");
	}
}

exports.animate = function(tiDelay) {    
    console.log(`sending animation requeset with delay ${tiDelay} via UART`);
    serialport.write(String(tiDelay)+' ');
}

assignSerialPort = function() {
    exec("sudo dir /dev/serial/by-id/", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        pathSerialDev = pathById + stdout.slice(0,-1);    
        serialport = new SerialPort(pathSerialDev);
        console.log("Found serialport: %s", serialport);
        const Readline = SerialPort.parsers.Readline
        const parser = new Readline()
        serialport.pipe(parser)
        parser.on('data', triggerCamera)
    });
}

setTimeout(assignSerialPort,3000);
