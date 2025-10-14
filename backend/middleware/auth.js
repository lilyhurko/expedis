const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallbackSecret'; 

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided'); 
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token received in auth:', token ? 'Present' : 'Missing'); 

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user',
    };
    
    req.token = token;
    console.log('User authenticated:', req.user.id, req.user.role); 
    next();
  } catch (err) {
    console.error('Auth error:', err.message, err.name);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;