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

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { make, model, year, category, pricePerDay, city, country, description } = req.body;

    if (!make || !model || !pricePerDay || !city || !country) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Заповніть усі обов’язкові поля' });
    }

    const newCar = new Car({
        make,
        model,
        year: year ? Number(year) : undefined,
        pricePerDay: Number(pricePerDay),
        city,
        country,
        imageUrl: `/images/cars/${req.file.filename}`,
        agency: req.user.id,
        status: 'pending',
        description: category,
    });

    await newCar.save();
    res.status(201).json({ message: 'Авто додано на перевірку', car: newCar });

  } catch (error) {
    console.error('Error adding car by agency:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const { city, pickupDate, returnDate, maxPrice, category } = req.query;

    let cars = await Car.find({});

    if (category && category.toString().trim() !== '') {
      const exactCategory = category.toString().trim();

      cars = cars.filter(car => {
        if (!car.description) return false;
        const desc = car.description.toString().trim();
        return desc === exactCategory; 
      });
    }

    if (city && city.toString().trim()) {
      const c = city.toString().trim().toLowerCase();
      cars = cars.filter(car => car.city?.toString().toLowerCase().includes(c));
    }

    if (maxPrice && !isNaN(maxPrice)) {
      cars = cars.filter(car => car.pricePerDay <= Number(maxPrice));
    }

    cars = cars.filter(car => !car.status || car.status === 'active');

    if (pickupDate && returnDate) {
      const booked = await CarBooking.find({
        status: 'confirmed',
        pickupDate: { $lt: new Date(returnDate) },
        returnDate: { $gt: new Date(pickupDate) }
      }).distinct('car');

      cars = cars.filter(car => !booked.map(id => id.toString()).includes(car._id.toString()));
    }
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
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


router.put('/:id', authMiddleware, authAdminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { make, model, year, city, country, pricePerDay, options, description } = req.body;
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        car.make = make || car.make;
        car.model = model || car.model;
        car.year = year ? Number(year) : car.year;
        car.city = city || car.city;
        car.country = country || car.country;
        car.pricePerDay = pricePerDay ? Number(pricePerDay) : car.pricePerDay;
        car.description = description || car.description;
        
        if (options) {
            car.options = JSON.parse(options);
        }

        if (req.file) {
            car.imageUrl = `/images/cars/${req.file.filename}`;
        }

        const updatedCar = await car.save();
        res.json(updatedCar);

    } catch (error) {
        console.error('Error updating car:', error);
        res.status(500).json({ message: error.message });
    }
});


router.delete('/:id', authMiddleware, authAdminMiddleware, async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }


        res.json({ message: 'Car deleted successfully' });
    } catch (error) {
        console.error('Error deleting car:', error);
        res.status(500).json({ message: error.message });
    }
});


router.get('/admin/pending', authMiddleware, authAdminMiddleware, async (req, res) => {
  try {
    const pendingCars = await Car.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .lean(); 

    res.json(pendingCars);
  } catch (error) {
    console.error('Помилка завантаження авто на перевірку:', error);
    res.status(500).json({ message: 'Server error' });
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


router.get("/my-rents", authMiddleware, async (req, res) => {
  try {
    const bookings = await CarBooking.find({ user: req.user.id })
      .populate("car")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Error" });
  }
});

router.patch('/:id/status', authMiddleware, authAdminMiddleware, async (req, res) => {
  try {
    const { status } = req.body; 
    
    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Status updated', car: updatedCar });
  } catch (error) {
    console.error('Error updating car status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/allrents', async (req, res) => { // authMiddleware, authAdminMiddleware,
  try {
    let cars = await CarBooking.find({});
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;