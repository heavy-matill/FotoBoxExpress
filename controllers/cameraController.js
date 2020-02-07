var fs = require('fs');
var exec = require('child_process').exec;
var waitOn = require('wait-on');
var GPhoto = new gphoto2.GPhoto2();

var nconf = require('nconf');

var fileName = nconf.get('Paths:localFotos') + '/picture2.jpg'
exports.takePicture = async function () {
    exec('gphoto2 --capture-image-and-download --filename="'+ fileName +'"', function callback(error, stdout, stderr) {
        //fs.renameSync(tmpname, fileName);

        console.log('File available: ' + fileName);
        //fotoBoxController.displayNewFoto(fileName)
        //fotoBoxController.addNewFoto(fileName)
    });

    /*await waitOn({
        resources: [
            fileName,]
        , timeout: 3000
    })*/
}