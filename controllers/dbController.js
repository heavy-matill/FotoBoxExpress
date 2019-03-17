var nconf = require('nconf')
var monk = require('monk')

var db = monk(nconf.get("Mongo:URL"))
db.create(nconf.get("Mongo:Collection"), function(err){
	console.log(err);
})
var fotosdb = db.get(nconf.get("Mongo:Collection"))

exports.init = function(){	
	db = monk(nconf.get("Mongo:URL"))
	console.log(nconf.get("Mongo:Collection"))
	// initialize MongoDB connection
	db.create(nconf.get("Mongo:Collection"), function(err){
		console.log(err)
	})
	fotosdb = db.get(nconf.get("Mongo:Collection"))
    fotosdb.createIndex({name: 1, ctime: 1}, {unique:true})
}

exports.markReadyThumbnail = function(fileName) {
	fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"readyThumb": true} })
	})
}

exports.markReadyPrint = function(fileName) {	
	var requestedPrint = false
	fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"readyPrint": true} })
		requestedPrint = docList[0].requestedPrint
	})
	return requestedPrint
}

exports.createEntry = function(fileName, timestamp) {
	fotosdb.insert({
		name: fileName, 
		timestamp: timestamp, 
		likes: [],
		readyThumb: false,
		readyPrint: false,
		requestedPrint: false,			 
		available: true,
	});
}

exports.deactivateFoto = function(fileName) {
	fotosdb.update(
		{ "name":fileName },
		{ $set: {"available": false }})
	console.log("deactivated " + fileName)
}

exports.deactivateAllFotos = function() {
	fotosdb.update(
		{ },
		{ $set: {"available": false }},
		{ multi: true});
	console.log("deactivated all")
}

exports.reactivateFoto = function(fileName){
	fotosdb.update(
		{ "name": fileName },
		{ $set: {"available": true }});
	console.log("reactivated " + fileName)
}

exports.getFotos = function(filter, sort) {
	return fotosdb.find(filter, sort)
}

exports.exists = function(fileName) {
	return fotosdb.count({"name": fileName})>0
}

exports.count = function(filter, callback) {
	return fotosdb.count(filter, callback)
}

exports.getReadyPrint = function(fileName) {	
	var readyPrint = false
	fotosdb.find({"name": fileName}, function(err, docList){
		console.log(docList)
		readyPrint = docList[0].readyPrint
		return readyPrint
	})
}

exports.markRequestedPrint = function(fileName) {	
	fotosdb.find({"name": fileName}, function(err, docList){
		fotosdb.update({"name": fileName}, { $set: {"requestedPrint": true} })
	})
}