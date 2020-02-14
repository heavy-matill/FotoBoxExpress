var https = require("https");
var http = require("http");
var socketApi = require('../socketApi');
var io = socketApi.io;
var fs = require('fs');
var monk = require('monk')
var thumb = require('node-thumbnail').thumb;
var tq = require('task-queue');
var nconf = require('nconf');
var sharp = require('sharp');
var path = require("path");
var printerController = require('./printerController')
var dbController = require('./dbController')
//const perf = require('execution-time')();


var queue = tq.Queue({capacity: 100, concurrency: 1});


exports.stringsFiles = [];
exports.intervalNextFoto;

// initialize Fotos collection with db.Fotos.createIndex({name: 1, ctime: 1}, {unique:true})
exports.init = function(){	
	// create folders
	if (!fs.existsSync(nconf.get("Paths:localFotos"))) {
		fs.mkdirSync(nconf.get("Paths:localFotos"), {recursive: true});
	}
	if (!fs.existsSync(nconf.get("Paths:localThumbnails"))) {
		fs.mkdirSync(nconf.get("Paths:localThumbnails"), {recursive: true});
	}

	clearInterval(exports.intervalNextFoto);
	exports.stopQueue();
	
	refreshFiles();

	exports.intervalNextFoto = setInterval(exports.displayNextFoto,nconf.get("FotoBox:tOutNextSlide"))
	exports.startQueue();
}

exports.stopQueue = function(){
	queue.stop()
}
exports.startQueue = function(){
	queue.start()
}

function refreshFiles() {	
	exports.stringsFiles = []
	dbController.deactivateAllFotos()
	fs.readdir(nconf.get("Paths:localFotos"), function(err, files){
		if (err) {
			return console.error(err)
		}
		files.forEach(function(file) {
			dbController.exists(file, function(error, count) {
				if(count < 1)	{		
					exports.addNewFoto(file)
				} else {
					dbController.reactivateFoto(file)
					dbController.get(file, function(err, foto) {
						if(!foto.readyThumb) {
							queue.enqueue(exports.createThumbnail, {args: [file]})
						}
					})
				}
				exports.stringsFiles.push(file)
			})
		})
	})
}

function refreshDatabase(){
	//deactivate
	var imageDataStruct = dbController.getFotos({active: true}, {"name": 1})
    imageDataStruct.each((entry, {close, pause, resume}) => {    
		var indexFiles = exports.stringsFiles.indexOf(entry.name)
		if (indexFiles < 0) {
			dbController.deactivateFoto(entry.name)
		}
	})
	//reactivate
	var imageDataStruct = dbController.getFotos({active: false}, {"name": 1})
    imageDataStruct.each((entry, {close, pause, resume}) => {    
		var indexFiles = exports.stringsFiles.indexOf(entry.name)
		if (indexFiles > -1){
			dbController.reactivateFoto(entry.name)
		}
	})
}

exports.displayFoto = function(fileName){    
	io.emit('displayFoto', path.join(nconf.get("Paths:publicFotos"),fileName));
	console.log('Displaying '+fileName);
};

exports.displayNewFoto = function(fileName){  
	exports.displayFoto(fileName);  
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

exports.addNewFoto = async function(fileName){
	//stop generating thumbnails
	exports.stopQueue();
  //add to random queue
	exports.stringsFiles.push(fileName)
	await	dbController.createEntry(fileName)
	console.log('File', fileName, 'has been added');
	queue.enqueue(exports.createThumbnail, {args: [fileName]});
}

exports.downloadNewFoto = function(imageUrl){
	let fileName = path.basename(imageUrl)
	// https vs http request
	if (imageUrl[4] === "s") {
		const request = https.get(imageUrl, function(res) {
				var stream = res.pipe(fs.createWriteStream(path.join(nconf.get("Paths:localFotos"), fileName)));
				stream.on('finish', function () {		
					exports.displayNewFoto(fileName)
					exports.addNewFoto(fileName)
				})
		}).on('error', (e) => {
			console.error(`Got error: ${e.message}`)
		})
	} else {
		const request = http.get(imageUrl, function(res) {
			var stream = res.pipe(fs.createWriteStream(path.join(nconf.get("Paths:localFotos"), fileName)));
			stream.on('finish', function () {		
				exports.displayNewFoto(fileName)
				exports.addNewFoto(fileName)
			})
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`)
	})
	}
}

exports.createThumbnail = async function(fileName){
	console.log("createThumbnail", fileName)
	let localSourceImage = path.join(nconf.get("Paths:localFotos"), fileName)
	let localThumbImage = path.join(nconf.get("Paths:localThumbnails"), fileName)
	if(!fs.existsSync(localThumbImage)) {
		//perf.start(fileName);
		await sharp(localSourceImage).resize(null, 384).toFile(localThumbImage)
		//const results = perf.stop(fileName);
		//console.log(results.time);  // in milliseconds
	}
	await dbController.markReadyThumbnail(fileName)
	await printerController.createGrayscale(fileName)
}

exports.init()
