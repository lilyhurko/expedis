const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'mySuperSecretKey'; 
const authAdminMiddleware = async (req, res, next) => {
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

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: admins only' });
    }

    req.user = user;
    next();
    
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authAdminMiddleware;