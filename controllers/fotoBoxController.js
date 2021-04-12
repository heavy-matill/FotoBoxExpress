var https = require("https");
var http = require("http");
var socketApi = require('../socketApi');
var io = socketApi.io;
var fs = require('fs');
var tq = require('task-queue');
var sharp = require('sharp');
var path = require("path");
var printerController = require('./printerController')
var dbController = require('./dbController')
var settingsController = require('./settingsController')
//const perf = require('execution-time')();


var queue = tq.Queue({capacity: 100, concurrency: 1});


exports.stringsFiles = [];
exports.intervalNextFoto;

// initialize Fotos collection with db.Fotos.createIndex({name: 1, ctime: 1}, {unique:true})
exports.init = async function(){	
	// create folders
	if (!fs.existsSync(settingsController.pathLocalFotos)) {
		fs.mkdirSync(settingsController.pathLocalFotos, {recursive: true});
	}
	if (!fs.existsSync(settingsController.pathLocalThumbnails)) {
		fs.mkdirSync(settingsController.pathLocalThumbnails, {recursive: true});
	}	
	await dbController.init("FotoBox",settingsController.strUnique);

	clearInterval(exports.intervalNextFoto);
	exports.stopQueue();
	
	refreshFiles();

	exports.intervalNextFoto = setInterval(exports.displayNextFoto,settingsController.tOutNextSlide)
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
	fs.readdir(settingsController.pathLocalFotos, function(err, files){
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
	io.emit('displayFoto', path.join(settingsController.pathPublicFotos,fileName));
	console.log('Displaying '+fileName);
};

exports.displayNewFoto = function(fileName){  
	exports.displayFoto(fileName);  
	clearTimeout(exports.intervalNextFoto);
	exports.intervalNextFoto = setTimeout(exports.displaySlideShow, settingsController.tOutStartSlideShow);	
};

exports.displaySlideShow = function(){	
	exports.startQueue();
	clearTimeout(exports.intervalNextFoto);
	exports.intervalNextFoto = setInterval(exports.displayNextFoto,settingsController.tOutNextSlide);	
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
				var stream = res.pipe(fs.createWriteStream(path.join(settingsController.pathLocalFotos, fileName)));
				stream.on('finish', function () {		
					exports.displayNewFoto(fileName)
					exports.addNewFoto(fileName)
				})
		}).on('error', (e) => {
			console.error(`Got error: ${e.message}`)
		})
	} else {
		const request = http.get(imageUrl, function(res) {
			var stream = res.pipe(fs.createWriteStream(path.join(settingsController.pathLocalFotos, fileName)));
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
	let localSourceImage = path.join(settingsController.pathLocalFotos, fileName)
	let localThumbImage = path.join(settingsController.pathLocalThumbnails, fileName)
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
