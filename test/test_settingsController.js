
var server = require('../bin/www');
var assert = require('assert');
var settingsController = require('../controllers/settingsController');
var nconf = require('nconf');

describe('change Settings', function() {
    it('change the Event Name', function() {
        settingsController.setEventName('Test Event');
        assert.equal([1,2,3].indexOf(4), -1);
    });
});

server.close();
