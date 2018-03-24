var express = require('express');
var router = express.Router();
var chokidar = require('chokidar');
var path_module = require('path');
var fs = require('fs');
var thumb = require('node-thumbnail').thumb;

// use socketApi.js
var socketApi = require('../socketApi');
var io = socketApi.io;

// use MongoDB
// initialize Fotos collection with db.Fotos.createIndex({name: 1, ctime: 1}, {unique:true})
var db = require('monk')("mongodb://localhost:27017/FotoBox")
var fotosdb = db.get("Fotos")

// GET home page
router.get('/', function(req, res, next) {
  res.render('fotobox', { title: 'FotoBox Display' });
});

// configuration variables
var tOutStartSlideShow = 15000;
var tOutNextSlide = 5000;
var publicImagesPath = 'fotos'
var publicThumbnailsPath = 'thumbnails'
var localImagesPath = 'public/'+publicImagesPath
var localThumbnailsPath = 'public/'+publicThumbnailsPath

// create folders
if (!fs.existsSync(localImagesPath)) {
    fs.mkdirSync(localImagesPath);
}
if (!fs.existsSync(localThumbnailsPath)) {
    fs.mkdirSync(localThumbnailsPath);
}

// initialize
var files = [];
var nextSlideTimeout = setTimeout(displayNextSlide,tOutNextSlide);

//start watching the folder with chokidar
var watcher = chokidar.watch(localImagesPath, {ignored: /^\./, persistent: true, awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100,
    depth: 0
  }});

//display function
function displayImage(file){	
	io.emit('change image', publicImagesPath+'/'+file);
	console.log('Displaying '+file);
}

//randomized slideshow
function displayNextSlide()
{
	if(files.length>0)
	{	
		//files in array, display in random order and remove from array
		randomIndex = Math.floor(Math.random() * files.length);
		displayImage(files[randomIndex]);
		files.splice(randomIndex,1);
	}
	else //collect all available files
		fs.readdirSync(localImagesPath+'/').forEach(file => {
				files.push(file);
		})
	nextSlideTimeout = setTimeout(displayNextSlide,tOutNextSlide);
}

watcher
  	.on('add', function(path){
  		clearTimeout(nextSlideTimeout);
  		nextSlideTimeout = setTimeout(displayNextSlide,tOutStartSlideShow);
		console.log('File', path, 'has been added' )
		var file = path_module.parse(path).base;  		
  		displayImage(file)
  		//add to random queue
  		files.push(file)
      //get creation timestamp
      fs.stat(path, function(err, stats){
        //var mtime = new Date(util.inspect(stats.ctime));        
        //insert to MongoDB
        fotosdb.insert({name: file, timestamp: stats.ctime})
      });

		// thumb(options, callback);
		thumb({
  			source: localImagesPath+'/'+file, // could be a filename: dest/path/image.jpg
  			destination: localThumbnailsPath,
  			concurrency: 1,
  			width: 300,
  			height: 200
		}, function(files, err, stdout, stderr) {
  		console.log('Thumbnail for '+file+' generated!');
		});
  	});
watcher
  	.on('all', (event, path) => {
  		//log all events
  		//console.log(event, path);
  	});

module.exports = router;
