var express = require('express');
var fotoBoxController = require('../controllers/fotoBoxController');
var router = express.Router();
var bodyParser = require('body-parser');

/* GET home page. */
/*router.get('/:folder/:file', function(req, res, next) {
	console.log('File available: ' + req.params.folder + 'and /' + req.params.file);
	fotoBoxController.downloadNewFoto(req.params.folder,req.params.file);
	res.end('File available: ' + req.params.folder + '/' + req.params.file);
});*/
router.post('/', function(req, res, next) {	
	const body = req.body;
	console.log(req)
	console.log(body)
	console.log("new image available at: " + body.imageUrl)
	fotoBoxController.downloadNewFoto(body.imageUrl);
	res.end()
});

module.exports = router;
