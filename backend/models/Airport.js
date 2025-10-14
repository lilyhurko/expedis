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
  iso_country: String, // ВИПРАВЛЕНО: Змінено на iso_country для відповідності логам (country: 'PL')
  iso_region: String,
  municipality: String, // ВИПРАВЛЕНО: municipality для city
  gps_code: String,
  iata: String, // ВИПРАВЛЕНО: Змінено з iata_code на iata (як у логах fetch)
  local_code: String,
});

module.exports = mongoose.model('Airport', airportSchema);