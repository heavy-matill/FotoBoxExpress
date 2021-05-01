var config = require('../config')
var fotoBoxController = require('./fotoBoxController')


exports.strEvent = "Geburtstag_von_xyz"
exports.strEventDate = "2018-03-26"

exports.setCameraIP = async function (strIP) {
	config.set("Camera:IP", strIP);
	await config.save()
};

exports.setSerialPath = async function (strSerialPath) {
	await config.set("Serial:Path", strSerialPath);
	await config.save()
};
exports.strSerialPath = config.get("Serial:Path");

exports.setEventName = async function (strEventName) {
	await config.set("Event:Name", strEventName);
	await exports.setStringUnique(exports.strUnique())
	await config.save()
};
exports.setEventDate = async function (strEventDate) {
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

/*exports.pathLocalFotos = "public/fotos/" + exports.strUnique;
exports.pathLocalThumbnails = "public/thumbnails/" + exports.strUnique;
exports.pathPublicFotos = "fotos/" + exports.strUnique;
exports.pathPublicThumbnails = "thumbnails/" + exports.strUnique;
*/
exports.setMongoServer = async function (strMongoServer) {
	config.set("Mongo:Server", strMongoServer);
	await config.save()
};
exports.setMongoPort = async function (strMongoPort) {
	config.set("Mongo:Port", strMongoPort);
	await config.save()
};
exports.setMongoDB = async function (strMongoDB) {
	config.set("Mongo:DB", strMongoDB);
	await config.save()
};
exports.mongoURL = "mongodb://" + config.get("Mongo:Server") + ":" + config.get("Mongo:Port") + "/" + config.get("Mongo:DB");

exports.tOutStartSlideShow = Number(config.get("FotoBox:tOutStartSlideShow"));
exports.tOutNextSlide = Number(config.get("FotoBox:tOutNextSlide"));;
exports.setFotoBoxSettings = async function (tOutStartSlideShow, tOutNextSlide, tTriggerDelay) {
	this.tOutStartSlideShow = tOutStartSlideShow;
	this.tOutNextSlide = tOutNextSlide;
	this.tTriggerDelay = tTriggerDelay;
	await config.save()
};

exports.setPrinterSettings = async function (bEnable = false, grayscaleOptions = '-equalize -colorspace Gray -contrast-stretch 5%x10%') {
	this.bEnable = bEnable;
	this.grayscaleOptions = grayscaleOptions;
	await config.save()
};

exports.urlMongoDB = function () {
	return "mongodb://" + this.strMongoServer + ":" + this.strMongoPort + "/" + this.strMongoDB;
};

/*exports.saveSettings = async function (data) {
	// change this to call each of the setter functions than overwriting with the passed bunch
	config.set("Event", data.Event)
	config.set("FotoBox", data.FotoBox)
	config.set("Camera", data.Camera)
	config.set("Printer", data.Printer)
	config.set("Mongo", data.Mongo)
	config.set("Paths", data.Paths)
	await config.save()
};*/
exports.save = async function () {
	await config.save();
};

exports.saveInit = async function () {
	await config.save()
	await fotoBoxController.init()
}