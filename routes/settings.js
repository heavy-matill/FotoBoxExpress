var express = require('express');
var router = express.Router();


var nconf = require('nconf');
nconf.argv()
   .env()
   .file({ file: 'settings.json' });

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('settings', {
		"Event": nconf.get("Event"), 
		"FotoBox": nconf.get("FotoBox"), 
		"Mongo": nconf.get("Mongo"), 
		"Paths": nconf.get("Paths")
	});
});

module.exports = router;
