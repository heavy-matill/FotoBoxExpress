var nconf = require('nconf')

exports.strEvent = "Geburtstag_von_xyz"
exports.strEventDate = "2018-03-26"
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