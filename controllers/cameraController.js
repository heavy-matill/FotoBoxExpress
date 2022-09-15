const util = require('util');
var date = require('date-and-time');
const exec = util.promisify(require('child_process').exec);
var path = require("path");
var waitOn = require('wait-on');

const fotoBoxController = require('./fotoBoxController');
const serialController = require('./serialController');
var config = require('../config');

// kill all gphoto2 processes
exec('sudo pkill -f gphoto2', (value) =>
    console.log(value.stdout + value.stderr));
exports.ready = true;

exports.takePicture = async function(fileName) {
    var filePath = path.join(config.get('Paths:localFotos'), fileName);
    var wait_opts = {
        resources: [
            filePath
        ],
        delay: 1000, // initial delay in ms, default 0
        interval: 100, // poll interval in ms, default 250ms
        simultaneous: 1, // limit to 1 connection per resource at a time
        timeout: 10000, // timeout in ms, default Infinity
    };
    try {
        exec('gphoto2 --capture-image-and-download --force-overwrite --filename=' + filePath).then(out => {
            if (out.stderr) {
                console.log('gphoto2 error: ', out.stderr);
                throw (out.stderr);
            }
            if (out.stdout) {
                console.log('gphoto2: ', out.stdout);
            }
        })
        await waitOn(wait_opts).then(() => {
            fotoBoxController.displayNewFoto(fileName)
            fotoBoxController.addNewFoto(fileName)
        }).catch((e) => {
            console.log("waitOn error: ", e)
            throw (e)
        });
    } catch (e) {
        fotoBoxController.continue();
    } finally {
        console.log('Camera controller ready');
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