var config = require('../config');
const SerialPort = require('serialport')

var port;
exports.init = async function () {
    port = new SerialPort(config.get("Serial:Path"), { //config.get("Serial:Path")
        baudRate: 9600
    }, function () {
        port.on('readable', function () {
            let temp = 'RxSer: ' + port.read().toString();
            //console.log('RxSer: ' + port.read().toString())
            console.log(temp);
        })
        port.on('close', function () {
            console.log('RxSer closed');
        })
    })
};
exports.init();

exports.testCommand = async function (strTest) {
    port.write('TEST ' + strTest)
}

exports.countdownCommand = async function (tiAnim) {
    port.write('COUNTDOWN ' + tiAnim)
}
exports.standbyCommand = async function () {
    port.write('STANDBY')
}
exports.offCommand = async function () {
    port.write('OFF')
}
exports.closePort = function () {
    port.close();
}