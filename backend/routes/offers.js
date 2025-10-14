const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Offer = require('../models/Offer'); 
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
    const offers = await Offer.find().populate('user', 'username'); // Якщо є user
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('user', 'username');
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

    const parsedCategories = JSON.parse(categories || '[]');
    const parsedDates = JSON.parse(availableDates || '[]');
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
      flightConnections: parsedFlights,
    });

    await newOffer.save();
    res.status(201).json(newOffer);
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
    const parsedDates = JSON.parse(availableDates || '[]');
    const parsedPlaces = JSON.parse(placesToVisit || '[]');
    const parsedFlights = JSON.parse(flightConnections || '[]');

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

    offer.title = title || offer.title;
    offer.description = description || offer.description;
    offer.price = price ? Number(price) : offer.price;
    offer.duration = duration ? Number(duration) : offer.duration;
    offer.city = city || offer.city;
    offer.country = country || offer.country;
    offer.departureAirportIATA = departureAirportIATA || offer.departureAirportIATA;
    offer.categories = parsedCategories.length > 0 ? parsedCategories : offer.categories;
    offer.availableDates = parsedDates.length > 0 ? parsedDates : offer.availableDates;
    offer.flightConnections = parsedFlights;

    await offer.save();
    res.json(offer);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;