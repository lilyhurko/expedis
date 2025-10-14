const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const Comment = require('../models/Comment');
const authAdminMiddleware = require('../middleware/authAdminMiddleware');

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

module.exports = router;
