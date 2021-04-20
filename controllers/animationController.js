const cameraController = require('./cameraController');
const settingsController = require('./settingsController');
const exec = require('child_process').exec;
var date = require('date-and-time');


const SerialPort = require('serialport');


const pathById = '/dev/serial/by-id/';
var pathSerialDev = '';
var serialport;


triggerCamera = function (data) {
    console.log(`received trigger via UART: ${data}`);
    if (cameraController.ready) {
        const now = new Date();
        fileName = date.format(now, 'YYYY-MM-DD_HH-mm-ss') + '.jpg';
        cameraController.takePicture(fileName);
    } else {
        console.log("camera not ready!");
    }
}

exports.animate = function (tiDelay) {
    console.log(`sending animation requeset with delay ${tiDelay} via UART`);
    serialport.write(String(tiDelay) + ' ');
}

exports.listSerials = function () {
    SerialPort.list().then(function (ports) {
        ports.forEach(function (port) {
            if (port.pnpId)
                console.log("Port: ", port);
        })
    });
}

exports.listSerials = function (callback) {
    SerialPort.list().then(function (ports) {
        portsWithId = []
        ports.forEach(function (port) {
            if (port.pnpId) {
                console.log("Port: ", port);
                portsWithId.push(port);
            }
        })
        return callback(portsWithId)
    });
}

exports.getSerialPath = function (pnpId, callback) {
    SerialPort.list().then(function (ports) {
        ports.forEach(function (port) {
            if (port.pnpId == pnpId)
                return callback(port.Path)
        })
    });
}

assignSerialPort = function (pathSerialDev) {
    serialport = new SerialPort(pathSerialDev);
    var Readline = SerialPort.parsers.Readline
    var parser = new Readline()
    serialport.pipe(parser)
    parser.on('data', triggerCamera)
}

setTimeout(function () {
    assignSerialPort(settingsController.strSerialId)
}, 3000);