function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  
  describe('print Pictures', function () {
    var assert = require('assert');
    let config = require('../config');
    var fs = require('fs');
    var util = require('util')
    const exec = util.promisify(require('child_process').exec);
    let printerController = require('../controllers/printerController');

    this.timeout(10100);
    let printerName = config.get("Printer:Name");
    it('is availabe', async function () {
        let printersAvailable = await exec("lpstat -p | awk '{print $2}'")
        console.log("Available printers: "+ printersAvailable.stdout);
        assert(printersAvailable.stdout.match('^'+printerName+'\n', 'm'));
    });
    it('prints comment', async function () {
        let printerCommentResponse = await printerController.printComment("test");
        console.log("Printer comment response: "+ printerCommentResponse.stdout);
        assert(!printerCommentResponse.stdout.match("^lp: "));
    });
    it('has job in queue', async function () {
        let printerJobsAvailable = await exec("lpstat");
        console.log("Available jobs: "+ printerJobsAvailable.stdout);
        assert(printerJobsAvailable.stdout.match('^'+printerName+'.*', 'm'));
    });
    it('clears queue', async function () {        
        await sleep(10000);
        let printerJobsAvailable = await exec("lpstat");
        console.log("Available jobs: "+ printerJobsAvailable.stdout);
        assert(!printerJobsAvailable.stdout.match('^'+printerName+'.*', 'm'));
    });
});

