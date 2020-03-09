const fotoBoxController = require('./fotoBoxController');
const exec = require('child_process').exec;


const SerialPort = require('serialport');


const pathById = '/dev/serial/by-id/';
var pathSerialDev = '';
var serialport;

exec("dir /dev/serial/by-id/", (error, stdout, stderr) => {
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
});

exports.animate = function(tiDelay) {    
    serialport.write(String(tiDelay)+' ');
}