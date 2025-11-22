const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail'); 

const User = require('../models/User');
const TopUpRequest = require('../models/TopUpRequest');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL; 

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
    const user = await User.findById(req.user.id);

    const topUpRequest = new TopUpRequest({
      user: req.user.id,
      amount: amount,
    });

    await topUpRequest.save();

    if (ADMIN_EMAIL) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #2196f3; border-radius: 5px;">
          <h2 style="color: #2196f3;">New Top-Up Request 💰</h2>
          <p>A user has requested to add funds to their wallet.</p>
          <ul style="list-style: none; padding: 0;">
            <li><strong>User:</strong> ${user.name} ${user.surname}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Amount:</strong> ${amount} PLN</li>
            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <hr />
          <p>Please log in to the Admin Dashboard to approve or reject this request.</p>
          <a href="http://localhost:3000/admin/dashboard" style="background-color: #2196f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Go to Admin Panel</a>
        </div>
      `;

      sendEmail(ADMIN_EMAIL, `New Top-Up Request: ${amount} PLN`, emailHtml)
        .then(() => console.log(` Admin notification sent to ${ADMIN_EMAIL}`))
        .catch(err => console.error(" Failed to send admin notification:", err.message));
    } else {
      console.warn(" ADMIN_EMAIL is not defined in .env file");
    }
    
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