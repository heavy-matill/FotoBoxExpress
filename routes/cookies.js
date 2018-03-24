var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/add/:user', function(req, res, next) {
	res.cookie('user', req.params.user, { maxAge: 900000, httpOnly: true })
	console.log(req.params.user)
	res.send("added " +req.params.user)
})
router.get('/', function(req, res, next) {
	res.send("testest")
})
router.get('/test', function(req, res, next) {
	  console.log('Cookies: ', req.cookies)
  console.log('Signed Cookies: ', req.signedCookies)

	res.send(req.cookies)
})
module.exports = {router: router};
