
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const properties = require('../Services/propertyService')
const Property = require('../Model/Property')
const Interest = require('../Model/Interested')
const ObjectId = require('mongoose').Types.ObjectId;
const NodeGeocoder = require('node-geocoder');

const fs = require('fs');

const options = {
  provider: 'google',
  httpAdapter: 'http',
  apiKey: 'AIzaSyBrTWKrpyEpFEVlyqT0Rh5QhQACPeTFmOA',
  formatter: null 
};
const geocoder = NodeGeocoder(options);
const imagesPath = path.join(__dirname, '../propertyimages');
fs.mkdirSync(imagesPath, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, imagesPath);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage: storage });
  
  //To Save properties
  router.post('/api/properties', upload.array('images'), async (req, res) => {
    const sessionData = req.session.user;
    const userId = sessionData._id;
    const fullName = sessionData.fullName;
    const userEmail = sessionData.email;
    const imagesPaths = req.files.map(file => file.path);
  
    let address;
    try {
      address = JSON.parse(req.body.address);
    } catch (error) {
      return res.status(400).send('Address formatting error: ' + error.message);
    }
  
    try {
      const formattedAddress = `${address.street}, ${address.city}, ${address.state}`;
      const geocodeResults = await geocoder.geocode(formattedAddress);
      if (geocodeResults && geocodeResults.length) {
        address.geo = {
          lat: geocodeResults[0].latitude,
          lng: geocodeResults[0].longitude
        };
      } else {
        throw new Error('Geocoding failed, no results returned');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return res.status(500).send('Geocoding error: ' + error.message);
    }
  
    console.log("Received image paths:", imagesPaths);
    let propertyData = { ...req.body, imagePaths: imagesPaths, address, fullName, userEmail, userId };
    console.log("Property data before creating model instance:", propertyData);
  
    const property = new Property(propertyData);
    property.save()
      .then(doc => {
        console.log("Saved property:", doc);
        res.send(doc);
      })
      .catch(err => {
        console.error("Error saving property:", err);
        res.status(500).send(err);
      });
  });
  
  //To get properties
  router.get('/api/properties', async (req, res) => {
    try {
      const properties = await Property.find({ isActive: true }).sort({ _id: -1 });
      res.json(properties);
    } catch (err) {
      res.status(500).send({ message: 'Error fetching properties', error: err.message });
    }
  });
  
  //to show the list of properties
  router.get('/api/propertylist', async (req, res) => {
    try {
      const properties = await Property.find({}).sort({ _id: -1 });
      res.json(properties);
    } catch (err) {
      res.status(500).send({ message: 'Error fetching properties' });
    }
  });
    
  //delete property
  router.delete('/api/properties/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const property = await Property.findByIdAndDelete(id);
  
      if (!property) {
        res.status(404).send({ message: 'Property not found' });
      } else {
        res.status(200).send({ message: 'Property deleted successfully' });
      }
    } catch (error) {
      res.status(500).send({ message: 'Failed to delete the property', error: error.message });
    }
  });
  
  //update property status 
  router.patch('/api/properties/:id/status', (req, res) => {
    Property.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true })
      .then(updatedProperty => res.json(updatedProperty))
      .catch(err => res.status(400).json('Error: ' + err));
  });
  
  //property for biyers
  router.get('/api/buyproperty', async (req, res) => {
    try {
      const sessionData = req.session.user;
      const userIdInSession = sessionData._id;
      if (!userIdInSession) {
        return res.status(401).send({ message: 'No user logged in' });
      }
      const properties = await Property.find({
        isActive: true,
        userId: { $ne: userIdInSession } 
      }).sort({ _id: -1 });
  
      res.json(properties);
    } catch (err) {
      res.status(500).send({ message: 'Error fetching properties', error: err.message });
    }
  });
  
  //property of agent self
  router.get('/api/myPropertylist', async (req, res) => {
    try {
      const sessionData = req.session.user;
      const userIdInSession = sessionData._id;
      if (!userIdInSession) {
        return res.status(401).send({ message: 'No user logged in' });
      }
      const properties = await Property.find({
        userId: userIdInSession
      }).sort({ _id: -1 });
  
      res.json(properties);
    } catch (err) {
      res.status(500).send({ message: 'Error fetching properties', error: err.message });
    }
  });
  
  //get interested properties
  router.get('/api/interestedProperties', async (req, res) => {
    try {
      if (!req.session.user || !req.session.user._id) {
        return res.status(401).send({ message: 'User not authenticated' });
      }
      const userId = req.session.user._id;
      console.log("userID", userId);

      const properties = await Interest.find({OwnID:userId});
      properties.forEach(property => console.log("Property OwnID:", property.OwnID));
  
      res.json(properties);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
      res.status(500).send({ message: 'Error fetching properties', error: err.message });
    }
  });
  //save interested properties
  router.post('/api/interestedProperties', async (req, res) => {
    const sessionData = req.session.user;
    if (!sessionData || !sessionData._id) {
      return res.status(401).send({ message: 'User not authenticated' });
    }
    const OwnID = sessionData._id;
    const propertyId = req.body.propertyId;

    try {
      // First check if an interest with the same propertyId and OwnID already exists
      const existingInterest = await Interest.findOne({ propertyId: propertyId, OwnID: OwnID });
      if (existingInterest) {
        return res.status(409).send({ message: 'Interest for this property already exists' });
      }
      // Create a new interest if it doesn't already exist
      const newInterest = new Interest({
        ...req.body,
        OwnID: OwnID
      });
      await newInterest.save();
      res.status(201).send({ message: 'Interest saved successfully!' });
    } catch (err) {
      console.error("Failed to save or find interest:", err);
      res.status(500).send({ message: 'Error processing your request', error: err.message });
    }
  });

  //delete interested property using id
  router.delete('/api/deleteInterested/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const property = await Interest.findByIdAndDelete(id);
  
      if (!property) {
        res.status(404).send({ message: 'Property not found' });
      } else {
        res.status(200).send({ message: 'Property deleted successfully' });
      }
    } catch (error) {
      res.status(500).send({ message: 'Failed to delete the property', error: error.message });
    }
  });
  
  //update property
  router.post('/api/properties/:id', upload.array('images', 5), async (req, res) => {
    const propertyId = req.params.id;
    const files = req.files;
  
    try {
      const propertyToUpdate = await Property.findById(propertyId);
      if (!propertyToUpdate) {
        return res.status(404).send({ message: 'Property not found' });
      }
  
      // Handle deletion of old images if new ones are uploaded
      if (propertyToUpdate.imagePaths && files.length > 0) {
        propertyToUpdate.imagePaths.forEach(filePath => {
          fs.unlink(path.join(imagesPath, filePath), err => {
            if (err) console.error("Failed to delete old image:", err);
            else console.log("Old image deleted successfully.");
          });
        });
      }
  
      // Construct new image paths array
      let imagePathArray = files.map(file => file.filename);
  
      // Prepare updated property data
      let updateData = {
        title: req.body.title,
        address: {
          street: req.body['address.street'],
          city: req.body['address.city'],
          state: req.body['address.state']
        },
        description: req.body.description,
        type: req.body.type,
        bedrooms: parseInt(req.body.bedrooms),
        bathrooms: parseInt(req.body.bathrooms),
        yearBuilt: parseInt(req.body.yearBuilt),
        price: parseFloat(req.body.price),
        squareFootage: parseInt(req.body.squareFootage),
        specialFeatures: req.body.specialFeatures,
        conditions: req.body.conditions,
        recentUpdates: req.body.recentUpdates,
        isActive: req.body.isActive === 'true',
        imagePaths: imagePathArray 
      };
  
      // Geocode new address if changed
      if (req.body['address.street'] || req.body['address.city'] || req.body['address.state']) {
        const formattedAddress = `${req.body['address.street']}, ${req.body['address.city']}, ${req.body['address.state']}`;
        const geocodeResults = await geocoder.geocode(formattedAddress);
        if (geocodeResults.length) {
          updateData.address.geo = {
            lat: geocodeResults[0].latitude,
            lng: geocodeResults[0].longitude
          };
        } else {
          console.error('Geocoding failed, no results found');
          return res.status(422).send({ message: 'Geocoding failed, please check the address details' });
        }
      }
  
      // Update the property in the database
      const updatedProperty = await Property.findByIdAndUpdate(propertyId, updateData, { new: true });
      res.json({ message: "Property updated successfully!", data: updatedProperty });
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).send({ message: "Error updating property.", error: error.message });
    }
  });  
  
  
  module.exports = router;  
  