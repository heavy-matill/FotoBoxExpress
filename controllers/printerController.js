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
lp -d 58mmThermal -o portrait -o fit-to-page imagexy.jpg
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

https://www.tecmint.com/install-imagemagick-on-debian-ubuntu/
  CLAHE is supported as of ImageMagick 7.0.8-24 with the -clahe option:
-clahe widthxheight{%}{+}number-bins{+}clip-limit{!}
magick mountains.jpg -clahe 25x25%+128+3 mountains-clahe.jpg

optimal for group portraits
-normalize -colorspace Gray -clahe 12.5x12.5%+128+4
*/

//var magick = require('magick-cli')
// TODO: check if magick native or client are faster, especially reagrding downloading the image and processing it right away...

var fs = require('fs')
var path = require('path')
var util = require('util')
const exec = util.promisify(require('child_process').exec);
var nconf = require('nconf')
var dbController = require('./dbController')
var settingsController = require('./settingsController')
var process = require('process')
var osString = process.platform

exports.createGrayscale = async function (fileName) {
    // check if thumbnail exists
    let thumbnailPath = settingsController.pathLocalFotos;
    let thumbnailImage = path.join(thumbnailPath, fileName)
    if (!fs.existsSync(thumbnailImage)) {
        //fotoBoxController.enqueuePrintJob(fileName)
        throw "Thumbnail for " + fileName + " does not exist! Enqueuing the print job."
    }

    // check if greyscale folder exists
    let grayscalePath = path.join(thumbnailPath, "grayscales")
    if (!fs.existsSync(grayscalePath)) {
        // create path if necessary
        fs.mkdirSync(grayscalePath)
    }

    // generate geryscale thumbnail with contrast settings
    let grayscaleImage = path.join(grayscalePath, fileName)
    /*
    var thumbnailImage = 'public/thumbnails/2019-03-29_RudiRockt/2020-02-10_20-43-41.jpg'
    var grayscaleImage = 'public/thumbnails/2019-03-29_RudiRockt/grayscales/2020-02-10_20-43-41.jpg'
    */
    let grayscaleOptions = '-normalize -colorspace Gray -clahe 12.5x12.5%+128+4'//nconf.get("Printer:grayscaleOptions")
    let labelOptions = '-pointsize 30 -rotate 90 -background White label:"' + fileName.split('.')[0] + '" -gravity east -append -background White label:"' + nconf.get("Event:Name") + '" -gravity Center +swap -append -rotate 270'
    let cmd = ['magick', thumbnailImage, grayscaleOptions, labelOptions, grayscaleImage].join(' ');
    if(!osString.startsWith("win")) {
        cmd = ['sudo', cmd].join(' ');
    }
    var { stdout, stderr } = await exec(cmd);
    if (stderr) {
        console.log(stderr)
        // break on error
        return
    }
    // print if printing was marked   
    await dbController.markReadyPrint(fileName)
    dbController.get(fileName, function (err, foto) {
        if (foto.requestedPrint) {
            exports.printGrayscale(fileName)
            console.log("requested Print is true")
        }
    })
}

exports.printGrayscale = async function (fileName) {
    let thumbnailPath = nconf.get("Paths:localThumbnails")
    let grayscalePath = path.join(thumbnailPath, "grayscales")
    let grayscaleImage = path.join(grayscalePath, fileName)
    if (fs.existsSync(grayscaleImage)) {
        console.log("printGrayscale", fileName)
        printImage(grayscaleImage)
    } else {
        console.log("Attempted to print " + fileName + " but grayscale was not found.")
    }
}

printImage = async function (filePath, comment = "") {
    console.log("printing ", filePath)
    await exec('lp -d 58mmThermal -o portrait -o fit-to-page ' + filePath)
    if (comment != "") {
        await exec('echo "' + comment + '" | lp -d 58mmThermal')
    }
}

exports.printThumbnail = async function (fileName) {
    dbController.get(fileName, function (err, foto) {
        if (foto.readyPrint) {
            exports.printGrayscale(fileName)
        } else {
            dbController.markRequestedPrint(fileName)
        }
    })
}

exports.deleteAllGrayscales = function () {
    // delete all grayscale images after settings were changed (ask for option)
}
