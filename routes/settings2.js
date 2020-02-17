var express = require('express');
var router = express.Router();
var nconf = require('nconf');
var settings = require('../controllers/settingsController');

/* GET home page. */
router.get('/', function(req, res, next) {
	
	res.render('settings', {settings.get()
	});
});
module.exports = router;
