var express = require('express');
var router = express.Router();
var socketApi = require('../socketApi');
var io = socketApi.io;

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("restart triggerd via web")
    io.emit('restart', 'Secret');
    res.send('restart');
});
module.exports = router;