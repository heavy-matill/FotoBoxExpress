
//var server = require('../bin/www');
var assert = require('assert');
var fs = require('fs');
var cameraController = require('../controllers/cameraController');
var nconf = require('nconf');

describe('Picture taking', function () {
    this.timeout(10000);
    pathFile = './testpicture.jpg'
    try {
        fs.unlinkSync(pathFile);
    } catch (e) {
        console.log('Tried removing file: ' + pathFile);
        console.log(e);
    }
    it('take a Picture via gphoto2 shell and store locally', async function () {
        await cameraController.takePicture(pathFile);
        assert(fs.statSync(pathFile).size > 1e5);
        console.log(fs.statSync(pathFile).size);
        fs.unlinkSync(pathFile);
    });
});

