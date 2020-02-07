var fs = require('fs');
var exec = require('child_process').exec;
var waitOn = require('wait-on');

var nconf = require('nconf');

var fileName = nconf.get('Paths:localFotos') + '/picture2.jpg'
exports.takePicture = async function () {
    exec('gphoto2 --capture-image-and-download --force-overwrite --filename="'+ fileName +'"', function callback(error, stdout, stderr) {
        //fs.renameSync(tmpname, fileName);

        console.log('File available: ' + fileName);
        //fotoBoxController.displayNewFoto(fileName)
        //fotoBoxController.addNewFoto(fileName)
    });

    await waitOn({
        resources: [
            fileName,]
        , timeout: 5000
    })
    console.log('File available without callback: ' + fileName);
}