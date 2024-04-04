const mongoose = require('mongoose');

const ColorScheme = new mongoose.Schema({
    wordBackground: String,
    textBackground: String,
    guessBackground: String
});

const Colors = mongoose.model('colors', ColorScheme);

module.exports = Colors;