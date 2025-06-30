const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfiguracja multer do przechowywania plików
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); // Folder do przechowywania obrazków
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unikalna nazwa pliku
  }
});
const upload = multer({ storage: storage });

// Pobierz wszystkie oferty
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (err) {
    // Błąd serwera podczas pobierania ofert
    res.status(500).json({ message: 'Server error while fetching offers' });
  }
});

// Dodaj nową ofertę z obrazkiem
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, duration } = req.body;

    // Walidacja danych wejściowych
    if (!title || !description || !price || !duration) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const priceNum = Number(price);
    const durationNum = Number(duration);

    if (isNaN(priceNum) || isNaN(durationNum)) {
      return res.status(400).json({ message: 'Price and duration must be numbers' });
    }

    const imageUrl = req.file ? '/images/' + req.file.filename : '';

    const newOffer = new Offer({
      title,
      description,
      price: priceNum,
      duration: durationNum,
      imageUrl
    });

    await newOffer.save();
    // Oferta została utworzona pomyślnie
    res.status(201).json(newOffer);
  } catch (err) {
    console.error('Error adding offer:', err);
    res.status(500).json({ message: 'Failed to add offer' });
  }
});

// Edytuj ofertę na podstawie ID
router.put('/:id', async (req, res) => {
  try {
    const { title, description, price, duration, imageUrl } = req.body;

    // Sprawdź, czy dane są prawidłowe
    if (!title || !description || !price || !duration) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const priceNum = Number(price);
    const durationNum = Number(duration);

    if (isNaN(priceNum) || isNaN(durationNum)) {
      return res.status(400).json({ message: 'Price and duration must be numbers' });
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      { title, description, price: priceNum, duration: durationNum, imageUrl },
      { new: true }
    );

    if (!updatedOffer) {
      // Oferta nie została znaleziona
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Oferta została zaktualizowana pomyślnie
    res.json(updatedOffer);
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating offer' });
  }
});

// Usuń ofertę na podstawie ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedOffer = await Offer.findByIdAndDelete(req.params.id);

    if (!deletedOffer) {
      // Oferta do usunięcia nie istnieje
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Oferta została usunięta pomyślnie
    res.json({ message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting offer' });
  }
});

module.exports = router;
