var fs = require('fs');
var gphoto2 = require('gphoto2');
var waitOn = require('wait-on');

var nconf = require('nconf');
var i = 0
var camera = null;
var GPhoto = null;
exports.ready = true;

// List cameras / assign list item to variable to use below options

getCamera = async function () {
    GPhoto = new gphoto2.GPhoto2();
    // Negative value or undefined will disable logging, levels 0-4 enable it.
    GPhoto.setLogLevel(1);
    GPhoto.on('log', function (level, domain, message) {
        console.log(domain, message);
    });

    
    GPhoto.list(function (list) {
        if (list.length === 0)  ('No camera available for connection');
        camera = list[0];
    });
    let promise = new Promise((resolve, reject) => {
        // wait 2 seconds
        setTimeout(() => resolve('Connected'), 2000)
    });
    let result = await promise; // wait until the promise resolves (*)
    console.log(result, 'to', camera.model);
}

exports.takePicture = async function () {
    // Pass filename to this function
    var fileName = nconf.get('Paths:localFotos') + '/picture' + i++ + '.jpg';
    exports.ready = false;
    try {
        await camera.takePicture({ download: true }, function (error, data) {
            switch (error) {
                case -52:
                    // USB Device not available
                    console.log('USB Device not available. Reconnecting')
                    init(fileName);
                    break;
    
                case -7:
                    // USB Device not available
                    console.log('USB Device not available. Reconnecting')
                    init(fileName);
                    break;
    
                default:
                    if (error) throw (error)
                    break;        
                }
            fs.writeFileSync(fileName, data);
        });
    } catch (error) {
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
        fotoBoxController.displayNewFoto(fileName)
        fotoBoxController.addNewFoto(fileName)
    } catch (error) {
        // kill gphoto2 because possibly stuck
        console.log('Stuck :(')
    }
}

async function init(fileName) {
    await getCamera();
    if (fileName) {
        await takePicture();
    }
}

init();
