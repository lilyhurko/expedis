const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, required: true },
    pricePerDay: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    options: [{ type: String }], 
    description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Car", carSchema);