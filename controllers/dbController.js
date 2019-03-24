var nconf = require('nconf')
var monk = require('monk')
//https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
var db = monk(nconf.get("Mongo:URL"))
db.create(nconf.get("Mongo:Collection"), function(err){
	console.log(err);
})
var fotosdb = db.get(nconf.get("Mongo:Collection"))
var Foto = require('../models/foto')

exports.init = function(){	
	/*db = monk(nconf.get("Mongo:URL"))
	console.log(nconf.get("Mongo:Collection"))
	// initialize MongoDB connection
	db.create(nconf.get("Mongo:Collection"), function(err){
		console.log(err)
	})
	fotosdb = db.get(nconf.get("Mongo:Collection"))
    fotosdb.createIndex({name: 1, ctime: 1}, {unique:true})*/
}
/* mongoose */
var mongoose = require('mongoose')
var mongoDB = nconf.get("Mongo:URL")
mongoose.connect(mongoDB, {useNewUrlParser: true})
//Get the default connection
var db = mongoose.connection
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
Foto.createIndexes()


exports.markReadyThumbnail = async function(fileName) {
	console.log("markReadyThumbnail ", fileName)
	await Foto.findOneAndUpdate({"name": fileName}, {"readyThumb": true})
}

exports.markReadyPrint = async function(fileName) {	
	console.log("markReadyPrint ", fileName)
	await Foto.findOneAndUpdate({"name": fileName, "event": nconf.get("Mongo:Collection")}, {"readyPrint": true})
}

exports.createEntry = async function(fileName) {
	console.log("createEntry ", fileName)
	await Foto.create({"name": fileName, "event": nconf.get("Mongo:Collection")}, function (err, foto_instance) {
		if (err) return console.log(err)
	})
}

exports.deactivateFoto = async function(fileName) {
	await Foto.findOneAndUpdate({"name": fileName, "event": nconf.get("Mongo:Collection")}, {"available": false})
}

exports.deactivateAllFotos = async function() {
	await Foto.updateMany({"event": nconf.get("Mongo:Collection")}, {"available": false})
}

exports.reactivateFoto = async function(fileName){
	console.log("reactivated " + fileName)
	await Foto.findOneAndUpdate({"name": fileName, "event": nconf.get("Mongo:Collection")}, {"available": true})
}

exports.getFotos = function(filter, sort) {
	filter.event = nconf.get("Mongo:Collection")
	console.log(filter)
	return Foto.find(filter, null, sort)
}

exports.exists = function(fileName, callback) {
	Foto.countDocuments({"name": fileName, "event": nconf.get("Mongo:Collection")}, callback)
}

exports.count = function(filter, callback) {
	filter.event = nconf.get("Mongo:Collection")
	Foto.countDocuments(filter, callback)
}

exports.get = function(fileName, callback) {
	return Foto.findOne({"name": fileName, "event": nconf.get("Mongo:Collection")}, callback)
}

exports.markRequestedPrint = async function(fileName) {
	await Foto.findOneAndUpdate({"name": fileName, "event": nconf.get("Mongo:Collection")}, {"requestedPrint": true})
}