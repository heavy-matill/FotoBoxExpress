var Foto = require('../models/foto')
var mongoose = require('mongoose')
var conn = mongoose.connection
//var collection = "fotos";
var strEvent = "new_event"

exports.init = async function (strDB) {
	var mongoURL = "mongodb://localhost:27017/" + strDB; // mydatabase is the name of db 

	conn.on('error', console.error.bind(console, 'MongoDB connection error:'))
	conn.once('open', function callback() {
		console.log('Connected to MongoDB');
		Foto.createCollection()
		Foto.ensureIndexes()
	})
	await mongoose.connect(mongoURL, {
		useNewUrlParser: true
	})
}

exports.disconnect = async function () {
	await mongoose.disconnect();
}
exports.close = async function () {
	await conn.close();
}

exports.readyState = function () {
	return conn.readyState;
}

exports.markReadyThumbnail = async function (fileName) {
	console.log("markReadyThumbnail ", fileName)
	await Foto.findOneAndUpdate({
		"name": fileName
	}, {
		"readyThumb": true
	})
}

exports.markReadyPrint = async function (fileName) {
	console.log("markReadyPrint ", fileName)
	await Foto.findOneAndUpdate({
		"name": fileName,
		"event": strEvent
	}, {
		"readyPrint": true
	})
}

exports.createEntry = async function (fileName) {
	console.log("createEntry ", fileName)
	await Foto.create({
		"name": fileName,
		"event": strEvent
	}, function (err, foto_instance) {
		if (err) return console.log(err)
	})
}

exports.removeEntry = async function (fileName) {
	console.log("removeEntry ", fileName)
	await Foto.findOneAndRemove({
		"name": fileName
	}, function (err, foto_instance) {
		if (err) return console.log(err)
	})
}
exports.deleteMany = async function (query) {
	console.log("deleteMany ", query)
	await Foto.deleteMany(query
		, function (err, foto_instance) {
		if (err) return console.log(err)
	})
}

exports.deactivateFoto = async function (fileName) {
	await Foto.findOneAndUpdate({
		"name": fileName,
		"event": strEvent
	}, {
		"available": false
	})
}

exports.deactivateAllFotos = async function () {
	await Foto.updateMany({
		"event": strEvent
	}, {
		"available": false
	})
}

exports.reactivateFoto = async function (fileName) {
	console.log("reactivated " + fileName)
	await Foto.findOneAndUpdate({
		"name": fileName,
		"event": strEvent
	}, {
		"available": true
	})
}

exports.getFotos = function (filter, sort, callback) {
	filter.event = strEvent
	console.log(filter)
	return Foto.find(filter, null, sort, callback)
}

exports.exists = function (fileName, callback) {
	Foto.count({
		"name": fileName,
		"event": strEvent
	}, callback)
}

exports.count = function (filter = {}, callback) {
	filter.event = strEvent
	return Foto.countDocuments(filter, callback)
}

exports.countAsync = async function (filter = {}, callback) {
	filter.event = strEvent
	return await Foto.countDocuments(filter, callback).exec()
}

exports.get = function (fileName, callback) {
	return Foto.findOne({
		"name": fileName,
		"event": strEvent
	}, callback)
}

exports.markRequestedPrint = async function (fileName) {
	await Foto.findOneAndUpdate({
		"name": fileName,
		"event": strEvent
	}, {
		"requestedPrint": true
	})
}

exports.dislike = async function (fileName, sessionId) {
	console.log("dislike", fileName, sessionId)
	await Foto.findOneAndUpdate({
		"name": fileName,
		"event": strEvent
	}, {
		$pull: {
			"likes": sessionId
		}
	})
}

exports.like = async function (fileName, sessionId) {
	console.log("like", fileName, sessionId)
	await Foto.findOneAndUpdate({
		"name": fileName,
		"event": strEvent
	}, {
		$addToSet: {
			"likes": sessionId
		}
	})
}

exports.countLikes = async function (fileName) {
	console.log("countLikes", fileName)
	let doc = await Foto.findOne({
		"name": fileName,
		"event": strEvent
	});
	return doc.likes.length
}