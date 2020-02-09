var fs = require('fs');
var exec = require('child_process').exec;
var waitOn = require('wait-on');

var nconf = require('nconf');
var i = 0
exports.ready = true;

exports.takePicture = async function () {
    var fileName = nconf.get('Paths:localFotos') + '/picture' + i++ + '.jpg';
    exports.ready = false;
    exec('gphoto2 --capture-image-and-download --force-overwrite --filename="' + fileName + '"', function callback(error, stdout, stderr) {
        //fs.renameSync(tmpname, fileName);

        console.log('Camera ready');
        exports.ready = true;
        //fotoBoxController.displayNewFoto(fileName)
        //fotoBoxController.addNewFoto(fileName)
    });

    try {
        await waitOn({
            resources: [
                fileName,]
            , timeout: 5000
        })
        console.log('File available without callback: ' + fileName);
    } catch (err) {
        // kill gphoto2 because possibly stuck
        await exec('killall -9 gphoto2');
    }
}