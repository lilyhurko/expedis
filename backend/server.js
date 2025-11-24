require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const offerRoutes = require('./routes/offers');  
const airportsRouter = require("./routes/airports");
const commentRoutes = require('./routes/comments');
const authRoutes = require('./routes/auth'); 
const userRoutes = require('./routes/users');
const protectedRoutes = require('./routes/protected');
const flightConnectionsRoutes = require("./routes/flightConnection");
const hotelRoutes = require('./routes/hotels');
const walletRoutes = require('./routes/wallet');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const carrentRoutes = require('./routes/carrent');


const app = express();
const port = process.env.PORT || 5001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/images', express.static('public/images'));

console.log("Mounting routes...");
app.use("/api/airports", airportsRouter);
app.use('/api/offers', offerRoutes);  
app.use('/api/comments', commentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/protected', protectedRoutes);
app.use("/api/flight-connections", flightConnectionsRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cars', carrentRoutes);
app.use('/api/chat', require('./routes/chat'));


async function startServer() {
  try {
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expedisDB?replicaSet=rs0');    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

startServer();