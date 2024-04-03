const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  userId: String, 
  level: String,
  font: String,
  colors: {
    wordBackground: String,
    guessBackground: String,
    textBackground: String
  },
  target: String,
  remaining: Number,
  status: String,
  guesses: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
  view: { type: String, default: '' },
  timeToComplete: Number

});

var Game = mongoose.model('games', gameSchema);
module.exports = Game;



