var express = require('express');
var router = express.Router();
const { spawn } = require('child_process');

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log("Restarting process.");
    spawn(process.argv[1], process.argv.slice(2)).unref()
    process.exit()
    res.send('restart');
});
module.exports = router;