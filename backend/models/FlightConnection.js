const mongoose = require("mongoose");

const flightConnectionSchema = new mongoose.Schema({
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer", required: true },
  departureAirportIATA: { type: String, required: true }, 
  arrivalAirportIATA: { type: String, required: true },  
  departureTime: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FlightConnection", flightConnectionSchema);