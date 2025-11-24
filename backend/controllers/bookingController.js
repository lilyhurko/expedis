const Booking = require('../models/Booking');
const User = require('../models/User');
const Offer = require('../models/Offer');
const mongoose = require('mongoose');

// @desc    Create a new booking (Escrow logic)
// @route   POST /api/bookings/create
// @access  Private
exports.createBooking = async (req, res) => {
  const { offerId, amount, selectedDate, travelers } = req.body;
  const userId = req.user.id;

  if (!offerId || !amount || !selectedDate || !travelers) {
    return res.status(400).json({ message: 'Please provide all booking details' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.balance < amount) {
      return res.status(402).json({ message: 'Insufficient funds. Please top up your wallet.' });
    }

    const offer = await Offer.findById(offerId).session(session);
    if (!offer) {
      throw new Error('Offer not found');
    }

    user.balance -= amount;
    user.balance_held += amount;
    await user.save({ session });

    const booking = new Booking({
      user: userId,
      offer: offerId,
      amount: amount,
      selectedDate: new Date(selectedDate),
      travelers: travelers,
      status: 'pending_admin_confirmation',
    });
    await booking.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: 'Booking request sent! Awaiting admin confirmation.',
      booking: booking,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error.message);
    if (error.message.includes('Insufficient funds')) {
        return res.status(402).json({ message: 'Insufficient funds. Please top up your wallet.' });
    }
    res.status(500).json({ message: error.message || 'Server Error' });
  } finally {
    session.endSession();
  }
};

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('offer', 'title city country imageUrls') // Додаємо дані про оферту
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};