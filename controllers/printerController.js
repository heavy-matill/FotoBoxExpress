// check if available 
// sudo lpstat -a 58mmThermal
// asser response!= "lpstat: Invalid destination in list "58mmThermal".

// install 
/*
sudo apt-get update
sudo apt-get install libcups2-dev libcupsimage2-dev git build-essential cups //system-config-printer

git clone https://github.com/adafruit/zj-58
cd zj-58
make
sudo ./install

sudo lpadmin -p 58mmThermal -E -v serial:/dev/serial0?baud=9600 -m zjiang/ZJ-58.ppd

disable login over uart
enabe uart hardware
*/

/*
print
lp- d 58mmThermal -o portrait -o fit-to-page imagexy.jpg
echo "filename" | lp -d 58mmThermal
*/
/*
Print thumbnails
queue until thumbnail exists
*/
/*
http://www.imagemagick.org/Usage/color_mods/#normalize
    convert src.jpg -colorspace gray dest.jpg
  convert gray_range.jpg  -contrast-stretch 10%  stretch_gray.jpg
*/

//var magick = require('magick-cli')
// TODO: check if magick native or client are faster, especially reagrding downloading the image and processing it right away...

var im = require('imagemagick')
var fs = require('fs')
var nconf = require('nconf')
var path = require('path')
var shellExec = require('shell-exec')
var util = require('util')

function convertImage(thumbnailImage, grayscaleOptions, grayscaleImage, callback) {    
    im.convert([thumbnailImage, grayscaleOptions, grayscaleImage],
        function(res) {            
            callback(res)
        }
    )
}
const asyncConvert = util.promisify(convertImage);

exports.printThumbnail = async function(fileName) {
    [thumbnailImage, grayscaleImage] = await getGrayscaleImagePath(fileName)
    let grayscaleOptions = nconf.get("Printer:grayscaleOptions")
    //await asyncConvert(thumbnailImage, grayscaleOptions, grayscaleImage, console.log)
    im.convert([thumbnailImage, grayscaleOptions, grayscaleImage], 
        function(err, stdout){
            if (err) {
                throw err;
            }
            console.log('stdout:', stdout);
            let comment = ""
            //comment = fileName + '\n' + grayscaleOptions
            printImage(grayscaleImage, comment)
        })
}

printImage = function(filePath, comment="") {
    
    console.log("printing" + filePath)
    shellExec('lp -d 58mmThermal -o portrait -o fit-to-page ' + filePath)
    if(comment!="")
    {
        shellExec('echo "' + comment + '" | lp -d 58mmThermal')
    }
}

getGrayscaleImagePath = async function(fileName) {
    // check if thumbnail exists
    let thumbnailPath = nconf.get("Paths:localThumbnails")
    let thumbnailImage = path.join(thumbnailPath, fileName)
    if (!fs.existsSync(thumbnailImage)) {
        throw "Thumbnail does not exist"
    }

    // check if greyscale folder exists
    let grayscalePath = path.join(thumbnailPath, "grayscales")
    if (!fs.existsSync(grayscalePath)) {
        // create path if necessary
        await fs.mkdir(grayscalePath)
    }

    // generate geryscale thumbnail with contrast settings
    let grayscaleImage = path.join(grayscalePath, fileName)
    return [thumbnailImage, grayscaleImage]
}

exports.deleteAllGrayscales = function() {
    // delete all grayscale images after settings were changed (ask for option)
}