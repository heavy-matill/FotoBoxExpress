var assert = require('assert');

var fotoBoxController = require('../controllers/fotoBoxController');
var nconf = require('nconf');

var fs = require('fs');

describe('addNewFoto', function(){
	
	fotoBoxController.addNewFoto("IMGP0999.JPG");
});

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});