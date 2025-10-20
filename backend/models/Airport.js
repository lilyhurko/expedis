const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
  id: Number,
  ident: String,
  type: String,
  name: String,
  latitude_deg: Number,
  longitude_deg: Number,
  elevation_ft: Number,
  continent: String,
  iso_country: String, 
  iso_region: String,
  municipality: String, 
  gps_code: String,
  iata: String, 
  local_code: String,
});

module.exports = mongoose.model('Airport', airportSchema);