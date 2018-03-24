var express = require('express');
var router = express.Router();
var app = require('../app');
var fs = require('fs');
// use socketApi.js
var socketApi = require('../socketApi');
var io = socketApi.io;
var fotoBoxController = require('../controllers/fotoBoxController');

// GET home page
router.get('/', function(req, res, next) {
  res.render('fotobox', { title: 'FotoBox Display' });
});

/*//display function
function displayFoto(file, publicImagesPath){	
	io.emit('change image', publicImagesPath+'/'+file);
	console.log('Displaying '+file);
}

//randomized slideshow
function displayNextFoto(files,publicImagesPath)
{
	if(files.length>0)
	{	
		//files in array, display in random order and remove from array
		randomIndex = Math.floor(Math.random() * files.length);
		displayFoto(files[randomIndex]);
		files.splice(randomIndex,1);
	}
}


module.exports = {
  router: router,
  displayNextFoto: function(files,publicImagesPath){
    displayNextFoto(files,publicImagesPath);
  },
  displayFoto: function(file, publicImagesPath){
    displayFoto(file, publicImagesPath)
  }
};*/
module.exports = {router: router};
