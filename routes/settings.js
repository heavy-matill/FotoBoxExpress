var express = require('express');
var router = express.Router();


var settingsController = require('../controllers/settingsController');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('settings', {
		"tOutStartSlideShow": settingsController.tOutStartSlideShow, 
		"tOutNextSlide": settingsController.tOutNextSlide,
		"publicImagesPath": settingsController.publicImagesPath,
		"publicThumbnailsPath": settingsController.publicThumbnailsPath,
		"strMongoPort": settingsController.strMongoPort,
		"strMongoDB": settingsController.strMongoDB,
		"strEvent": settingsController.strEvent,
		"strEventDate": settingsController.strEventDate, 
		"session": req.session.id
	});
});

module.exports = router;
