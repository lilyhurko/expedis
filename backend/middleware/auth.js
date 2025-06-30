const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mySuperSecretKey'; 

const auth = (req, res, next) => {
  // Sprawdzanie nagłówka autoryzacji
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Wyodrębnianie tokenu z nagłówka
  const token = authHeader.split(' ')[1];
  console.log('Token:', token); // logowanie tokenu dla debugowania

  try {
    // Weryfikacja tokenu
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Dodanie danych użytkownika do obiektu request
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user',
    };
    
    req.token = token; // zapisanie tokenu w requeście
    next();
  } catch (err) {
    // Obsługa błędów weryfikacji tokenu
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;