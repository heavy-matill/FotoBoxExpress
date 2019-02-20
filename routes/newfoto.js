var express = require('express');
var fotoBoxController = require('../controllers/fotoBoxController');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {	
	const body = req.body;
	let imageUrl = Object.keys(body)[0]
	fotoBoxController.downloadNewFoto(imageUrl);
	res.end()
});

module.exports = router;
