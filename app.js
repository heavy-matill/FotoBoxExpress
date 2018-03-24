var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var thumb = require('node-thumbnail').thumb;

var chokidar = require('chokidar');
var path_module = require('path');

var app = express();
// Further commands done in "www"
//var server = require('http').Server(express);
//var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



//cookieSession
app.use(session({
  secret: ['my keys']  ,
  store: new MongoStore({url: 'mongodb://localhost:27017/sessions'}),
  resave: true,
  saveUninitialized: true
}));


// route to other js files
var index = require('./routes/index');
var users = require('./routes/users');
var fotobox = require('./routes/fotobox');
var gallery = require('./routes/gallery');
var cookies = require('./routes/cookies');
var newfoto = require('./routes/newfoto');
app.use('/', index.router);
app.use('/users', users.router);
app.use('/fotobox', fotobox.router);
app.use('/gallery', gallery.router);
app.use('/cookies', cookies.router);
app.use('/newfoto', newfoto.router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// New Foto

// App
// use MongoDB
// initialize Fotos collection with db.Fotos.createIndex({name: 1, ctime: 1}, {unique:true})

var fotoBoxController = require('./controllers/fotoBoxController');
fotoBoxController.init();
//start watching the folder with chokidar
/*var watcher = chokidar.watch(localImagesPath, {ignored: /^\./, persistent: true, awaitWriteFinish: {
    stabilityThreshold: 300,
    pollInterval: 100,
    depth: 0
  }});

watcher
  	.on('add', function(path){
  		clearTimeout(nextSlideTimeout);
  		nextSlideTimeout = setTimeout(displayNextSlide(files,localImagesPath,tOutNextSlide),tOutStartSlideShow);
		console.log('File', path, 'has been added' )
		var file = path_module.parse(path).base;  		
  		displayImage(file, publicImagesPath)
  		//add to random queue
  		files.push(file)
      //get creation timestamp
      fs.stat(path, function(err, stats){
        //var mtime = new Date(util.inspect(stats.ctime));        
        //insert to MongoDB
        fotosdb.insert({name: file, timestamp: stats.ctime})
      });

		// thumb(options, callback);
		thumb({
  			source: localImagesPath+'/'+file, // could be a filename: dest/path/image.jpg
  			destination: localThumbnailsPath,
  			concurrency: 4,
  			width: 300,
  			height: 200
		}, function(files, err, stdout, stderr) {
  		console.log('Thumbnail for '+file+' generated!');
		});
  	});*/


module.exports = app;