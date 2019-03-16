var https = require("https");
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
var dbController = require('./dbController')


var queue = tq.Queue({capacity: 100, concurrency: 1});


exports.stringsFiles = [];
exports.intervalNextFoto;

// initialize Fotos collection with db.Fotos.createIndex({name: 1, ctime: 1}, {unique:true})
exports.init = function(){	
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
	queue.stop()
}
exports.startQueue = function(){
	queue.start()
}

function refreshFiles(){	
	exports.stringsFiles = []
	dbController.deactivateAllFotos()
	fs.readdir(nconf.get("Paths:localFotos"), function(err, files){
		if (err){
			return console.error(err)
		}
		files.forEach( function (file){
			if(dbController.exists(file)){				
				this.addNewFoto(file)
			}
			else{		
				dbController.reactivateFoto(file)
			}
			exports.stringsFiles.push(file)
		})
	})
}

function refreshDatabase(){
	//deactivate
	var imageDataStruct = dbController.getFotos({active: true}, {"name": 1})
    imageDataStruct.each((entry, {close, pause, resume}) => {    
		var indexFiles = exports.stringsFiles.indexOf(entry.name);
		if (indexFiles < 0){
			dbController.deactivateFoto(entry.name);
		}
	})
	//reactivate
	var imageDataStruct = dbController.getFotos({active: false}, {"name": 1});
    imageDataStruct.each((entry, {close, pause, resume}) => {    
		var indexFiles = exports.stringsFiles.indexOf(entry.name);
		if (indexFiles > -1){
			dbController.reactivateFoto(entry.name);
		}
	})
}

exports.displayFoto = function(fileName){    
	io.emit('displayFoto', nconf.get("Paths:publicFotos")+'/'+fileName);
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

exports.addNewFoto = function(fileName){
	//stop generating thumbnails
	exports.stopQueue();
  	//add to random queue
  	exports.stringsFiles.push(fileName)
    //get creation timestamp ... to be exported to model
	fs.stat(nconf.get("Paths:localFotos") + '/' + fileName, function(err, stats){      
		//insert to MongoDB
		dbController.createEntry(fileName, stats.ctime)
	});
	console.log('File', fileName, 'has been added');
	queue.enqueue(exports.createThumbnail, {args: [fileName]});
};

exports.downloadNewFoto = function(imageUrl){
	let fileName = path.basename(imageUrl)	
	const request = https.get(imageUrl, function(res) {
  		var stream = res.pipe(fs.createWriteStream(nconf.get("Paths:localFotos") + '/' + fileName));
  		stream.on('finish', function () {		
				exports.displayNewFoto(fileName)
				exports.addNewFoto(fileName)
  		})
	}).on('error', (e) => {
		console.error(`Got error: ${e.message}`)
	})
}

exports.createThumbnail = function(fileName){
	let localSourceImage = nconf.get("Paths:localFotos")+'/'+fileName
	let localThumbImage = nconf.get("Paths:localThumbnails")+'/'+fileName
	if(!fs.existsSync(localThumbImage)) {
		sharp(localSourceImage).resize(300).toFile(localThumbImage).then(function() {
				dbController.markReadyThumbnail(fileName)
				printerController.createGrayscale(fileName)
		})
	}
}

exports.init()