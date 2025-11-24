const User = require('../models/User');
const TopUpRequest = require('../models/TopUpRequest');

// @desc    Get user's wallet info (balance + held)
// @route   GET /api/wallet/me
// @access  Private
exports.getWalletInfo = async (req, res) => {
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
};

// @desc    Create a new top-up request
// @route   POST /api/wallet/top-up
// @access  Private
exports.requestTopUp = async (req, res) => {
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
};