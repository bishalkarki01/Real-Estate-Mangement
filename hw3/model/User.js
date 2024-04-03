var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   email: String,
   password: String,
   metaDefault: {
     font: String,
     level:{
      name: String,
  minLength: Number,
  maxLength: Number,
  rounds: Number
     },
     colors: {
       wordBackground: String,
       guessBackground: String,
       textBackground: String,
     },
   },
 });
 
userSchema.set('toJSON', {
   transform : function( doc, result, options ) {
      result.id = result._id;
      delete result._id; // mongo internals
      delete result.__v; // mongo internals
   }
} );


var User = mongoose.model('users', userSchema );
module.exports = User;

