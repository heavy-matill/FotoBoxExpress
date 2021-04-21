var express = require('express')
var router = express.Router()
var path_module = require('path')
var fs = require('fs')
var config = require('../config');
var dbController = require('../controllers/dbController');
var url = require('url');
//setup cookies parsing
/* set path variables */
var publicImagesPath = config.get("Paths:publicFotos")
var publicThumbnailsPath = config.get("Paths:publicThumbnails")
var localImagesPath = config.get("Paths:localFotos")
var localThumbnailsPath = config.get("Paths:localThumbnails")
var numberImagesShow = 16
var strUnique = config.get("Paths:strUnique")

/* GET users listing. */
router.get('/', async function(req, res, next) {
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
	
	query = dbController.getFotos(imageFilter, {"skip": numberImagesShow*numberPage, "limit" : numberImagesShow, "sort" : {"name": -1}}
	, (err, entries) => {
		for (entry of entries) {
			var nameParts = entry.name.split(".");
			imageList.push({
				file: nameParts[0], 
				extension: nameParts[1],
				//timestamp:  entry.createdAt.toISOString().replace(/T/, ' ').replace(/\..+/, ''),      // replace T with a space
				likedBool: entry.likes.indexOf(sessionId) > -1,
				likeCounter: entry.likes.length
			})
		}
		dbController.count(imageFilter, function (err, count) { 
			numberImagesMax = count;
			var numberPagesMax = Math.ceil(numberImagesMax / numberImagesShow);
			res.render("gallery", 
				{ 
					"FotoBox": config.get("FotoBox"), 
					"Printer": config.get("Printer"), 
					"Event": config.get("Event"), 
					"number": numberPage, 
					"imageList": imageList, 
					"thisUrl": thisUrl, 
					"user": user, 
					"sessionId": sessionId, 
					"numberPagesMax": numberPagesMax, 
					"strUnique": strUnique})
		})
	})
})

module.exports = router
