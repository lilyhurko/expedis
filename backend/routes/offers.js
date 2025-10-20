const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Offer = require('../models/Offer'); 
const FlightConnection = require('../models/FlightConnection');
const mongoose = require('mongoose');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find().populate('user', 'username').populate('flightConnections');
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('user', 'username').populate('flightConnections');
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ offer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', upload.fields([
  { name: 'images', maxCount: 15 }, 
  { name: 'placeImages', maxCount: 10 } 
]), async (req, res) => {
  try {
    const { title, description, price, duration, city, country, departureAirportIATA, categories, availableDates, placesToVisit, flightConnections, mainImageIndex } = req.body;

    console.log('Creating offer with flights:', flightConnections); // NEW: Debug log

    // Базова валідація
    if (!title || !description || !price || !city || !country || !departureAirportIATA) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedCategories = JSON.parse(categories || '[]');
    const parsedDates = JSON.parse(availableDates || '[]').map(date => new Date(date)); // UPDATED: Convert to Date objects
    const parsedPlaces = JSON.parse(placesToVisit || '[]');
    const parsedFlights = JSON.parse(flightConnections || '[]');

    const imageUrls = req.files['images'] ? req.files['images'].map(file => `/images/${file.filename}`) : [];
    const parsedMainIndex = mainImageIndex ? parseInt(mainImageIndex) : 0;

    const placesWithImages = parsedPlaces.map((place, index) => {
      const placeImageFile = req.files['placeImages'] ? req.files['placeImages'][index] : null;
      return {
        ...place,
        imageUrl: placeImageFile ? `/images/${placeImageFile.filename}` : null
      };
    });

    // Створюємо FlightConnection документи (offerId: null, бо required: false) - skip if invalid
    const flightConnectionIds = [];
    for (const fcData of parsedFlights) {
      // Skip if required fields are empty
      if (!fcData.departureAirportIATA?.trim() || !fcData.arrivalAirportIATA?.trim() || !fcData.departureTime?.trim() || !fcData.arrivalTime?.trim() || !fcData.flightType?.trim()) {
        console.log('Skipping invalid flight connection:', fcData);
        continue;
      }

      if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(fcData.departureTime)) {
        console.warn('Invalid departureTime format, skipping:', fcData.departureTime);
        continue;
      }

      const flightConnection = new FlightConnection({
        offerId: null, // OK now, since required: false
        departureAirportIATA: fcData.departureAirportIATA,
        arrivalAirportIATA: fcData.arrivalAirportIATA,
        departureTime: fcData.departureTime,
        arrivalTime: fcData.arrivalTime,
        flightType: fcData.flightType,
      });

      await flightConnection.save();
      flightConnectionIds.push(flightConnection._id);
    }

    // Створюємо офер
    const newOffer = new Offer({
      title,
      description,
      price: Number(price),
      duration: Number(duration),
      city,
      country,
      departureAirportIATA,
      categories: parsedCategories,
      availableDates: parsedDates,
      imageUrls,
      mainImageIndex: parsedMainIndex,
      placesToVisit: placesWithImages,
      flightConnections: flightConnectionIds,
    });

    await newOffer.save();

    // Лінкуємо offerId у FlightConnection
    for (const fcId of flightConnectionIds) {
      await FlightConnection.findByIdAndUpdate(fcId, { offerId: newOffer._id });
    }

    // Повертаємо з популяцією
    const populatedOffer = await Offer.findById(newOffer._id).populate('flightConnections');
    res.status(201).json(populatedOffer);
  } catch (error) {
    console.error('Error adding offer:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', upload.fields([
  { name: 'images', maxCount: 15 },
  { name: 'placeImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });

    const { title, description, price, duration, city, country, departureAirportIATA, categories, availableDates, placesToVisit, flightConnections, mainImageIndex } = req.body;

    const parsedCategories = JSON.parse(categories || '[]');
    const parsedDates = JSON.parse(availableDates || '[]').map(date => new Date(date)); // UPDATED: Convert to Date
    const parsedPlaces = JSON.parse(placesToVisit || '[]');
    const parsedFlights = JSON.parse(flightConnections || '[]');

    // Обробка нових зображень
    const newImageUrls = req.files['images'] ? req.files['images'].map(file => `/images/${file.filename}`) : [];
    offer.imageUrls = [...offer.imageUrls, ...newImageUrls];
    offer.mainImageIndex = mainImageIndex ? parseInt(mainImageIndex) : offer.mainImageIndex;

    const placesWithNewImages = parsedPlaces.map((place, index) => {
      const placeImageFile = req.files['placeImages'] ? req.files['placeImages'][index] : null;
      if (placeImageFile) {
        place.imageUrl = `/images/${placeImageFile.filename}`;
      }
      return place;
    });
    offer.placesToVisit = placesWithNewImages;

    // Оновлення базових полів
    offer.title = title || offer.title;
    offer.description = description || offer.description;
    offer.price = price ? Number(price) : offer.price;
    offer.duration = duration ? Number(duration) : offer.duration;
    offer.city = city || offer.city;
    offer.country = country || offer.country;
    offer.departureAirportIATA = departureAirportIATA || offer.departureAirportIATA;
    offer.categories = parsedCategories.length > 0 ? parsedCategories : offer.categories;
    offer.availableDates = parsedDates.length > 0 ? parsedDates : offer.availableDates;

    // Обробка flightConnections (додаємо нові, зберігаємо старі) - skip if invalid
    if (parsedFlights.length > 0) {
      const newFlightIds = [];
      for (const fcData of parsedFlights) {
        // Skip if required fields are empty
        if (!fcData.departureAirportIATA?.trim() || !fcData.arrivalAirportIATA?.trim() || !fcData.departureTime?.trim() || !fcData.arrivalTime?.trim() || !fcData.flightType?.trim()) {
          console.log('Skipping invalid flight connection in update:', fcData);
          continue;
        }

        const flightConnection = new FlightConnection({
          offerId: offer._id, // Тут offerId вже є
          departureAirportIATA: fcData.departureAirportIATA,
          arrivalAirportIATA: fcData.arrivalAirportIATA,
          departureTime: fcData.departureTime,
          arrivalTime: fcData.arrivalTime,
          flightType: fcData.flightType,
        });

        await flightConnection.save();
        newFlightIds.push(flightConnection._id);
      }
      if (newFlightIds.length > 0) {
        offer.flightConnections = [...offer.flightConnections, ...newFlightIds]; // UPDATED: Append only if new valid ones
      }
    }

    await offer.save();

    const populatedOffer = await Offer.findById(offer._id).populate('flightConnections');
    res.json(populatedOffer);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    await FlightConnection.deleteMany({ offerId: req.params.id });
    res.json({ message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;