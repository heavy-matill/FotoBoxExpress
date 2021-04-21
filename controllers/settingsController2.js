const config = require('../config')
const fotoBoxController = require('./fotoBoxController')
const dbController = require('./dbController')

exports.get = function (key) {
	switch (key) {
		// Event

		// FotoBox
		case "FotoBox:tOutStartSlideShow":
			return int(config.get("FotoBox:tOutStartSlideShow"))

		case "FotoBox:tOutNextSlide":
			return int(config.get("FotoBox:tOutNextSlide"))

		case "FotoBox:tTriggerDelay":
			return int(config.get("FotoBox:tTriggerDelay"))

		// Camera

		// Printer
		case "Printer:bEnable":
			return Boolean(config.get("Printer:bEnable"))

		// Paths
		case "Paths:localFotos":
			return "public/fotos/" + strUnique(config.get("Event:Date"), config.get("Event:Name"))

		case "Paths:localThumbnails":
			return "public/thumbnails/" + strUnique(config.get("Event:Date"), config.get("Event:Name"))

		case "Paths:publicFotos":
			return "fotos/" + strUnique(config.get("Event:Date"), config.get("Event:Name"))

		case "Paths:publicThumbnails":
			return "thumbnails/" + strUnique(config.get("Event:Date"), config.get("Event:Name"))

		case "Paths:strUnique":
			return strUnique(config.get("Event:Date"), config.get("Event:Name"))

		// Mongo
		case "Mongo:Collection":
			return config.get("Event:Date") + " " + config.get("Event:Name")

		case "Mongo:URL":
			return "mongodb://" + config.get("Mongo:Server") + ":" + config.get("Mongo:Port") + "/" + config.get("Mongo:DB")

		// return all other
		default:
			return config.get(key)
	}
}

function strUnique(strEventDate, strEventName) {
	return (strEventDate + "_" + strEventName).replace(/[^a-zA-Z0-9\-]+/g, "_");
}

exports.set = function (key, value) {
	return config.set(key, value)
}

exports.saveInit = function () {
	config.save()
	fotoBoxController.init()
	dbController.init()
}