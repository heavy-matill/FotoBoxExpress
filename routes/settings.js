var express = require('express');
var router = express.Router();
var config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('settings', {
		"Event": config.get("Event"), 
		"FotoBox": config.get("FotoBox"), 
		"Camera": config.get("Camera"), 
		"Printer": config.get("Printer"), 
		"Mongo": config.get("Mongo"), 
		"Paths": config.get("Paths")
	});
});
module.exports = router;
