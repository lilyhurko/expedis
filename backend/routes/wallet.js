const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../models/User');
const TopUpRequest = require('../models/TopUpRequest');


router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('balance balance_held');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.post('/top-up', auth, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const topUpRequest = new TopUpRequest({
      user: req.user.id,
      amount: amount,
    });

    await topUpRequest.save();
    
    res.status(201).json({
      message: 'Top-up request submitted. Admin will process it shortly.',
      request: topUpRequest,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;