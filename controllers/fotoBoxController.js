var http = require("http");
var socketApi = require('../socketApi');
var io = socketApi.io;
var fs = require('fs');
var monk = require('monk')
var thumb = require('node-thumbnail').thumb;
var tq = require('task-queue');
var nconf = require('nconf');
var sharp = require('sharp');
var path = require("path")
var printerController = require('./printerController')


var queue = tq.Queue({capacity: 100, concurrency: 1});


exports.stringsFiles = [];
exports.intervalNextFoto;

var db = monk(nconf.get("Mongo:URL"));
db.create(nconf.get("Mongo:Collection"), function(err){
	console.log(err);
});
var fotosdb = db.get(nconf.get("Mongo:Collection"));

// initialize Fotos collection with db.Fotos.createIndex({name: 1, ctime: 1}, {unique:true})
exports.init = function(){	
	console.log(nconf.get("Mongo:Collection"));
	// initialize MongoDB connection
	var db = monk(nconf.get("Mongo:URL"));
	db.create(nconf.get("Mongo:Collection"), function(err){
		console.log(err);
	});
	var fotosdb = db.get(nconf.get("Mongo:Collection"));
	fotosdb.createIndex({name: 1, ctime: 1}, {unique:true})
	// create folders
	if (!fs.existsSync(nconf.get("Paths:localFotos"))) {
		fs.mkdirSync(nconf.get("Paths:localFotos"));
	}
	if (!fs.existsSync(nconf.get("Paths:localThumbnails"))) {
		fs.mkdirSync(nconf.get("Paths:localThumbnails"));
	}

	clearInterval(exports.intervalNextFoto);
	exports.stopQueue();
	
	refreshFiles();

	exports.intervalNextFoto = setInterval(exports.displayNextFoto,nconf.get("FotoBox:tOutNextSlide"))
	exports.startQueue();
}

exports.stopQueue = function(){
	queue.stop();
};
exports.startQueue = function(){
	queue.start();
};

function markReadyThumbnail(fileName) {
	fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"readyThumb": true} })
	})
}

exports.markReadyPrint = function(fileName) {	
	var requestedPrint = false
	fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"readyPrint": true} })
		requestedPrint = docList[0].requestedPrint
	})
	return requestedPrint
}

exports.getReadyPrint = function(fileName) {	
	var readyPrint = false
	fotosdb.find({"name": fileName}, function(err, docList){
		readyPrint = docList[0].readyPrint
	})
	return readyPrint
}

exports.markRequestedPrint = function(fileName) {	
	fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"requestedPrint": true} })
	})
}

function refreshFiles(){	
	exports.stringsFiles = [];
	deactivateAllFotos();
	fs.readdir(nconf.get("Paths:localFotos"), function(err, files){
		if (err){
			return console.error(err);
		}
		files.forEach( function (file){
			if(!fotosdb.count({"name": file})){				
				this.addNewFoto(file);
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
};

function deactivateFoto(name){
	fotosdb.update(
		{ "name":name },
		{ $set: {"available": false }});
	console.log("deactivated " + name);
};

function deactivateAllFotos(){
	fotosdb.update(
		{ },
		{ $set: {"available": false }},
		{ multi: true});
	console.log("deactivated all");
};

function reactivateFoto(name){
	fotosdb.update(
		{ "name": name },
		{ $set: {"available": true }});
	console.log("reactivated " + name);
};

exports.displayFoto = function(file){    
	io.emit('displayFoto', nconf.get("Paths:publicFotos")+'/'+file);
	console.log('Displaying '+file);
};

exports.displayNewFoto = function(file){  
	exports.displayFoto(file);  
	clearTimeout(exports.intervalNextFoto);
	exports.intervalNextFoto = setTimeout(exports.displaySlideShow, nconf.get("FotoBox:tOutStartSlideShow"));	
};

exports.displaySlideShow = function(){	
	exports.startQueue();
	clearTimeout(exports.intervalNextFoto);
	exports.intervalNextFoto = setInterval(exports.displayNextFoto,nconf.get("FotoBox:tOutNextSlide"));	
};

exports.displayNextFoto = function(){	
	exports.startQueue();
	if(exports.stringsFiles.length>0)
	{	
		//files in array, display in random order and remove from array
		var randomIndex = Math.floor(Math.random() * exports.stringsFiles.length);
		exports.displayFoto(exports.stringsFiles[randomIndex]);
		exports.stringsFiles.splice(randomIndex,1);
	} else {
		refreshFiles();
	}
};

exports.addNewFoto = function(file){
	//stop generating thumbnails
	exports.stopQueue();
  	//add to random queue
  	exports.stringsFiles.push(file)
    //get creation timestamp ... to be exported to model
	fs.stat(nconf.get("Paths:localFotos") + '/' + file, function(err, stats){      
		//insert to MongoDB
		fotosdb.insert({
			name: file, 
			timestamp: stats.ctime, 
			likes: [],
			readyThumb: false,
			readyPrint: false,
			requestedPrint: false,			 
			available: true,
		});
	});
	console.log('File', file, 'has been added');
	queue.enqueue(exports.createThumbnail, {args: [file]});
};

exports.downloadNewFoto = function(imageUrl){
	let file = path.basename(imageUrl)	
	http.get(imageUrl, function(res) {
  		var stream = res.pipe(fs.createWriteStream(nconf.get("Paths:localFotos") + '/' + file));
  		stream.on('finish', function () {
				exports.displayNewFoto(file);
				exports.addNewFoto(file);
  		});
	});
};

exports.createThumbnail = function(file){
	let localSourceImage = nconf.get("Paths:localFotos")+'/'+file
	let localThumbImage = nconf.get("Paths:localThumbnails")+'/'+file
	if(!fs.existsSync(localThumbImage)) {
		sharp(localSourceImage).resize(300).toFile(localThumbImage).then(function() {
				markReadyThumbnail(file)
				printerController.createGrayscale(file)
		})
	}
}