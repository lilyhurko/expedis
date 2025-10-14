const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Airport = require('../models/Airport.js');

mongoose.connect('mongodb://127.0.0.1:27017/expedisDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const results = [];

fs.createReadStream('../data/pl-airports.csv')
  .pipe(csv())
  .on('data', (data) => {
    if (data.iso_country === 'PL' && data.type.includes('airport')) {
      results.push({
        id: Number(data.id),
        ident: data.ident,
        type: data.type,
        name: data.name,
        latitude_deg: Number(data.latitude_deg),
        longitude_deg: Number(data.longitude_deg),
        elevation_ft: Number(data.elevation_ft),
        continent: data.continent,
        iso_country: data.iso_country,
        iso_region: data.iso_region,
        municipality: data.municipality,
        gps_code: data.gps_code,
        iata_code: data.iata_code,
        local_code: data.local_code,
      });
    }
  })
  .on('end', async () => {
    try {
      await Airport.insertMany(results);
      console.log('Airports imported successfully');
      mongoose.disconnect();
    } catch (err) {
      console.error(err);
    }
  });
