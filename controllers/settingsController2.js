var nconf = require('nconf')
var fotoBoxController = require('./fotoBoxController')
var dbController = require('./dbController')

exports.strEvent = "Geburtstag_von_xyz"
exports.strEventDate = "2018-03-26"

exports.get = function(key) {
	switch (key) {
		// Paths
		"Paths:localFotos": 
			return "public/fotos/" + strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))
			
		"Paths:localThumbnails":
			return "public/thumbnails/" + strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))
		
		"Paths:publicFotos":
			return "fotos/" + strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))
		
		"Paths:publicThumbnails": 
			return "thumbnails/" + strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))
			
		"Paths:strUnique":
			return strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))
			
		// Mongo
		"Mongo:Collection":
			return nconf.get("Event:Date") + " " + nconf.get("Event:Name")
			
		"Mongo:URL":
			return "mongodb://" + nconf.get("Mongo:Server") + ":" + nconf.get("Mongo:Port") + "/" + nconf.get("Mongo:DB")
		
		// FotoBox
		"FotoBox:tOutStartSlideShow":
			return int(nconf.get("FotoBox:tOutStartSlideShow"))
			
		"FotoBox:tOutNextSlide":
			return int(nconf.get("FotoBox:tOutNextSlide"))
			
		"FotoBox:tTriggerDelay":
			return int(nconf.get("FotoBox:tTriggerDelay"))
		
		// return all other
		default:
			return nconf.get(key)
	}
}

function strUnique(strEventDate, strEventName){
	return (strEventDate + "_" + strEventName).replace(/[^a-zA-Z0-9\-]+/g,"_");
};

/*
exports.setPrinterSettings = function(bEnable=false, grayscaleOptions='-equalize -colorspace Gray -contrast-stretch 5%x10%'){
	this.bEnable = bEnable;
    this.grayscaleOptions = grayscaleOptions;
};*/

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
	nconf.set("Event", data.Event)
	nconf.set("FotoBox", data.FotoBox)
	nconf.set("Camera", data.Camera)
	nconf.set("Printer", data.Printer)
	nconf.set("Mongo", data.Mongo)
    nconf.set("Paths", data.Paths)
	exports.saveInit()
};
exports.saveInit = function(){
	nconf.save()
	fotoBoxController.init()
	dbController.init()
}