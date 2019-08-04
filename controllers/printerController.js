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
var dbController = require('./dbController')

exports.createGrayscale = async function(fileName) {
    // check if thumbnail exists
    let thumbnailPath = nconf.get("Paths:localThumbnails")
    let thumbnailImage = path.join(thumbnailPath, fileName)
    if (!fs.existsSync(thumbnailImage)) {        
        //fotoBoxController.enqueuePrintJob(fileName)
        throw "Thumbnail for " + fileName + " does not exist! Enqueuing the print job."
    }

    // check if greyscale folder exists
    let grayscalePath = path.join(thumbnailPath, "grayscales")
    if (!fs.existsSync(grayscalePath)) {
        // create path if necessary
        await fs.mkdir(grayscalePath)
    }   

    // generate geryscale thumbnail with contrast settings
    let grayscaleImage = path.join(grayscalePath, fileName)
    
    let grayscaleOptions = nconf.get("Printer:grayscaleOptions")
    im.convert([thumbnailImage, grayscaleOptions, grayscaleImage], 
        async function(err, stdout){
            if (err) {
                throw err;
            }
            // print if printing was marked
            await dbController.markReadyPrint(fileName)
            /*if (dbController.getMarkedPrint(fileName)) {
                exports.printGrayscale(fileName)
            }*/
            dbController.get(fileName, function(err, foto) {
                if(foto.requestedPrint) {
                    exports.printGrayscale(fileName)
                    console.log("requested Print is true")
                }
            })
        })
}

exports.printGrayscale = async function(fileName) {    
    let thumbnailPath = nconf.get("Paths:localThumbnails")
    let grayscalePath = path.join(thumbnailPath, "grayscales")
    let grayscaleImage = path.join(grayscalePath, fileName)
    if (fs.existsSync(grayscaleImage)) {
        console.log("printGrayscale", fileName)
        printImage(grayscaleImage)
    } else {
        console.log("Attempted to print " + fileName + " but grayscale was not found." )
    }
}

printImage = function(filePath, comment="") {    
    console.log("printing ", filePath)
    shellExec('lp -d 58mmThermal -o portrait -o fit-to-page ' + filePath)
    if(comment!="")
    {
        shellExec('echo "' + comment + '" | lp -d 58mmThermal')
    }
}

exports.printThumbnail = async function(fileName) {
    dbController.get(fileName, function(err, foto) {
        if(foto.readyPrint) {
            exports.printGrayscale(fileName)
        } else {
            dbController.markRequestedPrint(fileName)
        }
    })
}

exports.deleteAllGrayscales = function() {
    // delete all grayscale images after settings were changed (ask for option)
}