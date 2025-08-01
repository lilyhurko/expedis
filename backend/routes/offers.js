const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

// Multer configuration for file uploads
const uploadDir = path.join(__dirname, "..", "public", "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and GIF images are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit per file
});

// Authentication middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication token missing" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

// GET /api/offers - Fetch all offers
router.get("/", async (req, res) => {
  try {
    const offers = await Offer.find(); // Retrieve all offers from the database
    res.json(offers);
  } catch (err) {
    console.error("Error fetching offers:", err.stack);
    res
      .status(500)
      .json({ message: "Failed to fetch offers", error: err.message });
  }
});

// POST /api/offers - Create a new offer
router.post(
  "/",
  authMiddleware,
  upload.array("images", 15),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        duration,
        city,
        country,
        categories,
        availableDates,
        mainImageIndex,
      } = req.body;

      // Validate required fields
      if (!title || !description || !price || !duration || !city || !country) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields" });
      }

      const priceNum = Number(price);
      const durationNum = Number(duration);
      const mainImageIndexNum = Number(mainImageIndex);

      if (isNaN(priceNum) || isNaN(durationNum)) {
        return res
          .status(400)
          .json({ message: "Price and duration must be numbers" });
      }

      // Parse categories
      let categoriesArray = [];
      try {
        categoriesArray =
          typeof categories === "string"
            ? JSON.parse(categories)
            : Array.isArray(categories)
            ? categories
            : [];
      } catch (err) {
        console.error("Error parsing categories:", err.stack);
        return res.status(400).json({ message: "Invalid categories format" });
      }

      // Parse available dates
      let datesArray = [];
      try {
        datesArray =
          typeof availableDates === "string"
            ? JSON.parse(availableDates)
            : Array.isArray(availableDates)
            ? availableDates
            : [];
        datesArray = datesArray.map((date) => new Date(date));
        if (datesArray.some((date) => isNaN(date.getTime()))) {
          return res
            .status(400)
            .json({ message: "Invalid date format in availableDates" });
        }
      } catch (err) {
        console.error("Error parsing availableDates:", err.stack);
        return res
          .status(400)
          .json({ message: "Invalid availableDates format" });
      }

      // Handle images
      const imageUrls = req.files
        ? req.files.map((file) => "/images/" + file.filename)
        : [];

      if (imageUrls.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one image is required" });
      }

      if (
        isNaN(mainImageIndexNum) ||
        mainImageIndexNum < 0 ||
        mainImageIndexNum >= imageUrls.length
      ) {
        return res.status(400).json({
          message: `mainImageIndex is out of range (received ${mainImageIndexNum}, total images: ${imageUrls.length})`,
        });
      }

      // Create new offer
      const newOffer = new Offer({
        title,
        description,
        price: priceNum,
        duration: durationNum,
        city,
        country,
        categories: categoriesArray,
        availableDates: datesArray,
        imageUrls,
        imageUrl: imageUrls[mainImageIndexNum], // Backward compatibility
        mainImageIndex: mainImageIndexNum,
      });

      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (err) {
      console.error("Error creating offer:", err.stack);
      res
        .status(500)
        .json({ message: "Failed to create offer", error: err.message });
    }
  }
);

