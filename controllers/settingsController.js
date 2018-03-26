exports.tOutStartSlideShow = 15000;
exports.tOutNextSlide = 5000;
exports.setFotoBoxSettings = function(dataFotoBox){
	this.tOutStartSlideShow = dataFotoBox.tOutStartSlideShow;
	this.tOutNextSlide = dataFotoBox.tOutNextSlide;
};

exports.publicImagesPath = 'fotos/Geburtstag von xyz';
exports.publicThumbnailsPath = 'thumbnails/Geburtstag von xyz';
exports.localImagesPath = 'public/' + this.publicImagesPath;
exports.localThumbnailsPath = 'public/' + this.publicThumbnailsPath;
exports.setPathSettings = function(dataFotoBox){
	this.publicImagesPath = dataFotoBox.publicImagesPath;
	this.publicThumbnailsPath = dataFotoBox.publicThumbnailsPath;
	this.localImagesPath = 'public/' + this.publicImagesPath;
	this.localThumbnailsPath = 'public/' + this.publicThumbnailsPath;
};

exports.strMongoServer = "localhost";
exports.strMongoPort = "27017";
exports.strMongoDB = "FotoBox";
exports.urlMongoDB = function(){
	return "mongodb://" + this.strMongoServer + ":" + this.strMongoPort + "/" + this.strMongoDB;
};
exports.setMongoSettings = function(dataMongo){
	this.strMongoServer = dataMongo.strMongoServer;
	this.strMongoPort = dataMongo.strMongoPort;
	this.strMongoDB = dataMongo.strMongoDB;
};

exports.strEvent = "Geburtstag von xyz"
exports.strEventDate = "2018-03-26"
exports.strMongoCollection = function(){
	return this.strEventDate + " " + this.strEvent;
};
exports.setEventSettings = function(dataEvent){
	this.strEvent = dataEvent.strEvent;
	this.strEventDate = dataEvent.strEventDate;
};