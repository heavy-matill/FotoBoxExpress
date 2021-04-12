
var server = require('../bin/www');
var assert = require('assert');
var nconf = require('nconf');
var fs = require('fs');

var settingsController = require('../controllers/settingsController');

describe('changes Settings', function() {
    let strEvent = 'test event'
    let datEvent = '2021-04-11'
    let strUnique = datEvent+'_test_event'
    let strAdd = "add something"
    it('changes event name', async function() {
        await settingsController.setEventName(strEvent+strAdd);
        assert(nconf.get("Event:Name") == strEvent+strAdd);
        await settingsController.setEventName(strEvent);
        assert(nconf.get("Event:Name") == strEvent);
    });
    it('changes event date', async function() {
        await settingsController.setEventDate(datEvent+strAdd);
        assert(nconf.get("Event:Date") == datEvent+strAdd);
        await settingsController.setEventDate(datEvent);
        assert(nconf.get("Event:Date") == datEvent);
    });
    it('changes unique string', async function() {
        assert(settingsController.strUnique == strUnique);
    });
    it('adapts paths', function() {
        assert(settingsController.pathLocalFotos == "public/fotos/" + strUnique);
        assert(settingsController.pathLocalThumbnails == "public/thumbnails/" + strUnique);
        assert(settingsController.pathPublicFotos == "fotos/" + strUnique);
        assert(settingsController.pathPublicThumbnails == "thumbnails/" + strUnique);
    });
    it('initializes paths', async function() { 
        await fs.rmdirSync(settingsController.pathLocalFotos, { recursive: true });
        await fs.rmdirSync(settingsController.pathLocalThumbnails, { recursive: true });
        await settingsController.saveInit();
        assert(fs.existsSync(settingsController.pathLocalFotos));
        assert(fs.existsSync(settingsController.pathLocalThumbnails));
    });
});

