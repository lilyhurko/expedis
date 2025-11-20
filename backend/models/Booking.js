const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // Хто купує
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true }, // Що купує
  
  agency: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  amount: { type: Number, required: true },
  selectedDate: { type: Date, required: true },
  
  travelers: { type: mongoose.Schema.Types.Mixed, required: true }, 

  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'cancelled',
      'completed'
    ],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);