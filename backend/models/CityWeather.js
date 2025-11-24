const mongoose = require('mongoose');

const monthlyWeatherSchema = new mongoose.Schema({
  month: { type: Number, required: true }, 
  avg_temp: { type: Number },
  precipitation: { type: Number },
}, { _id: false });

const cityWeatherSchema = new mongoose.Schema({
  searchKey: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  city: { type: String, required: true },
  country: { type: String, required: true },
  monthlyWeather: [monthlyWeatherSchema], 
  lastFetched: { type: Date, default: Date.now } 
});

module.exports = mongoose.model("CityWeather", cityWeatherSchema);