// PUT /api/offers/:id - Update an existing offer
router.put('/:id', authMiddleware, upload.array('images', 15), async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update offers' });
  }
  try {
    const { id } = req.params;
    console.log('PUT /api/offers/:id - Request params:', { id });
    console.log('PUT /api/offers/:id - Request body:', req.body);
    console.log('PUT /api/offers/:id - Uploaded files:', req.files);
if (!mongoose.isValidObjectId(id)) {
      console.log('Invalid ObjectId:', id);
      return res.status(400).json({ message: 'Invalid offer ID format' });
    }
    const {
      title,
      description,
      price,
      duration,
      categories,
      availableDates,
      city,
      country,
      mainImageIndex,
      imageUrls,
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !duration || !city || !country) {
      console.log('Missing required fields:', { title, description, price, duration, city, country });
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const priceNum = Number(price);
    const durationNum = Number(duration);
    const mainImageIndexNum = Number(mainImageIndex);

    if (isNaN(priceNum) || isNaN(durationNum)) {
      console.log('Invalid number format:', { price, duration });
      return res.status(400).json({ message: 'Price and duration must be numbers' });
    }

    // Parse categories
    let categoriesArray = [];
    try {
      console.log('Parsing categories:', categories);
      categoriesArray =
        typeof categories === 'string'
          ? JSON.parse(categories)
          : Array.isArray(categories)
          ? categories
          : [];
      console.log('Parsed categories:', categoriesArray);
    } catch (err) {
      console.error('Error parsing categories:', err.message, err.stack);
      return res.status(400).json({ message: 'Invalid categories format', error: err.message });
    }

    // Parse available dates
    let datesArray = [];
    try {
      console.log('Parsing availableDates:', availableDates);
      datesArray =
        typeof availableDates === 'string'
          ? JSON.parse(availableDates)
          : Array.isArray(availableDates)
          ? availableDates
          : [];
      datesArray = datesArray.map((date) => new Date(date));
      if (datesArray.some((date) => isNaN(date.getTime()))) {
        console.log('Invalid dates found:', datesArray);
        return res.status(400).json({ message: 'Invalid date format in availableDates' });
      }
      console.log('Parsed availableDates:', datesArray);
    } catch (err) {
      console.error('Error parsing availableDates:', err.message, err.stack);
      return res.status(400).json({ message: 'Invalid availableDates format', error: err.message });
    }

    // Handle images
    let newImageUrls = req.files ? req.files.map((file) => '/images/' + file.filename) : [];
    let existingImageUrls = [];
    try {
      console.log('Parsing imageUrls:', imageUrls);
      existingImageUrls = imageUrls
        ? typeof imageUrls === 'string'
          ? JSON.parse(imageUrls)
          : Array.isArray(imageUrls)
          ? imageUrls
          : []
        : [];
      existingImageUrls = existingImageUrls.filter((url) => url && url.trim() !== '');
      console.log('Parsed existingImageUrls:', existingImageUrls);
    } catch (err) {
      console.error('Error parsing imageUrls:', err.message, err.stack);
      return res.status(400).json({ message: 'Invalid imageUrls format', error: err.message });
    }

    const allImageUrls = [...existingImageUrls, ...newImageUrls];
    console.log('All image URLs:', allImageUrls);

    if (allImageUrls.length === 0) {
      console.log('No images provided');
      return res.status(400).json({ message: 'At least one image is required' });
    }

    if (
      isNaN(mainImageIndexNum) ||
      mainImageIndexNum < 0 ||
      mainImageIndexNum >= allImageUrls.length
    ) {
      console.log('Invalid mainImageIndex:', { mainImageIndexNum, totalImages: allImageUrls.length });
      return res.status(400).json({
        message: `mainImageIndex is out of range (received ${mainImageIndexNum}, total images: ${allImageUrls.length})`,
      });
    }

    // Find and update the offer
    console.log('Finding offer by ID:', id);
    const offer = await Offer.findById(id);
    if (!offer) {
      console.log('Offer not found for ID:', id);
      return res.status(404).json({ message: 'Offer not found' });
    }

    // Update fields
    offer.title = title;
    offer.description = description;
    offer.price = priceNum;
    offer.duration = durationNum;
    offer.city = city;
    offer.country = country;
    offer.categories = categoriesArray;
    offer.availableDates = datesArray;
    offer.imageUrls = allImageUrls;
    offer.imageUrl = allImageUrls[mainImageIndexNum] || ''; // Backward compatibility
    offer.mainImageIndex = mainImageIndexNum;

    console.log('Saving updated offer:', offer);
    await offer.save();
    console.log('Offer saved successfully');
    res.json(offer);
  } catch (err) {
    console.error('Error updating offer:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to update offer', error: err.message });
  }
});

// DELETE /api/offers/:id - Delete an offer
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }
    await offer.deleteOne();
    res.json({ message: "Offer deleted successfully" });
  } catch (err) {
    console.error("Error deleting offer:", err.stack);
    res
      .status(500)
      .json({ message: "Failed to delete offer", error: err.message });
  }
});

module.exports = router;
