var nconf = require('nconf');
var fotoBoxController = require('./fotoBoxController');
var gallery = require('../routes/gallery');  
var fs    = require('fs');

exports.strEvent = "Geburtstag_von_xyz"
exports.strEventDate = "2018-03-26"

exports.setCameraIP = function(strIP, bSave=true){
	nconf.set("Camera:IP", strIP);
	if(bSave)
		exports.saveSettings();
};

exports.setEventSettings = function(strEvent, strEventDate){
	this.strEvent = strEvent;
	this.strEventDate = strEventDate;
};
exports.setEventName = function(strEventName, bSave=true){
	nconf.set("Event:Name", strEventName);
	var strEventDate = nconf.get("Event:Date");	
	exports.setStrUnique(strUnique(strEventDate, strEventName, bSave=false));
	exports.setStrUnique(strMongoCollection(strEventDate, strEventName, bSave=bSave));
};

exports.setEventDate = function(strEventDate, bSave=true){
	nconf.set("Event:Date", strEventName);
	var strEventName = nconf.get("Event:Name");
	exports.setStrUnique(strUnique(strEventDate, strEventName, bSave=false));
	exports.setStrUnique(strMongoCollection(strEventDate, strEventName, bSave=bSave));
};

function strMongoCollection(strEventDate, strEventName){
	return strEventDate + " " + strEventName;
};
exports.setStrMongoCollection = function(strMongoCollection, bSave=true){	
	nconf.set("Mongo:Collection", strMongoCollection);
	if(bSave)
		exports.saveSettings();
};

function strUnique(strEventDate, strEventName){
	return (strEventDate + "_" + strEventName).replace(/[^a-zA-Z0-9\-]+/g,"_");
};
exports.setStrUnique = function(strUnique, bSave=true){
	nconf.set("Paths:localFotos", "public/fotos/" + strUnique);
	nconf.set("Paths:localThumbnails", "public/thumbnails/" + strUnique);
	nconf.set("Paths:publicFotos", "fotos/" + strUnique);
	nconf.set("Paths:publicThumbnails", "thumbnails/" + strUnique);
	nconf.set("Paths:strUnique", strUnique);	
	if(bSave)
		exports.saveSettings();
}

exports.setMongoServer = function(strMongoServer, bSave=true){	
	nconf.set("Mongo:Server", strMongoServer);	
	if(bSave)
		exports.saveSettings();
};
exports.setMongoPort = function(strMongoPort, bSave=true){	
	nconf.set("Mongo:Port", strMongoPort);	
	if(bSave)
		exports.saveSettings();
};
exports.setMongoDB = function(strMongoDB, bSave=true){	
	nconf.set("Mongo:DB", strMongoDB);	
	if(bSave)
		exports.saveSettings();
};
exports.getMongoURL = function(){
	return "mongodb://" + nconf.get("Mongo:Server") + ":" + nconf.get("Mongo:Port") + "/" + nconf.get("Mongo:DB");
};

exports.tOutStartSlideShow = 15000;
exports.tOutNextSlide = 5000;
exports.setFotoBoxSettings = function(tOutStartSlideShow, tOutNextSlide, bPrintFromScreen=false){
	this.tOutStartSlideShow = tOutStartSlideShow;
    this.tOutNextSlide = tOutNextSlide;
    this.bPrintFromScreen = bPrintFromScreen;
};

exports.publicImagesPath = 'fotos/Geburtstag von xyz';
exports.publicThumbnailsPath = 'thumbnails/Geburtstag von xyz';
exports.localImagesPath = 'public/' + this.publicImagesPath;
exports.localThumbnailsPath = 'public/' + this.publicThumbnailsPath;
exports.setPathSettings = function(publicImagesPath, publicThumbnailsPath){
	this.publicImagesPath = publicImagesPath;
	this.publicThumbnailsPath = publicThumbnailsPath;
	this.localImagesPath = 'public/' + this.publicImagesPath;
	this.localThumbnailsPath = 'public/' + this.publicThumbnailsPath;
};

exports.strMongoServer = "localhost";
exports.strMongoPort = "27017";
exports.strMongoDB = "FotoBox";
exports.urlMongoDB = function(){
	return "mongodb://" + this.strMongoServer + ":" + this.strMongoPort + "/" + this.strMongoDB;
};
exports.setMongoSettings = function(strMongoServer, strMongoPort, strMongoDB){
	this.strMongoServer = strMongoServer;
	this.strMongoPort = strMongoPort;
	this.strMongoDB = strMongoDB;
};

exports.saveSettings = function(data){
	nconf.set("Event", data.Event);
	nconf.set("FotoBox", data.FotoBox);
	nconf.set("Camera", data.Camera);
	nconf.set("Mongo", data.Mongo);
    nconf.set("Paths", data.Paths);
	exports.saveInit();
};
exports.saveInit = function(){
	nconf.save();
	fotoBoxController.init();
	//gallery.init();
};