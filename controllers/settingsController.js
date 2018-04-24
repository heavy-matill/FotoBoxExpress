var nconf = require('nconf');
var fotoBoxController = require('./fotoBoxController');
var gallery = require('../routes/gallery');

exports.strEvent = "Geburtstag_von_xyz"
exports.strEventDate = "2018-03-26"

exports.setSourceIP = function(strIP, bSave=true){
	nconf.set("Source:IP", strIP);
	if(bSave)
		exports.saveSettings();
};

exports.strMongoCollection = function(){
	return this.strEventDate + " " + this.strEvent;
};
exports.setEventSettings = function(strEvent, strEventDate){
	this.strEvent = strEvent;
	this.strEventDate = strEventDate;
};

exports.tOutStartSlideShow = 15000;
exports.tOutNextSlide = 5000;
exports.setFotoBoxSettings = function(tOutStartSlideShow, tOutNextSlide){
	this.tOutStartSlideShow = dataFotoBox.tOutStartSlideShow;
	this.tOutNextSlide = dataFotoBox.tOutNextSlide;
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
	nconf.overrides(data);

	nconf.save();

	fotoBoxController.init();
	//gallery.init();
}