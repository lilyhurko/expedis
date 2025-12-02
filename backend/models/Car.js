const mongoose = require('mongoose');
const { Schema } = mongoose;

const carSchema = new Schema({
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    city: { type: String, required: true, index: true },
    country: { type: String, required: true },
    pricePerDay: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    options: [{ type: String }], 
    description: { type: String },

    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',          
        required: true
    },

    status: { 
        type: String, 
        enum: ['pending', 'active', 'rejected'], 
        default: 'pending'
    },
}, { timestamps: true });

module.exports = mongoose.model("Car", carSchema);