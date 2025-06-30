const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'mySuperSecretKey'; 
const authAdminMiddleware = async (req, res, next) => {
  try {
    // Sprawdzanie nagłówka autoryzacji
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Wyodrębnianie tokenu z nagłówka (format: Bearer <token>)
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Weryfikacja tokenu JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Wyszukanie użytkownika w bazie danych
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Sprawdzenie roli administratora
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: admins only' });
    }

    // Przypisanie danych użytkownika do obiektu request
    req.user = user;
    next();
    
  } catch (err) {
    // Obsługa błędów autentykacji
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authAdminMiddleware;