// Trasy zarządzania komentarzami: tworzenie, pobieranie, edytowanie i usuwanie

const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mySuperSecretKey';
const auth = require('../middleware/auth');

// Tworzenie nowego komentarza (wymaga tokenu JWT)
router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token not provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    const newComment = new Comment({
      message: req.body.message,
      userId: user._id,
      username: user.username,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Pobieranie wszystkich komentarzy (posortowanych od najnowszych)
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    const formatted = comments.map(comment => ({
      _id: comment._id,
      message: comment.message,
      username: comment.username,
      userId: comment.userId,
      createdAt: comment.createdAt 
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Usuwanie komentarza (autoryzowany użytkownik lub admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
});

// Edytowanie własnego komentarza (tylko autor może edytować)
router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this comment' });
    }

    comment.message = req.body.message;
    await comment.save();
    res.status(200).json({ message: 'Comment updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating comment' });
  }
});

module.exports = router;
