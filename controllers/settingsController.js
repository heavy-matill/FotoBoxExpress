var config = require('../config')
var fotoBoxController = require('./fotoBoxController')
var socketApi = require('../socketApi');
var io = socketApi.io;


exports.strEvent = "Geburtstag_von_xyz"
exports.strEventDate = "2018-03-26"

exports.setCameraSettings = async function(strIP, strWidth, strHeight) {
    config.set("Camera:IP", strIP);
    config.set("Camera:width", strWidth);
    config.set("Camera:height", strHeight);
    await config.save()
};

exports.setSerialPath = async function(strSerialPath) {
    await config.set("Serial:Path", strSerialPath);
    await config.save()
};
exports.strSerialPath = config.get("Serial:Path");

exports.setEventName = async function(strEventName) {
    await config.set("Event:Name", strEventName);
    await exports.setStringUnique(exports.strUnique())
    await config.save()
};
exports.setEventDate = async function(strEventDate) {
    await config.set("Event:Date", strEventDate);
    await exports.setStringUnique(exports.strUnique())
    await config.save()
};
exports.setStringUnique = async function(strUnique) {
    await config.set("Paths:strUnique", strUnique)
    await config.set("Paths:localFotos", "public/fotos/" + strUnique)
    await config.set("Paths:localThumbnails", "public/thumbnails/" + strUnique)
    await config.set("Paths:publicFotos", "fotos/" + strUnique)
    await config.set("Paths:publicThumbnails", "thumbnails/" + strUnique)
    await config.save()
}
exports.strUnique = function() {
    return (config.get("Event:Date") + "_" + config.get("Event:Name")).replace(/[^a-zA-Z0-9\-]+/g, "_");
}

exports.setLeft = async function(numLeft) {
    await config.set("FotoBox:numLeft", numLeft)
    if (numLeft < 100) {
        io.emit('storageWarning', true);
    } else {
        io.emit('storageWarning', false);
    }
    await config.save()
}

exports.decreaseLeft = async function() {
    await exports.setLeft(config.get("FotoBox:numLeft") - 1)
}

/*exports.pathLocalFotos = "public/fotos/" + exports.strUnique;
exports.pathLocalThumbnails = "public/thumbnails/" + exports.strUnique;
exports.pathPublicFotos = "fotos/" + exports.strUnique;
exports.pathPublicThumbnails = "thumbnails/" + exports.strUnique;
*/
exports.setMongoServer = async function(strMongoServer) {
    config.set("Mongo:Server", strMongoServer);
    await config.save()
};
exports.setMongoPort = async function(strMongoPort) {
    config.set("Mongo:Port", strMongoPort);
    await config.save()
};
exports.setMongoDB = async function(strMongoDB) {
    config.set("Mongo:DB", strMongoDB);
    await config.save()
};
exports.mongoURL = "mongodb://" + config.get("Mongo:Server") + ":" + config.get("Mongo:Port") + "/" + config.get("Mongo:DB");

exports.tOutStartSlideShow = Number(config.get("FotoBox:tOutStartSlideShow"));
exports.tOutNextSlide = Number(config.get("FotoBox:tOutNextSlide"));;
exports.setFotoBoxSettings = async function(tOutStartSlideShow, tOutNextSlide, tTriggerDelay) {
    this.tOutStartSlideShow = tOutStartSlideShow;
    this.tOutNextSlide = tOutNextSlide;
    this.tTriggerDelay = tTriggerDelay;
    await config.save()
};

exports.setPrinterSettings = async function(bEnable = false, grayscaleOptions = '-equalize -colorspace Gray -contrast-stretch 5%x10%') {
    this.bEnable = bEnable;
    this.grayscaleOptions = grayscaleOptions;
    await config.save()
};

exports.urlMongoDB = function() {
    return "mongodb://" + this.strMongoServer + ":" + this.strMongoPort + "/" + this.strMongoDB;
};

exports.saveSettings = async function(data) {
    await exports.setEventName(data.Event.Name);
    await exports.setEventDate(data.Event.Date);
    await exports.setFotoBoxSettings(data.FotoBox.tOutStartSlideShow, data.FotoBox.tOutNextSlide, data.FotoBox.tTriggerDelay);
    await exports.setLeft(data.FotoBox.numLeft);
    await exports.setCameraSettings(data.Camera.IP, data.Camera.width, data.Camera.height);
    //"Camera": "IP": document.getElementById("Camera-IP").value
    await exports.setPrinterSettings(data.Printer.bEnable, data.Printer.grayscaleOptions);
    await exports.setMongoServer(data.Mongo.Server);
    await exports.setMongoPort(data.Mongo.Port);
    await exports.setMongoDB(data.Mongo.DB);
    await exports.saveInit();
};
exports.save = async function() {
    await config.save();
};

exports.saveInit = async function() {
    await config.save()
    await fotoBoxController.init()
}