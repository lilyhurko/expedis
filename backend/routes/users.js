const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log(token)
    return res.status(403).json({ message: 'Invalid token' });
  }
};


router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/me', authenticate, async (req, res) => {
  const { name, surname, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, surname, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

router.delete('/me', authenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;
