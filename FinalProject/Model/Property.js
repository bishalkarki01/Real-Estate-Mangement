const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  propertyid:String,
  title: String,
  address: {
    street: String,
    city: String,
    state: String,
    geo: {
      lat: Number,
      lng: Number
    }
  },
  description: String,
  type: String,
  bedrooms: Number,
  bathrooms: Number,
  yearBuilt: Number,
  price: Number,
  squareFootage: Number,
  specialFeatures: String,
  conditions: String,
  recentUpdates: String,
  userId:String,
  imagePaths: [String],
  fullName: String,
  userEmail: String,
  isActive: Boolean
});

propertySchema.set('toJSON', {
  transform : function( doc, result, options ) {
     result.id = result._id;
     delete result._id; // mongo internals
     delete result.__v; // mongo internals
  }
} );

var Property = mongoose.model('property', propertySchema);
module.exports = Property;