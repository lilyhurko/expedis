const mongoose = require('mongoose'); 

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  departureAirportIATA: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  categories: [{ type: String }],
  availableDates: [{ type: Date }],
  imageUrls: [{ type: String }],
  imageUrl: { type: String },
  mainImageIndex: { type: Number },
  placesToVisit: [
    {
      name: { type: String, required: true },
      description: { type: String },
      imageUrl: { type: String },
    },
  ],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], 
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  flightConnections: [{ type: mongoose.Schema.Types.ObjectId, ref: "FlightConnection" }],
}, {
  strictPopulate: false,
  imestamps: true
});

module.exports = mongoose.model("Offer", offerSchema);