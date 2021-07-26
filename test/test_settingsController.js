describe('changes Settings', function () {
    var assert = require('assert');
    let config = require('../config');
    var fs = require('fs');
    let settingsController = require('../controllers/settingsController');

    let strEvent = 'test event'
    let datEvent = '2021-04-11'
    let strUnique = datEvent + '_test_event'
    let strAdd = "add something"
    it('changes event name', async function () {
        await settingsController.setEventName(strEvent + strAdd);
        assert(config.get("Event:Name") == strEvent + strAdd);
        await settingsController.setEventName(strEvent);
        assert(config.get("Event:Name") == strEvent);
    });
    it('changes event date', async function () {
        await settingsController.setEventDate(datEvent + strAdd);
        assert(config.get("Event:Date") == datEvent + strAdd);
        await settingsController.setEventDate(datEvent);
        assert(config.get("Event:Date") == datEvent);
    });
    it('changes unique string', async function () {
        console.log(config.get("Paths:strUnique"))
        console.log(strUnique)
        assert(config.get("Paths:strUnique") == strUnique);
    });
    it('adapts paths', function () {
        assert(config.get("Paths:localFotos") == "public/fotos/" + strUnique);
        assert(config.get("Paths:localThumbnails") == "public/thumbnails/" + strUnique);
        assert(config.get("Paths:publicFotos") == "fotos/" + strUnique);
        assert(config.get("Paths:publicThumbnails") == "thumbnails/" + strUnique);
    });
    it('initializes paths', async function () {
        await fs.rmdirSync(config.get("Paths:localFotos"), { recursive: true });
        await fs.rmdirSync(config.get("Paths:localThumbnails"), { recursive: true });
        await settingsController.saveInit();
        assert(fs.existsSync(config.get("Paths:localFotos")));
        assert(fs.existsSync(config.get("Paths:localThumbnails")));
    });
    it('change serial path', async function () {
        let PathTemp = config.get("Serial:Path")
        let Path1 = "COM12"
        let Path2 = "/dev/ttyUSB13"
        await settingsController.setSerialPath(Path1);
        assert(config.get("Serial:Path") == Path1);
        await settingsController.setSerialPath(Path2);
        assert(config.get("Serial:Path") == Path2);
        await settingsController.setSerialPath(PathTemp);
        assert(config.get("Serial:Path") == PathTemp);
    });
});

