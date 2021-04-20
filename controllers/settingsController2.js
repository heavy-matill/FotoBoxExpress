const nconf = require('nconf')
const fotoBoxController = require('./fotoBoxController')
const dbController = require('./dbController')

exports.get = function (key) {
	switch (key) {
		// Event

		// FotoBox
		case "FotoBox:tOutStartSlideShow":
			return int(nconf.get("FotoBox:tOutStartSlideShow"))

		case "FotoBox:tOutNextSlide":
			return int(nconf.get("FotoBox:tOutNextSlide"))

		case "FotoBox:tTriggerDelay":
			return int(nconf.get("FotoBox:tTriggerDelay"))

		// Camera

		// Printer
		case "Printer:bEnable":
			return Boolean(nconf.get("Printer:bEnable"))

		// Paths
		case "Paths:localFotos":
			return "public/fotos/" + strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))

		case "Paths:localThumbnails":
			return "public/thumbnails/" + strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))

		case "Paths:publicFotos":
			return "fotos/" + strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))

		case "Paths:publicThumbnails":
			return "thumbnails/" + strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))

		case "Paths:strUnique":
			return strUnique(nconf.get("Event:Date"), nconf.get("Event:Name"))

		// Mongo
		case "Mongo:Collection":
			return nconf.get("Event:Date") + " " + nconf.get("Event:Name")

		case "Mongo:URL":
			return "mongodb://" + nconf.get("Mongo:Server") + ":" + nconf.get("Mongo:Port") + "/" + nconf.get("Mongo:DB")

		// return all other
		default:
			return nconf.get(key)
	}
}

function strUnique(strEventDate, strEventName) {
	return (strEventDate + "_" + strEventName).replace(/[^a-zA-Z0-9\-]+/g, "_");
}

exports.set = function (key, value) {
	return nconf.set(key, value)
}

exports.saveInit = function () {
	nconf.save()
	fotoBoxController.init()
	dbController.init()
}