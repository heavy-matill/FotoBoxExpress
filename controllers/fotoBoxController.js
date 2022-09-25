var https = require("https");
var http = require("http");
var socketApi = require('../socketApi');
var io = socketApi.io;
var fs = require('fs');
var tq = require('task-queue');
var sharp = require('sharp');
var path = require("path");
var printerController = require('./printerController')
var dbController = require('./dbController')
var settingsController = require('./settingsController')
var displayController = require('./displayController')
var serialController = require('./serialController')
var config = require('../config')
    //const perf = require('execution-time')();


var queue = tq.Queue({
    capacity: 100,
    concurrency: 1
});


exports.stringsFiles = [];
exports.intervalNextFoto;

// initialize Fotos collection with db.Fotos.createIndex({name: 1, ctime: 1}, {unique:true})
exports.init = async function() {

    // create folders
    if (!fs.existsSync(config.get("Paths:localFotos"))) {
        fs.mkdirSync(config.get("Paths:localFotos"), {
            recursive: true
        });
    }
    if (!fs.existsSync(config.get("Paths:localThumbnails"))) {
        fs.mkdirSync(config.get("Paths:localThumbnails"), {
            recursive: true
        });
    }
    await dbController.init("FotoBox", config.get("Paths:strUnique"));

    exports.stop();

    exports.refreshFiles();

    exports.continue();
    displayController.init();
}
exports.stop = function() {
    clearInterval(exports.intervalNextFoto);
    exports.stopQueue();
}
exports.continue = function() {
    exports.intervalNextFoto = setInterval(exports.displayNextFoto, settingsController.tOutNextSlide)
    exports.startQueue();
}

exports.stopQueue = function() {
    queue.stop()
}
exports.startQueue = function() {
    queue.start()
}

exports.refreshFiles = async function() {
    exports.stringsFiles = []
    await dbController.deactivateAllFotos()
    await fs.readdir(config.get("Paths:localFotos"), async function(err, files) {
        if (err) {
            return console.error(err)
        }
        files.forEach(async function(file) {
            await dbController.exists(file, async function(error, count) {
                if (count < 1) {
                    exports.addNewFoto(file)
                } else {
                    await dbController.reactivateFoto(file)
                    await dbController.get(file, function(err, foto) {
                        if (!foto.readyThumb || !fs.existsSync(path.join(config.get("Paths:localThumbnails"), file))) {
                            queue.enqueue(exports.createThumbnail, {
                                args: [file]
                            })
                        }
                    })
                }
                await exports.stringsFiles.push(file)
            })
        })
    })
}

function refreshDatabase() {
    //deactivate
    var imageDataStruct = dbController.getFotos({
        active: true
    }, {
        "name": 1
    })
    imageDataStruct.each((entry, {
            close,
            pause,
            resume
        }) => {
            var indexFiles = exports.stringsFiles.indexOf(entry.name)
            if (indexFiles < 0) {
                dbController.deactivateFoto(entry.name)
            }
        })
        //reactivate
    var imageDataStruct = dbController.getFotos({
        active: false
    }, {
        "name": 1
    })
    imageDataStruct.each((entry, {
        close,
        pause,
        resume
    }) => {
        var indexFiles = exports.stringsFiles.indexOf(entry.name)
        if (indexFiles > -1) {
            dbController.reactivateFoto(entry.name)
        }
    })
}

exports.displayFoto = function(fileName) {
    io.emit('displayFoto', path.join(path.join(config.get("Paths:publicFotos"), fileName)));
    console.log('Displaying ' + fileName);
};

exports.displayCountdown = function(timeCountdown = 3000) {
    clearTimeout(exports.intervalNextFoto);
    io.emit('displayCountdown', timeCountdown);
};

exports.displayWarning = function() {
    clearTimeout(exports.intervalNextFoto);
    io.emit('displayWarning');
};

exports.displayNewFoto = function(fileName) {
    exports.displayFoto(fileName);
    clearTimeout(exports.intervalNextFoto);
    exports.intervalNextFoto = setTimeout(exports.displaySlideShow, settingsController.tOutStartSlideShow);
};

exports.displaySlideShow = function() {
    exports.startQueue();
    clearTimeout(exports.intervalNextFoto);
    exports.intervalNextFoto = setInterval(exports.displayNextFoto, settingsController.tOutNextSlide);
};

exports.displayNextFoto = function() {
    exports.startQueue();
    if (exports.stringsFiles.length > 0) {
        //files in array, display in random order and remove from array
        var randomIndex = Math.floor(Math.random() * exports.stringsFiles.length);
        exports.displayFoto(exports.stringsFiles[randomIndex]);
        exports.stringsFiles.splice(randomIndex, 1);
    } else {
        exports.refreshFiles();
    }
};

exports.addNewFoto = async function(fileName) {
    //stop generating thumbnails
    exports.stopQueue();
    //add to random queue
    exports.stringsFiles.push(fileName)
    await dbController.createEntry(fileName)
    console.log('File', fileName, 'has been added');
    queue.enqueue(exports.createThumbnail, {
        args: [fileName]
    });
    await settingsController.decreaseLeft();
}

exports.downloadNewFoto = function(imageUrl) {
    let fileName = path.basename(imageUrl)
        // https vs http request
    if (imageUrl[4] === "s") {
        const request = https.get(imageUrl, function(res) {
            var stream = res.pipe(fs.createWriteStream(path.join(config.get("Paths:localFotos"), fileName)));
            stream.on('finish', function() {
                exports.displayNewFoto(fileName)
                exports.addNewFoto(fileName)
            })
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`)
        })
    } else {
        const request = http.get(imageUrl, function(res) {
            var stream = res.pipe(fs.createWriteStream(path.join(config.get("Paths:localFotos"), fileName)));
            stream.on('finish', function() {
                exports.displayNewFoto(fileName)
                exports.addNewFoto(fileName)
            })
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`)
        })
    }
}

exports.createThumbnail = async function(fileName) {
    console.log("createThumbnail", fileName)
    let localSourceImage = path.join(config.get("Paths:localFotos"), fileName)
    let localThumbImage = path.join(config.get("Paths:localThumbnails"), fileName)
    if (!fs.existsSync(localThumbImage)) {
        await sharp(localSourceImage)
            .resize(null, 384)
            .toFile(localThumbImage)
    }
    await dbController.markReadyThumbnail(fileName)
    await printerController.createGrayscale(fileName)
}

exports.init()