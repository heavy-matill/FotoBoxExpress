describe('changes configuration', function () {
    let assert = require('assert');
    let config = require('../config');

    it('changes serial path', async function () {
        let PathTemp = config.get("Serial:Path")
        let Path1 = "COM12"
        let Path2 = "/dev/ttyUSB13"
        config.set("Serial:Path", Path1);
        assert(config.get("Serial:Path") == Path1);
        config.set("Serial:Path", Path2);
        assert(config.get("Serial:Path") == Path2);
        config.set("Serial:Path", PathTemp);
        assert(config.get("Serial:Path") == PathTemp);
    });
});

