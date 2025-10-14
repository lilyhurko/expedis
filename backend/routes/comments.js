const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Offer = require('../models/Offer');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.post('/:offerId/comments', auth, async (req, res) => {
  try {
    console.log('POST request to /api/comments/:offerId/comments');
    console.log('Offer ID:', req.params.offerId);
    console.log('User from token:', req.user);
    console.log('Body received:', req.body);

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const offer = await Offer.findById(req.params.offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const newComment = new Comment({
      message: req.body.message || req.body.comment,
      userId: user._id,
      username: user.username,
      rating: req.body.rating || 0,
    });

    await newComment.save();

    offer.comments.push(newComment._id);
    await offer.save();

    console.log('Comment saved successfully:', newComment._id);

    res.status(201).json(newComment);
  } catch (err) {
    console.error('Error creating comment:', err.message);
    res.status(500).json({ message: err.message });
  }
});
router.get('/', async (req, res) => {
  try {
    console.log('GET request to /api/comments (all)');
    const comments = await Comment.find().populate('userId', 'username').sort({ createdAt: -1 }).limit(100); 
    console.log(`Found ${comments.length} total comments`);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching all comments:', err.message);
    res.status(500).json({ message: err.message });
  }
});
router.get('/:offerId', async (req, res) => {
  try {
    console.log('GET request to /api/comments/:offerId');
    console.log('Offer ID:', req.params.offerId);

    const offer = await Offer.findById(req.params.offerId).populate('comments');
    if (!offer) {
      console.warn('Offer not found for ID:', req.params.offerId);
      return res.status(404).json({ message: 'Offer not found' });
    }

    console.log(`Found ${offer.comments.length} comments`);
    res.json(offer.comments || []);
  } catch (err) {
    console.error('Error fetching comments:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:offerId/comments/:commentId', auth, async (req, res) => {
  try {
    console.log('DELETE request:', req.params);

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    await comment.deleteOne();

    const offer = await Offer.findById(req.params.offerId);
    if (offer) {
      offer.comments = offer.comments.filter(c => c.toString() !== req.params.commentId);
      await offer.save();
    }

    console.log('Comment deleted:', req.params.commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error.message);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
});

router.put('/:offerId/comments/:commentId', auth, async (req, res) => {
  try {
    console.log('PUT request to update comment:', req.params);
    console.log('Body received:', req.body);

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this comment' });
    }

    comment.message = req.body.message || req.body.comment;
    comment.rating = req.body.rating || comment.rating;
    await comment.save();

    console.log('Comment updated:', comment._id);
    res.status(200).json(comment);
  } catch (err) {
    console.error('Error updating comment:', err.message);
    res.status(500).json({ message: 'Error updating comment' });
  }
});

module.exports = router;
