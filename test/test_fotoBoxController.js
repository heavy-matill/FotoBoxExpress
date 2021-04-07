var server = require('../bin/www');
var assert = require('assert');
var request = require('request');
var fotoBoxController = require('../controllers/fotoBoxController');
var settingsController = require('../controllers/settingsController');


var nconf = require('nconf');

var fs = require('fs');

describe('Setup', function(){
    let fileName = "dummy.jpg"
    let fileName2 = "dummy2.jpg"
    let fileName3 = "dummy3.jpg"
    let strUnique1 = "test_event_string1"
    let strUnique2 = "test_event_string2"    
    this.timeout(2000);
    it('initializes', async function () {
      settingsController.setStrUnique(strUnique1);
    });
    it('re-initializes', async function () {
      settingsController.setStrUnique(strUnique2);
    });
});

describe('addNewFoto', function(){
  it('should log new foto added', function() {
    request('http://localhost:8000/newfoto/test/local', function (error, response, body) {
      //console.log('error:', error); // Print the error if one occurred
      //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      //console.log('body:', body); // Print the HTML for the Google homepage.
    });
  });
});



describe('startQueue', function(){
  fotoBoxController.startQueue();
})

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});

