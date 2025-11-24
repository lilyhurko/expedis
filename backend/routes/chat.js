const express = require('express');
const router = express.Router();
const ChatFeedback = require('../models/ChatFeedback');

router.post('/feedback', async (req, res) => {
  try {
    const { vote, botMessage } = req.body;
    
    const feedback = new ChatFeedback({ 
      vote, 
      botMessage 
    });
    
    await feedback.save();
    res.status(201).json({ message: 'Feedback received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const upvotes = await ChatFeedback.countDocuments({ vote: 'up' });
    const downvotes = await ChatFeedback.countDocuments({ vote: 'down' });
    
    const badFeedback = await ChatFeedback.find({ vote: 'down' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('botMessage createdAt');

    res.json({
      summary: { up: upvotes, down: downvotes },
      total: upvotes + downvotes,
      recentIssues: badFeedback
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
