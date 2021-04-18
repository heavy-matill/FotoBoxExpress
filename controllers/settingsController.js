var nconf = require('nconf')
var fotoBoxController = require('./fotoBoxController')
nconf.file({
	file: 'config.json'
})

exports.strEvent = "Geburtstag_von_xyz"
exports.strEventDate = "2018-03-26"

exports.setCameraIP = async function (strIP) {
	nconf.set("Camera:IP", strIP);
	await nconf.save()
};

exports.setEventName =  async function (strEventName) {
	await nconf.set("Event:Name", strEventName);	
	await nconf.save()
};
exports.setEventDate = async function (strEventDate) {
	await nconf.set("Event:Date", strEventDate);	
	await nconf.save()
};
exports.strUnique = (nconf.get("Event:Date") + "_" + nconf.get("Event:Name")).replace(/[^a-zA-Z0-9\-]+/g, "_");

exports.pathLocalFotos = "public/fotos/" + exports.strUnique;
exports.pathLocalThumbnails = "public/thumbnails/" + exports.strUnique;
exports.pathPublicFotos = "fotos/" + exports.strUnique;
exports.pathPublicThumbnails = "thumbnails/" + exports.strUnique;

exports.setMongoServer = async function (strMongoServer) {
	nconf.set("Mongo:Server", strMongoServer);
	await nconf.save()
};
exports.setMongoPort = async function (strMongoPort) {
	nconf.set("Mongo:Port", strMongoPort);
	await nconf.save()
};
exports.setMongoDB = async function (strMongoDB) {
	nconf.set("Mongo:DB", strMongoDB);
	await nconf.save()
};
exports.mongoURL = "mongodb://" + nconf.get("Mongo:Server") + ":" + nconf.get("Mongo:Port") + "/" + nconf.get("Mongo:DB");

exports.tOutStartSlideShow = Number(nconf.get("FotoBox:tOutStartSlideShow"));
exports.tOutNextSlide = Number(nconf.get("FotoBox:tOutNextSlide"));;
exports.setFotoBoxSettings = async function (tOutStartSlideShow, tOutNextSlide, tTriggerDelay) {
	this.tOutStartSlideShow = tOutStartSlideShow;
	this.tOutNextSlide = tOutNextSlide;
	this.tTriggerDelay = tTriggerDelay;
	await nconf.save()
};

exports.setPrinterSettings = async function (bEnable = false, grayscaleOptions = '-equalize -colorspace Gray -contrast-stretch 5%x10%') {
	this.bEnable = bEnable;
	this.grayscaleOptions = grayscaleOptions;
	await nconf.save()
};

exports.urlMongoDB = function () {
	return "mongodb://" + this.strMongoServer + ":" + this.strMongoPort + "/" + this.strMongoDB;
};

/*exports.saveSettings = async function (data) {
	// change this to call each of the setter functions than overwriting with the passed bunch
	nconf.set("Event", data.Event)
	nconf.set("FotoBox", data.FotoBox)
	nconf.set("Camera", data.Camera)
	nconf.set("Printer", data.Printer)
	nconf.set("Mongo", data.Mongo)
	nconf.set("Paths", data.Paths)
	await nconf.save()
};*/
exports.save = async function () {
	nconf.save();
};

exports.saveInit = async function () {
	nconf.save()
	await fotoBoxController.init()
}