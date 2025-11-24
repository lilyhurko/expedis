const mongoose = require('mongoose');

const carBookingSchema = new mongoose.Schema({
    car: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Car', 
        required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    pickupDate: { 
        type: Date, 
        required: true, 
        index: true 
    },
    returnDate: { 
        type: Date, 
        required: true, 
        index: true
    },
    totalPrice: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled'], 
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model("CarBooking", carBookingSchema);