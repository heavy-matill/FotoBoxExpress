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
	/*fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"readyThumb": true} })
	})*/
	console.log("markReadyThumbnail ", fileName)
	await Foto.findOneAndUpdate({"name": fileName}, {"readyThumb": true})
}

exports.markReadyPrint = async function(fileName) {	
	/*var requestedPrint = false
	fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"readyPrint": true} })
		requestedPrint = docList[0].requestedPrint
	})
	return requestedPrint*/	
	console.log("markReadyPrint ", fileName)
	await Foto.findOneAndUpdate({"name": fileName, "event": nconf.get("Mongo:Collection")}, {"readyPrint": true})
}

exports.getMarkedPrint = async function(fileName) {	
	/*var requestedPrint = false
	fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"readyPrint": true} })
		requestedPrint = docList[0].requestedPrint
	})
	return requestedPrint*/	
	console.log("getMarkedPrint ", fileName)
	return await Foto.findOne({"name": fileName, "event": nconf.get("Mongo:Collection")}).requestedPrint
}

exports.createEntry = async function(fileName) {
	/*fotosdb.insert({
		name: fileName, 
		timestamp: timestamp, 
		likes: [],
		readyThumb: false,
		readyPrint: false,
		requestedPrint: false,			 
		available: true,
	});*/
	console.log("createEntry ", fileName)
	await Foto.create({"name": fileName, "event": nconf.get("Mongo:Collection")}, function (err, foto_instance) {
		if (err) return console.log(err)
	})
}

exports.deactivateFoto = async function(fileName) {
	/*fotosdb.update(
		{ "name":fileName , "event": nconf.get("Mongo:Collection")},
		{ $set: {"available": false }})
	console.log("deactivated " + fileName)*/
	await Foto.findOneAndUpdate({"name": fileName, "event": nconf.get("Mongo:Collection")}, {"available": false})
}

exports.deactivateAllFotos = async function() {
	/*fotosdb.update(
		{ },
		{ $set: {"available": false }},
		{ multi: true});
	console.log("deactivated all")*/
	await Foto.updateMany({"event": nconf.get("Mongo:Collection")}, {"available": false})
}

exports.reactivateFoto = async function(fileName){
	/*fotosdb.update(
		{ "name": fileName },
		{ $set: {"available": true }});
	console.log("reactivated " + fileName)*/
	await Foto.findOneAndUpdate({"name": fileName, "event": nconf.get("Mongo:Collection")}, {"available": true})
}

exports.getFotos = async function(filter, sort) {
	filter.event = nconf.get("Mongo:Collection")
	return await Foto.find(filter).sort(sort)
}

exports.exists = async function(fileName) {
	return await Foto.countDocuments({"name": fileName, "event": nconf.get("Mongo:Collection")})>0
}

exports.count = function(filter, callback) { // no async?
	filter.event = nconf.get("Mongo:Collection")
	return fotosdb.countDocuments(filter, callback)
}

exports.getReadyPrint = async function(fileName) {	
	/*var test = await fotosdb.findOne()
	console.log(test)
	await fotosdb.find({"name": fileName}, function(err,data) {
		
		console.log("data: " + data)	
		var readyPrint = data.readyPrint
		console.log("ready: " + readyPrint)
	})
	return readyPrint*/
	return await Foto.find({"name": fileName, "event": nconf.get("Mongo:Collection")}).readyPrint
}

exports.markRequestedPrint = async function(fileName) {	
	/*fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"requestedPrint": true} })
	})*/
	await Foto.findOneAndUpdate({"name": fileName, "event": nconf.get("Mongo:Collection")}, {"requestedPrint": true})
}