var fs = require('fs');
var exec = require('child_process').exec;
var waitOn = require('wait-on');

var nconf = require('nconf');
var i = 0
exports.ready = true;

// Negative value or undefined will disable logging, levels 0-4 enable it.
GPhoto.setLogLevel(1);
GPhoto.on('log', function (level, domain, message) {
    console.log(domain, message);
});

// List cameras / assign list item to variable to use below options
GPhoto.list(function (list) {
    if (list.length === 0) return;
    camera = list[0];
    console.log('Found', camera.model);
});

exports.takePicture = async function () {
    var fileName = nconf.get('Paths:localFotos') + '/picture' + i++ + '.jpg';
    exports.ready = false;
    try {
        camera.takePicture({ download: true }, function (er, data) {
            fs.writeFileSync(fileName, data);
        });
    } catch (error) {

        console.log(error);
    }

    console.log('Camera ready');
    exports.ready = true;
    //fotoBoxController.displayNewFoto(fileName)
    //fotoBoxController.addNewFoto(fileName)

    try {
        await waitOn({
            resources: [
                fileName,]
            , timeout: 5000
        })
        console.log('File available without callback: ' + fileName);
    } catch (error) {
        // kill gphoto2 because possibly stuck
        console.log('Stuck :(')
    }
}