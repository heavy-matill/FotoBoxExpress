var express = require('express');
var fotoBoxController = require('../controllers/fotoBoxController');
var router = express.Router();

/* GET home page. */
router.get('/:folder/:file', function(req, res, next) {
	console.log('File available: ' + req.params.folder + '/' + req.params.file);
	fotoBoxController.downloadNewFoto(req.params.folder,req.params.file);
	res.end('File available: ' + req.params.folder + '/' + req.params.file);
});

module.exports = {router: router};
