var assert = require('assert');
var dbController = require('../controllers/dbController');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe('Test MongoDB', function () {
    let fileName = "dummy.jpg"
    this.timeout(2000);
    it('starts dissconnected', async function () {
        assert(dbController.readyState() == 0);
    });
    it('connects to localhost MongoDB', async function () {
        await dbController.init("FotoBox_test");
        assert(dbController.readyState() == 1);
    });
    it('is emtpy after clearance', async function () {
        await dbController.deleteMany({})
        let docCount = await dbController.countAsync({});
        assert(docCount == 0)
    });
    it('adds an element', async function () {
        await dbController.createEntry(fileName);
        let docCount = await dbController.countAsync({});
        console.log(docCount)
        assert(docCount == 1)
    });    
    it('marks thumbnailing', async function () {
        let docCount = await dbController.countAsync({"readyThumb": true});
        assert(docCount == 0)
        await dbController.markReadyThumbnail(fileName)
        docCount = await dbController.countAsync({"readyThumb": true});
        assert(docCount == 1)
    });
    it('removes an element', async function () {
        await dbController.removeEntry(fileName);
        let docCount = await dbController.countAsync({});
        console.log(docCount)
        assert(docCount == 0)
    });
    it('is emtpy after removal', async function () {
        let docCount = await dbController.countAsync({});
        assert(docCount == 0)
    });
    it('is still connected', async function () {
        assert(dbController.readyState() == 1);
    });
    it('disconnects', async function () {
        await dbController.disconnect();
        assert(dbController.readyState() == 0);
    });
});