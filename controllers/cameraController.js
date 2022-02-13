const util = require('util');
var date = require('date-and-time');
const exec = util.promisify(require('child_process').exec);
var path = require("path");

const fotoBoxController = require('./fotoBoxController');
const serialController = require('./serialController');
var config = require('../config');

// kill all gphoto2 processes
exec('sudo pkill -f gphoto2', (value) =>
    console.log(value.stdout + value.stderr));
exports.ready = true;

exports.takePicture = async function(fileName) {
    //exports.ready = false;
    //animationController.animate(3000);
    //await delay(3000);
    var filePath = path.join(config.get('Paths:localFotos'), fileName);
    try {
        var { stdout, stderr } = await exec('gphoto2 --capture-image-and-download --force-overwrite --filename=' + filePath);
        fotoBoxController.displayNewFoto(fileName)
        fotoBoxController.addNewFoto(fileName)
    } catch (e) {
        console.log('Caught Error: ', e);
        fotoBoxController.continue();
    } finally {
        console.log('Camera ready');
        exports.ready = true;
    }
}

exports.triggerCamera = function() {
    console.log("Triggered camera")
    if (exports.ready) {
        exports.ready = false;
        fotoBoxController.displayCountdown(3000);
        serialController.countdownCommand(3000);
        setTimeout(function() {
            const now = new Date();
            fileName = date.format(now, 'YYYY-MM-DD_HH-mm-ss') + '.jpg';
            exports.takePicture(fileName);
        }, 3000);
    } else {
        console.log("camera not ready!");
    }
}