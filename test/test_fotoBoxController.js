var server = require('../bin/www');
var assert = require('assert');
var request = require('request');
var fs = require('fs');

var fotoBoxController = require('../controllers/fotoBoxController');
var settingsController = require('../controllers/settingsController');
const { settings } = require('cluster');

describe('Setup', function(){
    let fileName = "dummy.jpg"
    let fileName2 = "dummy2.jpg"
    let fileName3 = "dummy3.jpg"
    let strUnique1 = "test"
    let strUnique2 = "event"    
    let strUnique = strUnique1 + "_" + strUnique2;
    this.timeout(2000);
    it('initializes unique string', async function () {
      await settingsController.setEventDate(strUnique1);
      await settingsController.setEventName(strUnique2);
      await settingsController.save();
      assert(settingsController.strUnique == strUnique);
    });
    it('initializes paths', async function() { 
        await fs.rmdirSync(settingsController.pathLocalFotos, { recursive: true });
        await fs.rmdirSync(settingsController.pathLocalThumbnails, { recursive: true });
        await settingsController.saveInit();
        assert(fs.existsSync(settingsController.pathLocalFotos));
        assert(fs.existsSync(settingsController.pathLocalThumbnails));
    });
    it('refreshes with empty file list', async function() { 
        assert(fotoBoxController.stringsFiles.length == 0)
    });
});


