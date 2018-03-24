var express = require('express');
var router = express.Router();
var fs = require('fs');
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


//display function
function displayImage(file, publicImagesPath){	
	io.emit('change image', publicImagesPath+'/'+file);
	console.log('Displaying '+file);
}

//randomized slideshow
function displayNextSlide(files,localImagesPath)
{
	if(files.length>0)
	{	
		//files in array, display in random order and remove from array
		randomIndex = Math.floor(Math.random() * files.length);
		displayImage(files[randomIndex]);
		files.splice(randomIndex,1);
	}
}


module.exports = {
  router: router,
  displayNextSlide: function(files,localImagesPath){
    displayNextSlide(files,localImagesPath);
  },
  displayImage: function(file, publicImagesPath){
    displayImage(file, publicImagesPath)
  }
};
