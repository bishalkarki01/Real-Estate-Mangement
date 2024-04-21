const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
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
  AgentId: String, 
  imagePaths: [String],
  fullName: String,
  userEmail: String,
  isInterested: Boolean,
  OwnID: String,         
  propertyId: mongoose.Schema.Types.ObjectId 
});

interestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id; 
  }
});

const Interest = mongoose.model('Interest', interestSchema);
module.exports = Interest;
