const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  
  amount: { type: Number, required: true },
  selectedDate: { type: Date, required: true },
  travelers: { type: Object, required: true }, 

  status: {
    type: String,
    enum: [
      'pending_admin_confirmation', 
      'confirmed',                  
      'rejected_by_admin',          
      'cancelled_by_user'           
    ],
    default: 'pending_admin_confirmation',
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);