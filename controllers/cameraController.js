//const fotoBoxController = require('./fotoBoxController');
//const animationController = require('./animationController');
//const path = require("path");
const util = require('util');
//const delay = require('delay');
const exec = util.promisify(require('child_process').exec);

//const nconf = require('nconf');

exports.ready = true;

exports.takePicture = async function (filePath) {
    exports.ready = false;
    //animationController.animate(3000);
    //await delay(3000);
    //var filePath = path.join(nconf.get('Paths:localFotos'),fileName);
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
        //fotoBoxController.displayNewFoto(fileName)
        //fotoBoxController.addNewFoto(fileName)
    }

    console.log('Camera ready');
    exports.ready = true;    
}
