var fs = require('fs');
var fotoBoxController = require('./fotoBoxController');
var path = require("path");
const exec = util.promisify(require('child_process').exec);

var nconf = require('nconf');
var i = 0
exports.ready = true;

exports.takePicture = async function (fileName) {
    var filePath = path.join(nconf.get('Paths:localFotos'),fileName);
    exports.ready = false;
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
