const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Endpoint do pobierania profilu użytkownika - wymaga autoryzacji
router.get('/profile', auth, (req, res) => {
  // Jeśli użytkownik jest poprawnie uwierzytelniony, zwracamy jego ID
  res.json({ message: 'Welcome to your profile', userId: req.user.id });
});

module.exports = router;
