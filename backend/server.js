const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const offerRoutes = require('./routes/offers'); 
const commentRoutes = require('./routes/comments');
const authRoutes = require('./routes/auth'); 
const userRoutes = require('./routes/users');
const protectedRoutes = require('./routes/protected');

const app = express();

const port = 5001;

// Konfiguracja CORS - dozwolone połączenia tylko z frontendu
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Udostępnianie statycznych plików (np. obrazków)
app.use('/images', express.static('public/images'));
app.use('/uploads', express.static('uploads'));  // dodatkowy folder na pliki, jeśli potrzeba

// Parsowanie danych JSON i formularzy URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rejestrowanie ścieżek API
app.use('/api/users', userRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/auth', authRoutes);

// Połączenie z bazą danych MongoDB
mongoose.connect('mongodb://localhost:27017/expedisDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('Error connecting to MongoDB:', err));

// Uruchomienie serwera na porcie 5001
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
