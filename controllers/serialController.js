const SerialPort = require('serialport')
const port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 9600
})
port.on('readable', function () {
    let temp = 'RxSer: ' + port.read().toString();
    //console.log('RxSer: ' + port.read().toString())
    console.log(temp);
})

exports.testCommand = async function (strTest) {
    port.write('TEST '+strTest)
}

exports.countdownCommand = async function (tiAnim) {
    port.write('COUNTDOWN '+ tiAnim)  
}
exports.standbyCommand = async function () {
    port.write('STANDBY')  
}
exports.offCommand = async function () {
    port.write('OFF')  
}
exports.closePort = function() {
    port.close();
}

port.on('close', function () {
    console.log('RxSer closed');
})
