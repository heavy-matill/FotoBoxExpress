var assert = require('assert');
var dbController = require('../controllers/dbController');
const { db } = require('../models/foto');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe('Test MongoDB', function () {
    let fileName = "dummy.jpg"
    let fileName2 = "dummy2.jpg"
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
    it('marks thumbnail ready', async function () {
        let docCount = await dbController.countAsync({"readyThumb": true});
        assert(docCount == 0)
        await dbController.markReadyThumbnail(fileName)
        docCount = await dbController.countAsync({"readyThumb": true});
        assert(docCount == 1)
    });
    it('marks print ready', async function () {
        let docCount = await dbController.countAsync({"readyPrint": true});
        assert(docCount == 0)
        await dbController.markReadyPrint(fileName)
        docCount = await dbController.countAsync({"readyPrint": true});
        assert(docCount == 1)
    });
    it('marks requested print', async function () {
        let docCount = await dbController.countAsync({"requestedPrint": true});
        assert(docCount == 0)
        await dbController.markRequestedPrint(fileName)
        docCount = await dbController.countAsync({"requestedPrint": true});
        assert(docCount == 1)
    });
    it('de/activates foto', async function () {
        let docCount = await dbController.countAsync({"available": true});
        assert(docCount == 1)
        await dbController.reactivateFoto(fileName)
        docCount = await dbController.countAsync({"available": true});
        assert(docCount == 1)
        await dbController.deactivateFoto(fileName)
        docCount = await dbController.countAsync({"available": false});
        assert(docCount == 1)
    });
    it('deactivates all fotos', async function () {
        await dbController.createEntry(fileName2);
        await dbController.reactivateFoto(fileName2)
        await dbController.reactivateFoto(fileName)
        let docCount = await dbController.countAsync({"available": true});
        assert(docCount == 2)
        await dbController.deactivateAllFotos()
        docCount = await dbController.countAsync({"available": true});
        assert(docCount == 0)
        await dbController.removeEntry(fileName2);
    });    
    it('likes/dislikes', async function () {
        let user1 = "user1"
        let user2 = "user2"
        let likes = await dbController.countLikes(fileName)
        assert(likes == 0)
        await dbController.like(fileName, user1)
        likes = await dbController.countLikes(fileName)
        assert(likes == 1)
        await dbController.like(fileName, user1)
        likes = await dbController.countLikes(fileName)
        assert(likes == 1)
        await dbController.like(fileName, user2)
        likes = await dbController.countLikes(fileName)
        assert(likes == 2)
        await dbController.dislike(fileName, user1)
        likes = await dbController.countLikes(fileName)
        assert(likes == 1)
        await dbController.dislike(fileName, user1)
        likes = await dbController.countLikes(fileName)
        assert(likes == 1)
        await dbController.dislike(fileName, user2)
        likes = await dbController.countLikes(fileName)
        assert(likes == 0)
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