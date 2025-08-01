const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  categories: { type: [String], default: [] },
  availableDates: { type: [Date], default: [] },
  imageUrls: { type: [String], default: [] },
  imageUrl: { type: String }, // Backward compatibility
  mainImageIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Offer', offerSchema);