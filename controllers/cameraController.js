const util = require('util');
var date = require('date-and-time');
const exec = util.promisify(require('child_process').exec);
var path = require("path");

const fotoBoxController = require('./fotoBoxController');
var config = require('../config');

exports.ready = true;

exports.takePicture = async function (fileName) {
    exports.ready = false;
    //animationController.animate(3000);
    //await delay(3000);
    var filePath = path.join(config.get('Paths:localFotos'),fileName);
    var  { stdout, stderr } = await exec('gphoto2 --capture-image-and-download --force-overwrite --filename='+filePath)
    if (stderr) {
        exports.ready = true;
        console.log(stderr)
        if (stderr.includes("ERROR: Could not capture."))
        {
            // maybe retry
        } else {
            //new error that may have to be handled
            throw stderr
        }
        
    }  else {
        fotoBoxController.displayNewFoto(fileName)
        fotoBoxController.addNewFoto(fileName)
    }
    console.log('Camera ready');
    exports.ready = true;    
}

exports.triggerCamera = function() {
    console.log("Triggered camera")
    if (exports.ready) {
        const now = new Date();
        fileName = date.format(now, 'YYYY-MM-DD_HH-mm-ss') + '.jpg';
        exports.takePicture(fileName);
    } else {
        console.log("camera not ready!");
    }
}
