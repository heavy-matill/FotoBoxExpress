var fs = require('fs');
var gphoto2 = require('gphoto2');
var GPhoto = new gphoto2.GPhoto2();

// Negative value or undefined will disable logging, levels 0-4 enable it.
GPhoto.setLogLevel(1);
GPhoto.on('log', function (level, domain, message) {
  console.log(domain, message);
});

// Take picture with camera object obtained from list()
async function takePicture() {
    await camera.takePicture({download: true}, function (er, data) {
        fs.writeFileSync(__dirname + '/picture.jpg', data);
      });
};

takePicture();