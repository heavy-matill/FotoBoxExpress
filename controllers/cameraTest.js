var fs = require('fs');
var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();

var camera = null;
exports.ready = false;
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

// Take picture without downloading immediately




exports.takePicture = async function () {
    exports.ready = false;
    try {
        camera.takePicture({ download: false }, function (er, path) {
            console.log(path);
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