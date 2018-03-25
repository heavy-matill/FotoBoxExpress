var http = require("http");
var socketApi = require('../socketApi');
var io = socketApi.io;
var fs = require('fs');
var monk = require('monk')
var thumb = require('node-thumbnail').thumb;

var settingsController = require('./settingsController');

exports.stringsFiles = [];
exports.intervalNextFoto;

// initialize Fotos collection with db.Fotos.createIndex({name: 1, ctime: 1}, {unique:true})
var db = monk("mongodb://localhost:27017/FotoBox");
var fotosdb = db.get("Fotos");


exports.init = function(){	
	// create folders
	if (!fs.existsSync(settingsController.localImagesPath)) {
		fs.mkdirSync(settingsController.localImagesPath);
	}
	if (!fs.existsSync(settingsController.localThumbnailsPath)) {
		fs.mkdirSync(settingsController.localThumbnailsPath);
	}
	clearInterval(settingsController.intervalNextFoto);
	
	refreshFiles();

	exports.intervalNextFoto = setInterval(exports.displayNextFoto,settingsController.tOutNextSlide)
	
};

function refreshFiles(){	
	exports.stringsFiles = [];
	deactivateAllFotos();
	fs.readdir(settingsController.localImagesPath, function(err, files){
		if (err){
			return console.error(err);
		}
		files.forEach( function (file){
			if(!fotosdb.count({"name": file})){				
				exports.addNewFoto(file);
			}
			else{		
				reactivateFoto(file);
			}
			exports.stringsFiles.push(file);
		});
	});
};

function refreshDatabase(){
	//deactivate
	var imageDataStruct = fotosdb.find({active: true},{"name": 1});
    imageDataStruct.each((entry, {close, pause, resume}) => {    
		var indexFiles = exports.stringsFiles.indexOf(entry.name);
		if (indexFiles < 0){
			deactivateFoto(entry.name);
		}
	});
	//reactivate
	var imageDataStruct = fotosdb.find({active: false},{"name": 1});
    imageDataStruct.each((entry, {close, pause, resume}) => {    
		var indexFiles = exports.stringsFiles.indexOf(entry.name);
		if (indexFiles > -1){
			reactivateFoto(entry.name);
		}
	});
}

function deactivateFoto(name){
	fotosdb.update(
		{ "name":name },
		{ $set: {"available": false }});
	console.log("deactivated " + name);
}

function deactivateAllFotos(){
	fotosdb.update(
		{ },
		{ $set: {"available": false }},
		{ multi: true});
	console.log("deactivated all");
}

function reactivateFoto(name){
	fotosdb.update(
		{ "name": name },
		{ $set: {"available": true }});
	console.log("reactivated " + name);
}

exports.displayFoto = function(file){    
	io.emit('displayFoto', settingsController.publicImagesPath+'/'+file);
	console.log('Displaying '+file);
};

exports.displayNewFoto = function(file){  
	exports.displayFoto(file);  
	clearTimeout(exports.intervalNextFoto);
	exports.intervalNextFoto = setTimeout(exports.displaySlideShow, settingsController.tOutStartSlideShow);	
};

exports.displaySlideShow = function(){
	clearTimeout(exports.intervalNextFoto);
	exports.intervalNextFoto = setInterval(exports.displayNextFoto,settingsController.tOutNextSlide);	
};

exports.displayNextFoto = function(){
	if(exports.stringsFiles.length>0)
	{	
		//files in array, display in random order and remove from array
		var randomIndex = Math.floor(Math.random() * exports.stringsFiles.length);
		exports.displayFoto(exports.stringsFiles[randomIndex]);
		exports.stringsFiles.splice(randomIndex,1);
	}
};

exports.addNewFoto = function(file){
  	//add to random queue
  	exports.stringsFiles.push(file)
    //get creation timestamp ... to be exported to model
	fs.stat(settingsController.localImagesPath + '/' + file, function(err, stats){      
		//insert to MongoDB
		fotosdb.insert({
			name: file, 
			timestamp: stats.ctime, 
			likes: [], 
			available: true,
		});
	});
	console.log('File', file, 'has been added');
	exports.createThumbnail(file);
};

exports.downloadNewFoto = function(folder,file){
	var request = http.get("http://192.168.178.27/DCIM/" + folder + "/" + file, function(res) {
  		var stream = res.pipe(fs.createWriteStream(settingsController.localImagesPath + '/' + file));
  		stream.on('finish', function () {
			exports.displayNewFoto(file);
			exports.addNewFoto(file);
  		});
	});
};

exports.createThumbnail = function(file){
	thumb({
		source: settingsController.localImagesPath+'/'+file, // could be a filename: dest/path/image.jpg
		destination: settingsController.localThumbnailsPath,
		concurrency: 1,
		width: 300,
		height: 200
	}, function(files, err, stdout, stderr) {
		console.log('Thumbnail for '+file+' generated!');
	});
};

