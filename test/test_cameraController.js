describe('Picture taking', function () {
    let assert = require('assert');
    let fs = require('fs');
    let path = require("path");
    let config = require('../config');
    let cameraController = require('../controllers/cameraController');

    this.timeout(10000);
    fileName = 'testpicture.jpg'
    var filePath = path.join(config.get('Paths:localFotos'), fileName);
    try {
        fs.unlinkSync(filePath);
    } catch (e) {
        console.log('Tried removing file: ' + filePath);
        console.log(e);
    }
    it('take a Picture via gphoto2 shell and store locally', async function () {
        await cameraController.takePicture(fileName);
        assert(fs.statSync(filePath).size > 1e5);
        console.log(fs.statSync(filePath).size);
        fs.unlinkSync(filePath);
    });
});

