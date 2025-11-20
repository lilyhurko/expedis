const express = require('express');
const router = express.Router();
const authAdminMiddleware = require('../middleware/authAdminMiddleware');
const Booking = require('../models/Booking');
const User = require('../models/User');
const TopUpRequest = require('../models/TopUpRequest');
const mongoose = require('mongoose');

const Offer = require('../models/Offer');
const Comment = require('../models/Comment');



router.post('/offers', authAdminMiddleware, async (req, res) => {
  try {
    const { title, description, price, duration, imageUrl } = req.body;
    const offer = new Offer({ title, description, price, duration, imageUrl });
    await offer.save();
    res.status(201).json({ message: 'Offer created', offer });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/comments', authAdminMiddleware, async (req, res) => {
  try {
    await Comment.deleteMany({});
    res.status(200).json({ message: 'All comments deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/top-ups/pending', authAdminMiddleware, async (req, res) => {
  try {
    const requests = await TopUpRequest.find({ status: 'pending' })
      .populate('user', 'username email name surname');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/top-ups/:id/confirm', authAdminMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const request = await TopUpRequest.findById(req.params.id).session(session);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    const user = await User.findById(request.user).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    user.balance += request.amount;
    await user.save({ session });

    request.status = 'completed';
    await request.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Top-up confirmed. User balance updated.' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});


router.get('/offers/pending', authAdminMiddleware, async (req, res) => {
   try {
        const offers = await Offer.find({ status: 'pending' })
            .populate('creator', 'name surname email') 
            .select('-description -imageUrls -placesToVisit'); 
        res.json(offers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/bookings/:id/confirm', authAdminMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.status !== 'pending_admin_confirmation') {
      return res.status(400).json({ message: 'Booking already processed' });
    }

    const user = await User.findById(booking.user).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.balance_held < booking.amount) {
      throw new Error('Held balance mismatch. Critical error.');
    }

    user.balance_held -= booking.amount;
    await user.save({ session });

    booking.status = 'confirmed';
    await booking.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Booking confirmed. Funds captured.' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});


router.post('/bookings/:id/reject', authAdminMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.status !== 'pending_admin_confirmation') {
      return res.status(400).json({ message: 'Booking already processed' });
    }

    const user = await User.findById(booking.user).session(session);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.balance_held < booking.amount) {
       throw new Error('Held balance mismatch. Critical error.');
    }

    user.balance_held -= booking.amount;
    user.balance += booking.amount;
    await user.save({ session });

    booking.status = 'rejected_by_admin';
    await booking.save({ session });

    await session.commitTransaction();
    res.json({ message: 'Booking rejected. Funds returned to user.' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;