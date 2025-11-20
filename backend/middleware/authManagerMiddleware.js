const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret';

const authManagerMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.role !== 'admin' && user.role !== 'agency') {
      return res.status(403).json({ message: 'Access denied: Agencies and Admins only' });
    }

    req.user = user;
    next();
    
  } catch (err) {
    console.error("Auth Manager Error:", err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authManagerMiddleware;