const cameraController = require('./cameraController');
const exec = require('child_process').exec;
var date = require('date-and-time');


const SerialPort = require('serialport');


const pathById = '/dev/serial/by-id/';
var pathSerialDev = '';
var serialport;

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
    const Readline = SerialPort.parsers.Readline
    const parser = new Readline()
    serialport.pipe(parser)
    parser.on('data', triggerCamera)
});

triggerCamera = function(bStart) {
    console.log("received trigger "+ String(bStart) +" via UART");
    if (cameraController.ready) {		
		const now = new Date();
		fileName = date.format(now, 'YYYY-MM-DD_HH-mm-ss') + '.jpg';
		cameraController.takePicture(fileName);
	} else {
		console.log("camera not ready!");
	}
}

exports.animate = function(tiDelay) {    
    console.log("sending animation requeset with delay " + String(tiDelay) + " via UART");
    serialport.write(String(tiDelay)+' ');
}