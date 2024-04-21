var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: String,
    address: String,
    email: String,
    phone: String,
    password: String,
    type:String,
    isActive: Boolean
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
 