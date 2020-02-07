var fs = require('fs');
var gphoto2 = require('gphoto2');
var waitOn = require('wait-on');
var GPhoto = new gphoto2.GPhoto2();

var nconf = require('nconf');


// Negative value or undefined will disable logging, levels 0-4 enable it.
GPhoto.setLogLevel(4);
GPhoto.on('log', function (level, domain, message) {
    console.log(domain, message);
});
var fileName = nconf.get('Paths:localFotos') + '/picture.jpg'
async function takePicture() {
    // List cameras / assign list item to variable to use below options
    GPhoto.list(function (list) {
        if (list.length === 0) return;
        var camera = list[0];
        console.log('Found', camera.model);

        /*// get configuration tree
        camera.getConfig(function (er, settings) {
          console.log(settings);
        });*/

        /*// Set configuration values
        camera.setConfigValue('capturetarget', 1, function (er) {
          //...
        });*/
        
        // Take picture and download it to filesystem
        camera.takePicture({
            targetPath: '/tmp/foo.XXXXXX'
        }, function (er, tmpname) {
            fs.renameSync(tmpname, fileName);
        });
    });
    await waitOn({
        resources: [
            fileName,]
        , timeout: 3000
    })
    console.log('File available: ' + fileName);
    //fotoBoxController.displayNewFoto(fileName)
	//fotoBoxController.addNewFoto(fileName)
}

takePicture();