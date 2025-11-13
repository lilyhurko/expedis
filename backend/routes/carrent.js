const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const CarBooking = require('../models/CarBooking');
const User = require('../models/User'); 
const authAdminMiddleware = require('../middleware/authAdminMiddleware'); 
const authMiddleware = require('../middleware/auth'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/images/cars'; 
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname)); 
    }
});

const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 } 
});

async function isCarAvailable(carId, pickupDate, returnDate) {
    const overlappingBooking = await CarBooking.findOne({
        car: carId,
        status: 'confirmed', 
        pickupDate: { $lt: new Date(returnDate) },
        returnDate: { $gt: new Date(pickupDate) }
    });
    return !overlappingBooking; 
}


router.post('/', authMiddleware, authAdminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { make, model, year, city, country, pricePerDay, options, description } = req.body;
        const imageUrl = req.file ? `/images/cars/${req.file.filename}` : null;

        if (!make || !model || !pricePerDay || !city || !imageUrl) {
            if (req.file) fs.unlinkSync(req.file.path); 
            return res.status(400).json({ error: 'Missing required fields: make, model, city, pricePerDay, and image.' });
        }
        
        const newCar = new Car({
            make, model, city, country, imageUrl, description,
            year: Number(year),
            pricePerDay: Number(pricePerDay),
            options: JSON.parse(options || '[]'),
        });

        await newCar.save();
        res.status(201).json(newCar);
    } catch (error) {
        console.error('Error adding car:', error);
        if (req.file) fs.unlinkSync(req.file.path); 
        res.status(500).json({ message: error.message });
    }
});


router.get('/', async (req, res) => {
    try {
        const { city, pickupDate, returnDate, minPrice, maxPrice } = req.query;

        if (!city) {
            return res.status(400).json({ message: "City parameter is required." });
        }

        const carQuery = { city: new RegExp(city, 'i') };

        if (minPrice || maxPrice) {
            carQuery.pricePerDay = {};
            if (minPrice) carQuery.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) carQuery.pricePerDay.$lte = Number(maxPrice);
        }

        if (!pickupDate || !returnDate) {
            const allCars = await Car.find(carQuery);
            return res.json(allCars);
        }

        const overlappingBookings = await CarBooking.find({
            status: 'confirmed',
            pickupDate: { $lt: new Date(returnDate) },
            returnDate: { $gt: new Date(pickupDate) }
        }).select('car');

        const unavailableCarIds = overlappingBookings.map(b => b.car);

        const availableCars = await Car.find({
            ...carQuery,
            _id: { $nin: unavailableCarIds }
        });

        res.json(availableCars);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.post('/book', authMiddleware, async (req, res) => {
    const { carId, pickupDate, returnDate } = req.body;
    const userId = req.user.id; 

    try {
        const car = await Car.findById(carId);
        const user = await User.findById(userId);

        if (!car || !user) {
            return res.status(404).json({ message: 'Car or user not found.' });
        }
        
        const available = await isCarAvailable(carId, pickupDate, returnDate);
        if (!available) {
             return res.status(409).json({ message: 'Sorry, the car has just been booked for these dates.' });
        }

        const start = new Date(pickupDate);
        const end = new Date(returnDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        const totalPrice = car.pricePerDay * diffDays;
        
        if (user.balance < totalPrice) {
            return res.status(403).json({ message: 'Insufficient balance.' });
        }

        user.balance -= totalPrice;
        await user.save();

        const newBooking = new CarBooking({
            car: carId,
            user: userId,
            pickupDate,
            returnDate,
            totalPrice,
            status: 'pending' 
        });

        await newBooking.save();

        res.status(201).json({ 
            message: 'Booking successfully created. Awaiting administrator confirmation.',
            booking: newBooking
        });

    } catch (error) {
        console.error('Error during car booking:', error);
        res.status(500).json({ message: error.message });
    }
});


router.get('/bookings/pending', authMiddleware, authAdminMiddleware, async (req, res) => {
    try {
        const bookings = await CarBooking.find({ status: 'pending' }).populate('car').populate('user', 'username email');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/bookings/:id/confirm', authMiddleware, authAdminMiddleware, async (req, res) => {
    try {
        const booking = await CarBooking.findByIdAndUpdate(
            req.params.id, 
            { status: 'confirmed' }, 
            { new: true }
        ).populate('car').populate('user', 'username');

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;