var express = require('express');
var router = express.Router();
var nconf = require('nconf');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('settings', {
		"Event": nconf.get("Event"), 
		"FotoBox": nconf.get("FotoBox"), 
		"Camera": nconf.get("Camera"), 
		"Mongo": nconf.get("Mongo"), 
		"Paths": nconf.get("Paths")
	});
});
module.exports = router;
