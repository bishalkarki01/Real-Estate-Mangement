var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(session(
   { 
      secret:'A SECRET KEY. SHOULD BE UNIQE TO THE APP. DONT EVER SHOW IT TO ANYONE',
      resave : true,
      saveUninitialized: true,
      cookie: { secure: 'auto', httpOnly: true }
   }
));
const cors = require('cors');
app.use(cors({
   origin: 'http://localhost:4200',
   credentials: true
 }));

app.use(express.static(path.join(__dirname, 'public')));

const apiRoutes = require('./routes/routes');
// Middleware
app.use('/', apiRoutes);

mongoose.connect( 'mongodb://localhost:27017/HW03', {} );


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
   app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.send( { msg : err.message } );
   });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
   res.status(err.status || 500);
   res.send( { msg: err.message } );
  } );

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  

module.exports = app;
