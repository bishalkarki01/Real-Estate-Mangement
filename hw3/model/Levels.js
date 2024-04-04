
const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  name: String,
  minLength: Number,
  maxLength: Number,
  rounds: Number
});

const Level = mongoose.model('levels', levelSchema);

module.exports = Level;