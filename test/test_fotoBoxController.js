var server = require('../bin/www');
var assert = require('assert');
var request = require('request');
var fs = require('fs');
var path = require("path");

var fotoBoxController = require('../controllers/fotoBoxController');
var settingsController = require('../controllers/settingsController');
const {
  settings
} = require('cluster');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('Setup', function () {
  let fileSrc = "test/rick.jpg"
  let fileFound = "found.jpg"
  let fileAdd = "add.jpg"
  let fileManual = "manual.jpg"
  let fileName3 = "dummy3.jpg"
  let strUnique1 = "test"
  let strUnique2 = "event"
  let strUnique = strUnique1 + "_" + strUnique2;
  this.timeout(5000);
  it('initializes unique string', async function () {
    await settingsController.setEventDate(strUnique1);
    await settingsController.setEventName(strUnique2);
    await settingsController.save();
    assert(settingsController.strUnique == strUnique);
  });
  it('initializes paths', async function () {
    fs.rmdirSync(settingsController.pathLocalFotos, {
      recursive: true
    });
    fs.rmdirSync(settingsController.pathLocalThumbnails, {
      recursive: true
    });
    await settingsController.saveInit();
    assert(fs.existsSync(settingsController.pathLocalFotos));
    assert(fs.existsSync(settingsController.pathLocalThumbnails));
  });
  it('refreshes with empty file list', async function () {
    assert(fotoBoxController.stringsFiles.length == 0)
  });
  it('lists a copied file', async function () {
    fs.copyFileSync(fileSrc, path.join(settingsController.pathLocalFotos, fileFound));
    await fotoBoxController.refreshFiles()
    await sleep(100);
    assert(fotoBoxController.stringsFiles.length == 1)
  });
  it('generates thumbnail for found file if none existed before', async function () {
    await sleep(100);
    assert(fs.existsSync(path.join(settingsController.pathLocalThumbnails, fileFound)));
  });
  it('manually adds file', async function () {
    fotoBoxController.stop()
    fs.copyFileSync(fileSrc, path.join(settingsController.pathLocalFotos, fileManual));
    let listLength = fotoBoxController.stringsFiles.length;
    fotoBoxController.addNewFoto(fileManual);
    assert(listLength + 1 == fotoBoxController.stringsFiles.length);
  });
  it('does not generate thumbnail if queue paused', async function () {
    await sleep(100);
    assert(!fs.existsSync(path.join(settingsController.pathLocalThumbnails, fileManual)));
  });
  it('manually generates thumbnail', async function () {
    await fotoBoxController.createThumbnail(fileManual);
    assert(fs.existsSync(path.join(settingsController.pathLocalThumbnails, fileManual)));
  });
  it('adds and generates thumbnail', async function () {
    fotoBoxController.stopQueue();
    fs.copyFileSync(fileSrc, path.join(settingsController.pathLocalFotos, fileAdd));
    let listLength = fotoBoxController.stringsFiles.length;
    fotoBoxController.addNewFoto(fileAdd);
    fotoBoxController.startQueue();
    assert(listLength + 1 == fotoBoxController.stringsFiles.length);
    await sleep(500);
    assert(fs.existsSync(path.join(settingsController.pathLocalThumbnails, fileAdd)));
  });
});