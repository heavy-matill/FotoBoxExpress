function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe('Test MongoDB', function () {
    let assert = require('assert');
    let dbController = require('../controllers/dbController');
    let { db } = require('../models/foto');

    let fileName = "dummy.jpg"
    let fileName2 = "dummy2.jpg"
    let fileName3 = "dummy3.jpg"
    this.timeout(2000);
    it('starts dissconnected', async function () {
        if (dbController.readyState() != 0) {
            await (dbController.disconnect());
        }
        assert(dbController.readyState() == 0);
    });
    it('connects to localhost MongoDB', async function () {
        await dbController.init("FotoBox_test", "test_event");
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
        assert(docCount == 1)
    });
    it('marks thumbnail ready', async function () {
        let docCount = await dbController.countAsync({ "readyThumb": true });
        assert(docCount == 0)
        await dbController.markReadyThumbnail(fileName)
        docCount = await dbController.countAsync({ "readyThumb": true });
        assert(docCount == 1)
    });
    it('marks print ready', async function () {
        let docCount = await dbController.countAsync({ "readyPrint": true });
        assert(docCount == 0)
        await dbController.markReadyPrint(fileName)
        docCount = await dbController.countAsync({ "readyPrint": true });
        assert(docCount == 1)
    });
    it('marks requested print', async function () {
        let docCount = await dbController.countAsync({ "requestedPrint": true });
        assert(docCount == 0)
        await dbController.markRequestedPrint(fileName)
        docCount = await dbController.countAsync({ "requestedPrint": true });
        assert(docCount == 1)
    });
    it('de/activates foto', async function () {
        let docCount = await dbController.countAsync({ "available": true });
        assert(docCount == 1)
        await dbController.reactivateFoto(fileName)
        docCount = await dbController.countAsync({ "available": true });
        assert(docCount == 1)
        await dbController.deactivateFoto(fileName)
        docCount = await dbController.countAsync({ "available": false });
        assert(docCount == 1)
    });
    it('adds another foto', async function () {
        await dbController.createEntry(fileName2);
        let docCount = await dbController.countAsync({});
        assert(docCount == 2)
    });
    it('reinitializes with a different event name', async function () {
        await dbController.init("FotoBox_test", "test_event_2");
        assert(dbController.readyState() == 1);
        let docCount = await dbController.countAsync({});
        assert(docCount == 0)
        await dbController.createEntry(fileName3);
        await sleep(50);
        docCount = await dbController.countAsync({});
        assert(docCount == 1)
        await dbController.deleteMany({})
        docCount = await dbController.countAsync({});
        assert(docCount == 0)
    });
    it('switches back to previous event name', async function () {
        await dbController.init("FotoBox_test", "test_event");
        assert(dbController.readyState() == 1);
        let docCount = await dbController.countAsync({});
        assert(docCount == 2)
    });
    it('activates/deactivates all fotos', async function () {
        await dbController.reactivateFoto(fileName2)
        await dbController.reactivateFoto(fileName)
        let docCount = await dbController.countAsync({ "available": true });
        assert(docCount == 2)
        await dbController.deactivateAllFotos()
        docCount = await dbController.countAsync({ "available": true });
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