const fotoBoxController = require('./fotoBoxController');
const path = require("path");
const util = require('util');
const delay = require('delay');
const exec = util.promisify(require('child_process').exec);

const nconf = require('nconf');

exports.ready = true;

exports.takePicture = async function (fileName) {
    exports.ready = false;
    await delay(2000);
    var filePath = path.join(nconf.get('Paths:localFotos'),fileName);
    var  { stdout, stderr } = await exec('gphoto2 --capture-image-and-download --force-overwrite --filename='+filePath)
    if (stderr) {
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
