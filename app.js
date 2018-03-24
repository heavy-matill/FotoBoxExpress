var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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
  saveUnitialized: true
}));

// route to other js files
var index = require('./routes/index');
var users = require('./routes/users');
var fotobox = require('./routes/fotobox');
var gallery = require('./routes/gallery');
var cookies = require('./routes/cookies');
app.use('/', index);
app.use('/users', users);
app.use('/fotobox', fotobox);
app.use('/gallery', gallery);
app.use('/cookies', cookies);

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
module.exports = app;