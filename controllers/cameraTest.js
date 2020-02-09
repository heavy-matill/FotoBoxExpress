var fs = require('fs');
var gphoto2 = require('gphoto2');
var waitOn = require('wait-on');
var sleep = require('sleep');

var nconf = require('nconf');
var i = 0
var camera = null;
var GPhoto = null;
//exports.ready = true;



getCamera = async function () {
    GPhoto = new gphoto2.GPhoto2();
    // Negative value or undefined will disable logging, levels 0-4 enable it.
    GPhoto.setLogLevel(1);
    GPhoto.on('log', function (level, domain, message) {
        console.log(domain, message);
    });

    // List cameras / assign list item to variable to use below options
    GPhoto.list(function (list) {
        if (list.length === 0) throw ('No camera available for connection');
        camera = list[0];
    });
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve('Connected to ', camera.model), 2000)
    });

    let result = await promise; // wait until the promise resolves (*)
    console.log(result);
}

/*exports.*/takePicture = async function () {
    // Pass filename to this function
    var fileName = nconf.get('Paths:localFotos') + '/picture' + i++ + '.jpg';
    //exports.ready = false;
    try {
        await camera.takePicture({
            targetPath: '/tmp/foo.XXXXXX'
          }, function (error, tmpname) {
        //await camera.takePicture({ download: true }, function (error, data) {
            switch (error) {
                case -52:
                    // USB Device not available
                    console.log('USB Device not available. Reconnecting')
                    init();
                    break;

                case -7:
                    // USB Device not available
                    console.log('USB Device not available. Reconnecting')
                    init();
                    break;

                default:
                    if (error) throw (error)
                    //fs.writeFileSync(fileName, data);                    
                    fs.renameSync(tmpname, fileName);
                    break;
            }
        });
    } catch (error) {

    }

    console.log('Camera ready');
    //exports.ready = true;
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

async function init() {
    await getCamera();
    await takePicture();
}

init();
