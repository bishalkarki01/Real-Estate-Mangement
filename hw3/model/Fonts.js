var mongoose = require('mongoose');
var fontSchema = new mongoose.Schema({
  fonts: [String]
});
var Font = mongoose.model('fonts', fontSchema);
module.exports = Font;



