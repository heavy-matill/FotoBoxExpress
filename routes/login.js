var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.query.Passphrase=="Secret")	{
		req.session.loggedIn = true;
		res.redirect(req.query.ref);
	} else {
		res.render('login', {ref: req.query.ref});
	}
});
module.exports = router;
