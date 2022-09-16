var config = require('../config');
const cameraController = require('./cameraController');
const fotoBoxController = require('./fotoBoxController');

const SerialPort = require('serialport')

var port = { isOpen: false };
exports.readyState = 0;
exports.init = async function() {
    if (!port.isOpen) {
        console.log('RxSer initializing');

        SerialPort.list().then((ports) => {
            for (let port_struct of ports) {
                if (port_struct.path.startsWith('/dev/ttyUSB')) {
                    port = new SerialPort(port_struct.path, { //config.get("Serial:Path")
                        baudRate: 9600
                    }, function(error) {
                        if (error) {
                            console.log('RxSer Error:')
                            console.log(error)
                            console.log("RxSer try following paths:")
                            SerialPort.list().then(function(ports) {
                                ports.forEach(function(port) {
                                    if (port.pnpId)
                                        console.log(port)
                                })
                            });
                        } else {
                            console.log('RxSer connected')
                            exports.readyState = 1;
                        }
                        port.on('readable', function() {
                            let temp = port.read().toString();
                            if (temp.match('trigger')) {
                                cameraController.triggerCamera();
                            }
                            console.log('RxSer: ' + temp);
                        })
                        port.on('close', function() {
                            console.log('RxSer closed');
                            exports.readyState = 0;
                        })
                    })
                }
            }
        })
    }
};
exports.init()
setInterval(exports.init, 20000);


exports.testCommand = async function(strTest) {
    port.write('TEST ' + strTest + '\n')
}

exports.countdownCommand = async function(tiAnim) {
    port.write('COUNTDOWN ' + tiAnim + '\n')
}
exports.standbyCommand = async function() {
    port.write('STANDBY' + '\n')
}
exports.offCommand = async function() {
    port.write('OFF' + '\n')
}
exports.closePort = function() {
    port.close();
}