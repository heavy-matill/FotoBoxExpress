function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

describe('Send commands', async function () {

    let expect = require('chai').expect;
    let sinon = require('sinon');
    let serialController;

    let tiDelay = 250;
    this.timeout(tiDelay + 5000);
    it('Initializes and connects', async function () {
        const spyLog = sinon.spy(console, 'log')
        serialController = require('../controllers/serialController');
        if (serialController.readyState == 1) {
            serialController.closePort();
            serialController.init();
        }
        await sleep(tiDelay);
        expect(spyLog.calledWith('RxSer initializing')).to.be.true;
        expect(spyLog.calledWith('RxSer connected')).to.be.true;
        spyLog.restore();
    });
    it('Send test command and receive response', async function () {
        const spyLog = sinon.spy(console, 'log')
        let strTest = "zufaelliger_Teststring"
        serialController.testCommand(strTest);
        await sleep(tiDelay);
        expect(spyLog.calledWith('RxSer: ' + strTest + '\r\n')).to.be.true;
        spyLog.restore();
    });

    it('Send countdown command and receive response', async function () {
        const spyLog = sinon.spy(console, 'log')
        tiAnim = 12345;
        serialController.countdownCommand(tiAnim);
        await sleep(tiDelay);
        expect(spyLog.calledWith('RxSer: ' + 'counting ' + tiAnim + '\r\n')).to.be.true;
        spyLog.restore();
    });

    it('Send standby command and receive response', async function () {
        const spyLog = sinon.spy(console, 'log')
        serialController.standbyCommand();
        await sleep(tiDelay);
        expect(spyLog.calledWith('RxSer: ' + 'standby' + '\r\n')).to.be.true;
        spyLog.restore();
    });

    it('Send off command and receive response', async function () {
        const spyLog = sinon.spy(console, 'log')
        serialController.offCommand();
        await sleep(tiDelay);
        expect(spyLog.calledWith('RxSer: ' + 'off' + '\r\n')).to.be.true;
        spyLog.restore();
    });

    it('Triggers camera', async function () {
        const spyLog = sinon.spy(console, 'log')
        let strTrigger = "Triggered camera"
        serialController.testCommand("trigger");
        await sleep(tiDelay);
        expect(spyLog.calledWith(strTrigger)).to.be.true;
        spyLog.restore();
    });

    it('Closes the port', async function () {
        const spyLog = sinon.spy(console, 'log')
        serialController.closePort();
        await sleep(100);
        expect(spyLog.calledWith('RxSer closed')).to.be.true;
        spyLog.restore();
    });
});