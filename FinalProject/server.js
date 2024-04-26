var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var path = require('path');
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var app = express();


app.use(session({
    secret: 'A SECRET KEY. SHOULD BE UNIQUE TO THE APP. DONT EVER SHOW IT TO ANYONE',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: 'auto', httpOnly: true }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/propertyimages', express.static(path.join(__dirname, 'propertyimages')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/FinalProject', {});

// Import routes
const apiRoutes = require('./Routes/routes');
const propertyRoutes = require('./Routes/propertyroutes');
app.use('/', propertyRoutes);
app.use('/', apiRoutes);

// Error handling middleware
// 404 Not Found Handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handler for development
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({ msg: err.message });
    });
}

// Error handler for production
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({ msg: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
