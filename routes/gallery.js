var express = require('express')
var router = express.Router()
var path_module = require('path')
var fs = require('fs')
var nconf = require('nconf');
var dbController = require('../controllers/dbController');
var url = require('url');
//setup cookies parsing
/* set path variables */
var publicImagesPath = nconf.get("Paths:publicFotos")
var publicThumbnailsPath = nconf.get("Paths:publicThumbnails")
var localImagesPath = nconf.get("Paths:localFotos")
var localThumbnailsPath = nconf.get("Paths:localThumbnails")
var numberImagesShow = 16
var strUnique = nconf.get("Paths:strUnique")

/* GET users listing. */
router.get('/', function(req, res, next) {
	console.log(strUnique)
	var filter = parseInt(req.query.filter) || 0	
	var orderBy = parseInt(req.query.orderBy) || 1
	var order = parseInt(req.query.order) || 0	
	var numberPage = parseInt(req.query.numberPage) || 0	

	var thisUrl = req.originalUrl
	var sessionId = req.session.id

	//check for user cookie
	if(typeof req.query.user !== "undefined") {
		var user = req.query.user
		console.log("added "+user)
		res.cookie('user', user , { maxAge: 900000, httpOnly: true })
	} else {
		if(typeof req.session.user !== "undefined") {
			var user = req.session.user 
			console.log("welcome back "+user)
		} else {
			console.log("no user")
		}
	}
	
//
//add new propertie to each element in mongodb https://glassonionblog.wordpress.com/2012/03/19/mongodb-adding-a-new-field-all-documents-in-a-collection/
	/*var files = []
	fs.readdirSync(localImagesPath+'/').forEach(file => {
				files.push(path_module.parse(file).name)  
				//files.push(file.split('/').pop().split('.')[0])
		})*/

	//get files from mongodb
	var imageList = [];
	var imageFilter = {"available": true, "readyThumb": true};
	var numberImagesMax = 0;

	dbController.getFotos(imageFilter, {"skip": numberImagesShow*numberPage, "limit" : numberImagesShow, "sort" : {"name": -1}}).stream()
	.on('data', function(entry){
	  // handle doc	
		console.log(entry)
		var nameParts = entry.name.split(".");
		imageList.push({
			file: nameParts[0], 
			extension: nameParts[1],
			timestamp:  entry.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, ''),      // replace T with a space
			likedBool: entry.likes.indexOf(sessionId) > -1,
			likeCounter: entry.likes.length
		})
	})
	.on('error', function(err){
	  // handle error
	  console.log("ERROR:", err)
	})
	.on('end', function(){
	  // final callbackconsole.log("imageList", imageList)
		dbController.count(imageFilter, function (error, count) {
			numberImagesMax = count
			var numberPagesMax = Math.ceil(numberImagesMax / numberImagesShow)
			console.log("strUnqie", strUnique)
			res.render("gallery", 
				{ 
					"FotoBox": nconf.get("FotoBox"), 
					"Printer": nconf.get("Printer"), 
					"Event": nconf.get("Event"), 
					"number": numberPage, 
					"imageList": imageList, 
					"thisUrl": thisUrl, 
					"user": user, 
					"sessionId": sessionId, 
					"numberPagesMax": numberPagesMax, 
					"strUnique": strUnique});
		})
	})
	
	//first filter

	//orderby

	//reverse order
	/*if(!order)
	{
		files=files.reverse();
	}*/
	//select from starting idx


});
/*router.get('/:start_index', function(req, res, next) {	
	var indexStart
	try{
		indexStart = parseInt(req.params.start_index)
	}
	catch(err)
	{
		console.log(err)
		indexStart = 0
	}
	var files = []
	fs.readdirSync(localImagesPath+'/').forEach(file => {
				files.push(path_module.parse(file).name)  
				//files.push(file.split('/').pop().split('.')[0])
		})
	var numberFullPages = (files.length-(files.length%indexMax))/indexMax
	var selectedFiles = []
	if(!numberFullPages){
		selectedFiles = files.reverse();
	}
	else{
		if (indexStart<numberFullPages){
			var iStart = files.length-req.params.start_index*indexMax-1
			console.log("b")
		}
		else{
			console.log("a")
			var iStart = indexMax-1
		}
		for(var i = iStart; i > iStart-indexMax; i--)
			selectedFiles.push(files[i])
	}
	res.render('gallery', { title: 'Gallery', number: req.params.start_index, files: selectedFiles});
});*/


module.exports = router;
