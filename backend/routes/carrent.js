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

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

async function isCarAvailable(carId, pickupDate, returnDate) {
  const overlapping = await CarBooking.findOne({
    car: carId,
    status: 'confirmed',
    pickupDate: { $lt: new Date(returnDate) },
    returnDate: { $gt: new Date(pickupDate) }
  });
  return !overlapping;
}

router.get('/admin/pending', authMiddleware, authAdminMiddleware, async (req, res) => {
  try {
    const pendingCars = await Car.find({ status: 'pending' })
      .populate({
        path: 'agency',
        select: 'name email'
      })
      .sort({ createdAt: -1 });

    res.json(pendingCars);
  } catch (error) {
    console.error('Error fetching pending cars:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/admin/bookings/pending', authMiddleware, authAdminMiddleware, async (req, res) => {
  try {
    const pendingBookings = await CarBooking.find({ status: 'pending' })
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'car',
        select: 'make model year pricePerDay city country imageUrl agency',
        populate: {
          path: 'agency',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json(pendingBookings);
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/admin/bookings/:id/status', authMiddleware, authAdminMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Status must be "confirmed" or "cancelled"' });
  }

  try {
    const booking = await CarBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('car');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ message: 'Booking updated', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/status', authMiddleware, authAdminMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!['active', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Car status updated', car });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/agency/bookings', authMiddleware, async (req, res) => {
  try {
    const agencyId = req.user.id;

    const agencyCars = await Car.find({ agency: agencyId }).select('_id');

    if (!agencyCars.length) {
      return res.json([]);
    }

    const carIds = agencyCars.map(car => car._id);

    const bookings = await CarBooking.find({ car: { $in: carIds } })
      .populate('user', 'name email')
      .populate('car', 'make model city country')
      .sort({ createdAt: -1 });

    res.json(bookings);

  } catch (error) {
    console.error('Error fetching agency bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { make, model, year, category, pricePerDay, city, country, description } = req.body;

    if (!make || !model || !pricePerDay || !city || !country || !req.file) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Fill all required fields and upload a photo' });
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
      description: category || description
    });

    await newCar.save();
    res.status(201).json({ message: 'Car added for review', car: newCar });
  } catch (error) {
    console.error('Error adding car:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { city, pickupDate, returnDate, maxPrice, category } = req.query;
    let cars = await Car.find({ status: 'active' });

    if (category && category.trim()) {
      cars = cars.filter(c => c.description?.trim() === category.trim());
    }
    if (city && city.trim()) {
      const lower = city.trim().toLowerCase();
      cars = cars.filter(c => c.city?.toLowerCase().includes(lower));
    }
    if (maxPrice) {
      cars = cars.filter(c => c.pricePerDay <= Number(maxPrice));
    }

    if (pickupDate && returnDate) {
      const bookedIds = await CarBooking.find({
        status: 'confirmed',
        pickupDate: { $lt: new Date(returnDate) },
        returnDate: { $gt: new Date(pickupDate) }
      }).distinct('car');

      cars = cars.filter(car =>
        !bookedIds.map(id => id.toString()).includes(car._id.toString())
      );
    }

    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/book', authMiddleware, async (req, res) => {
  const { carId, pickupDate, returnDate } = req.body;
  const userId = req.user.id;

  try {
    const car = await Car.findById(carId);
    const user = await User.findById(userId);
    if (!car || !user) return res.status(404).json({ message: 'Car or user not found' });

    const available = await isCarAvailable(carId, pickupDate, returnDate);
    if (!available) return res.status(409).json({ message: 'The car is already booked for these dates' });

    const days = Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = car.pricePerDay * days;

    if (user.balance < totalPrice) return res.status(403).json({ message: 'Insufficient funds' });

    user.balance -= totalPrice;
    await user.save();

    const booking = new CarBooking({
      car: carId,
      user: userId,
      pickupDate,
      returnDate,
      totalPrice,
      status: 'pending'
    });
    await booking.save();

    res.status(201).json({
      message: 'Booking created. Awaiting admin confirmation.',
      booking
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-rents', authMiddleware, async (req, res) => {
  try {
    const bookings = await CarBooking.find({ user: req.user.id })
      .populate('car')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authMiddleware, authAdminMiddleware, upload.single('image'), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key]) car[key] = updates[key];
    });
    if (req.file) car.imageUrl = `/images/cars/${req.file.filename}`;

    await car.save();
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, authAdminMiddleware, async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Car deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;