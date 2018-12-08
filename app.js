var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var chokidar = require('chokidar');
var path_module = require('path');

var app = express();


var fotoBoxController = require('./controllers/fotoBoxController');
var gpioController = require('./controllers/gpioController');
var nconf = require('nconf');
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
  store: new MongoStore({url: nconf.get("Mongo:URL")}),
  resave: true,
  saveUninitialized: true
}));

function requireLogin(req, res, next){
  if (req.session.loggedIn){
    next(); //allow the next route to run
  } else {
    // require the user to login
    res.redirect("/login?ref="+req.url); //or render a form etc
  }
}

// automatically apply the require Login middleare to allroutes starting with admin
app.all("/admin/*", requireLogin, function(req,res,next){
  next(); //if middleware allowed to get us here, just move on to the next route
});

// route to other js files
var index = require('./routes/index');
var users = require('./routes/users');
var settings = require('./routes/settings');
var fotobox = require('./routes/fotobox');
var gallery = require('./routes/gallery');
var cookies = require('./routes/cookies');
var newfoto = require('./routes/newfoto');	
var login = require('./routes/login');	
app.use('/', index);
app.use('/users', users);
app.use('/admin/settings', settings);
app.use('/fotobox', fotobox);
app.use('/gallery', gallery);
app.use('/cookies', cookies);
app.use('/newfoto', newfoto);
app.use('/login', login);

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

//start FotoBox
fotoBoxController.init();

module.exports = app;