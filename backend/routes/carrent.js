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
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail');

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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await CarBooking.findById(req.params.id)
      .populate('user')
      .populate({
        path: 'car',
        populate: {
          path: 'agency',
          select: 'name email' 
        }
      })
      .session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found' });
    }

    const user = booking.user;
    const car = await Car.findById(booking.car).populate('agency');

    const agency = car ? car.agency : null;

    if (status === 'confirmed') {
      booking.status = 'confirmed';
      await booking.save({ session });

      if (agency) {
        if (typeof agency.balance === 'number') {
          agency.balance = (agency.balance || 0) + booking.totalPrice;
        } else {
          agency.balance = booking.totalPrice;
        }
        await agency.save({ session });
      }

      await session.commitTransaction();

      if (user && user.email) {
        const clientHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #27ae60;">Car Booking Confirmed ✅</h2>
            <p>Your car booking for <strong>${car.make} ${car.model} (${car.year || ''})</strong> has been confirmed.</p>
            <p><strong>Pickup:</strong> ${new Date(booking.pickupDate).toLocaleDateString()}</p>
            <p><strong>Return:</strong> ${new Date(booking.returnDate).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${booking.totalPrice} PLN</p>
          </div>
        `;
        sendEmail(user.email, `Car Booking Confirmed: ${car.make} ${car.model}`, clientHtml).catch(console.error);
      }


      if (agency && agency.email) {
        const agencyHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2c3e50;">New Confirmed Car Booking 🎉</h2>
            <p>You have a new confirmed booking for <strong>${car.make} ${car.model}</strong>.</p>
            <p><strong>Client:</strong> ${user.name} ${user.surname}</p>
            <p><strong>Pickup:</strong> ${new Date(booking.pickupDate).toLocaleDateString()}</p>
            <p><strong>Return:</strong> ${new Date(booking.returnDate).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${booking.totalPrice} PLN</p>
          </div>
        `;
        sendEmail(agency.email, `New Confirmed Booking: ${car.make} ${car.model}`, agencyHtml).catch(console.error);
      }

      return res.json({ message: 'Booking confirmed', booking });
    }

    if (status === 'cancelled') {
      booking.status = 'cancelled';

      if (user) {
        user.balance = (user.balance || 0) + booking.totalPrice;
        await user.save({ session });
      }

      await booking.save({ session });
      await session.commitTransaction();

      if (user && user.email) {
        const cancelHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #e74c3c;">Car Booking Cancelled ❌</h2>
            <p>Your booking for <strong>${car.make} ${car.model}</strong> has been cancelled by admin.</p>
            <p><strong>${booking.totalPrice} PLN</strong> has been returned to your wallet balance.</p>
          </div>
        `;
        sendEmail(user.email, `Car Booking Cancelled: ${car.make} ${car.model}`, cancelHtml).catch(console.error);
      }


      if (agency && agency.email) {
        const agencyHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #e74c3c;">Booking Cancelled ⚠️</h2>
            <p>The booking for <strong>${car.make} ${car.model}</strong> was cancelled by admin.</p>
            <p><strong>Client:</strong> ${user.name} ${user.surname}</p>
            <p><strong>Pickup:</strong> ${new Date(booking.pickupDate).toLocaleDateString()}</p>
          </div>
        `;
        sendEmail(agency.email, `Booking Cancelled: ${car.make} ${car.model}`, agencyHtml).catch(console.error);
      }

      return res.json({ message: 'Booking cancelled and funds returned', booking });
    }

    await session.commitTransaction();
    res.json(booking);
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating booking (admin):', error);
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

router.get('/locations', async (req, res) => {
  try {
    const locations = await Car.aggregate([
      { $match: { status: 'active' } }, 
      { 
        $group: { 
          _id: { city: "$city", country: "$country" } 
        } 
      },
      { 
        $project: { 
          _id: 0, 
          city: "$_id.city", 
          country: "$_id.country" 
        } 
      },
      { $sort: { city: 1 } } 
    ]);

    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Server error' });
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

    if (category && category.trim() !== '' && category !== 'All Categories') {
      const searchCat = category.trim().toLowerCase();
      cars = cars.filter(c => {
        const inDescription = c.description?.toLowerCase().includes(searchCat);
        const inOptions = c.options?.some(opt => opt.toLowerCase().includes(searchCat));
        const inMake = c.make?.toLowerCase().includes(searchCat);
        return inDescription || inOptions || inMake;
      });
    }

    if (city && city.trim() !== '') {
      const searchCity = city.trim().toLowerCase();
      cars = cars.filter(c => 
        c.city?.toLowerCase().includes(searchCity) || 
        c.country?.toLowerCase().includes(searchCity)
      );
    }

    if (maxPrice && !isNaN(maxPrice)) {
      cars = cars.filter(c => c.pricePerDay <= Number(maxPrice));
    }

    if (pickupDate && returnDate) {
      const overlappingBookings = await CarBooking.find({
        status: 'confirmed',
        $or: [
            { pickupDate: { $lte: new Date(returnDate) }, returnDate: { $gte: new Date(pickupDate) } }
        ]
      }).select('car');

      const bookedCarIds = overlappingBookings.map(b => b.car.toString());

      cars = cars.filter(car => !bookedCarIds.includes(car._id.toString()));
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
    const car = await Car.findById(carId).populate({
      path: 'agency',
      select: 'name email' 
    });
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

    if (user.email) {
      const clientHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Booking Request Received 📝</h2>
          <p>Your booking request for <strong>${car.make} ${car.model}</strong> has been received and is awaiting admin confirmation.</p>
          <p><strong>Pickup:</strong> ${new Date(pickupDate).toLocaleDateString()}</p>
          <p><strong>Return:</strong> ${new Date(returnDate).toLocaleDateString()}</p>
          <p><strong>Total:</strong> ${totalPrice} PLN</p>
        </div>
      `;
      sendEmail(user.email, `Car Booking Requested: ${car.make} ${car.model}`, clientHtml).catch(console.error);
    }

    if (process.env.ADMIN_EMAIL) {
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Car Booking Request 📝</h2>
          <p>User <strong>${user.name} ${user.surname}</strong> requested to book <strong>${car.make} ${car.model}</strong>.</p>
          <p><strong>Total held:</strong> ${totalPrice} PLN</p>
          <p><strong>Pickup:</strong> ${new Date(pickupDate).toLocaleDateString()}</p>
          <p>Please review and confirm or reject this booking in your admin panel.</p>
          <a href="${process.env.REACT_APP_ADMIN_URL || 'http://localhost:3000/admin/dashboard'}" style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Admin Dashboard</a>
        </div>
      `;
      sendEmail(process.env.ADMIN_EMAIL, `New Car Booking: ${car.make} ${car.model}`, adminHtml).catch(console.error);
    }

    if (car.agency && car.agency.email) {
      const agencyHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Booking Request for your car 🚗</h2>
          <p>A customer requested booking for <strong>${car.make} ${car.model}</strong>.</p>
          <p><strong>Pickup:</strong> ${new Date(pickupDate).toLocaleDateString()}</p>
          <p><strong>Total:</strong> ${totalPrice} PLN</p>
        </div>
      `;
      sendEmail(car.agency.email, `New Booking Request: ${car.make} ${car.model}`, agencyHtml).catch(console.error);
    }

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
    const currentDate = new Date();

    const bookingsToComplete = await CarBooking.find({
      user: req.user.id,
      status: 'confirmed',
      returnDate: { $lt: currentDate }
    })
    .populate('car')
    .populate('user');

    if (bookingsToComplete.length > 0) {
      await CarBooking.updateMany(
        {
          user: req.user.id,
          status: 'confirmed',
          returnDate: { $lt: currentDate }
        },
        { status: 'completed' }
      );

      bookingsToComplete.forEach(b => {
        if (b.user && b.user.email) {
          const completedHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #3498db;">Hope you enjoyed your ride! 🌍</h2>
              <p>We hope you enjoyed your ride with <strong>${b.car.make} ${b.car.model}</strong>.</p>
              <p>Please log in to your profile to leave a review and share your experience with others!</p>
            </div>
          `;
          sendEmail(b.user.email, `How was your car rental: ${b.car.make} ${b.car.model}`, completedHtml)
            .catch(err => console.error("Failed to send completion email:", err));
        }
      });
    }

    const bookings = await CarBooking.find({ user: req.user.id })
      .populate('car')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await CarBooking.findById(req.params.id)
      .populate('car')
      .session(session);

    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    if (new Date(booking.pickupDate) < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot cancel past bookings' });
    }

    const user = await User.findById(req.user.id).session(session);

    user.balance = (user.balance || 0) + booking.totalPrice;
    await user.save({ session });

    booking.status = 'cancelled';
    await booking.save({ session });

    await session.commitTransaction();

    if (user.email) {
      const refundHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #e74c3c;">Booking Cancelled ❌</h2>
          <p>You have successfully cancelled your car booking for <strong>${booking.car.make} ${booking.car.model}</strong>.</p>
          <p><strong>${booking.totalPrice} PLN</strong> has been returned to your wallet balance.</p>
        </div>
      `;
      sendEmail(user.email, `Car Booking Cancelled: ${booking.car.make} ${booking.car.model}`, refundHtml).catch(console.error);
    }

    const car = await Car.findById(booking.car).populate('agency');

    if (car && car.agency) {
      const agency = await User.findById(car.agency).select('email name surname');
      if (agency && agency.email) {
        const agencyCancelHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #e74c3c;">Booking Cancelled by User ⚠️</h2>
            <p>The client has cancelled their booking for <strong>${car.make} ${car.model}</strong>.</p>
            <p>Date: ${new Date(booking.pickupDate).toLocaleDateString()}</p>
          </div>
        `;
        sendEmail(agency.email, `Cancellation Alert: ${car.make} ${car.model}`, agencyCancelHtml).catch(console.error);
      }
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    await session.abortTransaction();
    console.error('Cancel error:', err);
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
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
module.exports.isCarAvailable = isCarAvailable;