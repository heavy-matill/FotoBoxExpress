var fs = require('fs');
var gphoto2 = require('gphoto2');
var waitOn = require('wait-on');
var fotoBoxController = require('./fotoBoxController');
var path = require("path");

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

exports.takePicture = async function (fileName) {
    var filePath = path.join(nconf.get('Paths:localFotos'),fileName);
    exports.ready = false;
    try {
        await camera.takePicture({ download: true }, function (error, data) {
            switch (error) {
                case -52:
                    // USB Device not available
                    console.log('USB Device not available. Reconnecting')
                    init(filePath);
                    break;
    
                case -7:
                    // USB Device not available
                    console.log('USB Device not available. Reconnecting')
                    init(filePath);
                    break;
    
                default:
                    if (error) throw (error)
                    break;        
                }
            fs.writeFileSync(filePath, data);
            fotoBoxController.startQueue();
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
                filePath,]
            , timeout: 5000
        })
        console.log('File available without callback: ' + filePath);
    } catch (error) {
        // kill gphoto2 because possibly stuck
        console.log(error)
        console.log('Stuck :(')
    }    
    fotoBoxController.displayNewFoto(fileName)
    fotoBoxController.addNewFoto(fileName)
}

async function init(fileName) {
    await getCamera();
    if (fileName) {
        await takePicture(fileName);
    }
}

init();
