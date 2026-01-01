const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Offer = require("../models/Offer");
const FlightConnection = require("../models/FlightConnection");
const mongoose = require("mongoose");
const router = express.Router();
const axios = require("axios");
const CityWeather = require("../models/CityWeather");
const authManager = require("../middleware/authManagerMiddleware");
const sendEmail = require("../utils/sendEmail");
const heicConvert = require("heic-convert");

const RAPIDAPI_KEY = "463251c1a9msh9e573ca6257b1afp1576adjsn6ed05f3609c2";
const RAPIDAPI_HOST = "meteostat.p.rapidapi.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/images";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype.startsWith("image/") || ext === '.heic' || ext === '.heif') {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function fetchAndCacheWeather(city, country, latitude, longitude) {
  if (!city || !country || !latitude || !longitude) {
    console.log(`Skipping weather fetch: missing data for ${city}`);
    return null;
  }

  console.log(`Fetching weather via Open-Meteo for: ${city} (${latitude}, ${longitude})`);

  try {
    const lastYear = new Date().getFullYear() - 1;
    const startDate = `${lastYear}-01-01`;
    const endDate = `${lastYear}-12-31`;

    const response = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
      params: {
        latitude: latitude,
        longitude: longitude,
        start_date: startDate,
        end_date: endDate,
        daily: 'temperature_2m_mean,precipitation_sum',
        timezone: 'auto'
      }
    });

    const dailyData = response.data.daily;

    if (!dailyData || !dailyData.time || dailyData.time.length === 0) {
      console.warn(`No weather data found for ${city}`);
      return null;
    }

    const monthlyStats = {};

    for (let i = 0; i < 12; i++) {
      monthlyStats[i] = { tempSum: 0, precipSum: 0, count: 0 };
    }

    dailyData.time.forEach((dateStr, index) => {
      const date = new Date(dateStr);
      const month = date.getMonth(); 
      const temp = dailyData.temperature_2m_mean[index];
      const precip = dailyData.precipitation_sum[index];

      if (temp !== null && precip !== null) {
        monthlyStats[month].tempSum += temp;
        monthlyStats[month].precipSum += precip;
        monthlyStats[month].count++;
      }
    });

    const monthlyWeather = Object.keys(monthlyStats).map(key => {
      const m = monthlyStats[key];
      const avgTemp = m.count > 0 ? (m.tempSum / m.count) : 0;
      
      return {
        month: parseInt(key) + 1, 
        avg_temp: Math.round(avgTemp), 
        precipitation: Math.round(m.precipSum) 
      };
    });

    const searchKey = `${city.toLowerCase().trim()}_${country.toLowerCase().trim()}_${latitude}_${longitude}`;

    const existing = await CityWeather.findOne({ searchKey });
    if (existing) return existing;

    const newWeather = new CityWeather({
      searchKey,
      city,
      country,
      monthlyWeather,
      lastFetched: new Date()
    });

    await newWeather.save();
    console.log(`SUCCESS: Weather cached for ${city} using Open-Meteo`);

    return newWeather;

  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

async function processUploadedFiles(files) {
  if (!files || files.length === 0) return [];

  const processedFiles = [];

  for (const file of files) {
    const ext = path.extname(file.filename).toLowerCase();
    
    if (ext === '.heic' || ext === '.heif') {
      try {
        const inputBuffer = fs.readFileSync(file.path);
        const outputBuffer = await heicConvert({
          buffer: inputBuffer,
          format: 'JPEG',   
          quality: 0.8 
        });

        const newFilename = file.filename.replace(new RegExp(`${ext}$`, 'i'), '.jpg');
        const newPath = path.join(file.destination, newFilename);

        fs.writeFileSync(newPath, outputBuffer);

        fs.unlinkSync(file.path);

        processedFiles.push({
          ...file,
          filename: newFilename,
          path: newPath,
          mimetype: 'image/jpeg'
        });
      } catch (err) {
        console.error("HEIC conversion error:", err);
        processedFiles.push(file);
      }
    } else {
      processedFiles.push(file);
    }
  }
  return processedFiles;
}

router.get("/categories", async (req, res) => {
  try {
    const categories = await Offer.distinct("categories", { status: 'active' });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: error.message });
  }
});



router.get("/agency/my-offers", authManager, async (req, res) => {
  try {
    const offers = await Offer.find({ creator: req.user._id })
      .sort({ createdAt: -1 }); 
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/alldestinations", async (req, res) => {
  try {
    const destinations = await Offer.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: "$country",
          cities: { $addToSet: "$city" },
        },
      },
      { $unwind: "$cities" },
      { $sort: { cities: 1 } },
      {
        $group: {
          _id: "$_id",
          cities: { $push: "$cities" },
        },
      },
      {
        $project: {
          _id: 0,
          country: "$_id",
          cities: "$cities",
        },
      },
      { $sort: { country: 1 } },
    ]);

    res.json(destinations);
  } catch (error) {
    console.error("Error fetching all destinations:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/suggestions", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const regex = new RegExp(q, "i");
    const citySuggestions = await Offer.distinct("city", { city: regex, status: 'active' });
    const countrySuggestions = await Offer.distinct("country", { country: regex, status: 'active' });
    const suggestions = [...new Set([...citySuggestions, ...countrySuggestions])];

    res.json(suggestions.slice(0, 10));
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: error.message });
  }
});



router.patch("/:id/status", authManager, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { status } = req.body;
    if (!['active', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const offer = await Offer.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('creator');
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (offer.creator && offer.creator.email) {
      const msg = status === 'active' ? "Approved" : "Rejected ";
      sendEmail(
        offer.creator.email, 
        `Offer Status: ${msg}`, 
        `The status of your offer "<b>${offer.title}</b>" has been changed to <b>${status.toUpperCase()}</b>.`
      ).catch(console.error);
    }

    res.json(offer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/", async (req, res) => {
    try {
        const { destination, maxPrice, duration, category, startDate, endDate } = req.query;
        let filter = { status: 'active' };
    
        if (destination) {
          const destinations = Array.isArray(destination) ? destination : [destination];
          const destinationRegex = destinations.map((d) => new RegExp(d, "i"));
          filter["$or"] = [
            { city: { $in: destinationRegex } },
            { country: { $in: destinationRegex } },
          ];
        }
    
        if (maxPrice) filter.price = { $lte: Number(maxPrice) };
        if (duration) filter.duration = Number(duration);
    
        if (category) {
          const categories = Array.isArray(category) ? category : [category];
          filter.categories = { $in: categories };
        }
    
        if (startDate && endDate) {
          filter.availableDates = {
            $elemMatch: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          };
        }
    
        const offers = await Offer.find(filter)
          .populate("user", "username")
          .populate("flightConnections");
    
        res.json(offers);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});



router.post(
  "/",
  authManager,
  upload.fields([
    { name: "images", maxCount: 15 },
    { name: "placeImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
        if (req.user.role !== 'agency') {
          return res.status(403).json({ message: "Access denied. Only agencies can create offers." });
        }
  
        let uploadedImages = req.files["images"] || [];
        uploadedImages = await processUploadedFiles(uploadedImages);

        let uploadedPlaceImages = req.files["placeImages"] || [];
        uploadedPlaceImages = await processUploadedFiles(uploadedPlaceImages);

        const {
          title, description, price, duration, city, country,
          latitude: latStr, longitude: lonStr, departureAirportIATA,
          categories, availableDates, placesToVisit, flightConnections, mainImageIndex,
        } = req.body;
  
        const latNum = parseFloat(latStr);
        const lonNum = parseFloat(lonStr);
  
        if (!title || !description || !price || !city || !country || !departureAirportIATA || isNaN(latNum) || isNaN(lonNum)) {
          
          return res.status(400).json({ error: "Missing or invalid required fields" });
        }
  
        await fetchAndCacheWeather(city, country, latNum, lonNum);
  
        const parsedCategories = JSON.parse(categories || "[]");
        const parsedDates = JSON.parse(availableDates || "[]").map((date) => new Date(date));
        const parsedPlaces = JSON.parse(placesToVisit || "[]");
        const parsedFlights = JSON.parse(flightConnections || "[]");
        
        const imageUrls = uploadedImages.map((file) => `/images/${file.filename}`);
        const parsedMainIndex = mainImageIndex ? parseInt(mainImageIndex) : 0;
  
        const placesWithImages = parsedPlaces.map((place, index) => {
          const placeImageFile = uploadedPlaceImages[index] ? uploadedPlaceImages[index] : null;
          return {
            name: place.name,
            description: place.description,
            address: place.address,
            imageUrl: placeImageFile ? `/images/${placeImageFile.filename}` : null,
          };
        });
  
        const flightConnectionIds = [];
        for (const fcData of parsedFlights) {
          if (!fcData.departureAirportIATA?.trim() || !fcData.arrivalAirportIATA?.trim()) continue;
          
          const flightConnection = new FlightConnection({
            offerId: null, 
            departureAirportIATA: fcData.departureAirportIATA,
            arrivalAirportIATA: fcData.arrivalAirportIATA,
            departureTime: fcData.departureTime,
            arrivalTime: fcData.arrivalTime,
            flightType: fcData.flightType,
          });
          await flightConnection.save();
          flightConnectionIds.push(flightConnection._id);
        }
  
        const initialStatus = 'pending';
  
        const newOffer = new Offer({
          title, description, price: Number(price), duration: Number(duration),
          city, country, latitude: latNum, longitude: lonNum, departureAirportIATA,
          categories: parsedCategories, availableDates: parsedDates, imageUrls,
          mainImageIndex: parsedMainIndex, placesToVisit: placesWithImages,
          flightConnections: flightConnectionIds,
          creator: req.user._id,
          status: initialStatus
        });
  
        await newOffer.save();
  
        for (const fcId of flightConnectionIds) {
          await FlightConnection.findByIdAndUpdate(fcId, { offerId: newOffer._id });
        }
  
        const emailHtml = `
          <h3>New Offer Pending Review</h3>
          <p>Agency <b>${req.user.name} ${req.user.surname}</b> (${req.user.email}) added a new offer.</p>
          <hr/>
          <p><b>Title:</b> ${title}</p>
          <p><b>Price:</b> ${price} PLN</p>
          <p><b>Location:</b> ${city}, ${country}</p>
          <br/>
          <p>Please log in to the admin panel to approve or reject it.</p>
        `;
        sendEmail(ADMIN_EMAIL, `APPROVAL NEEDED: ${title}`, emailHtml).catch(console.error);
  
        const populatedOffer = await Offer.findById(newOffer._id).populate("flightConnections");
        res.status(201).json(populatedOffer);
      } catch (error) {
        console.error("Error creating offer:", error);
        res.status(500).json({ message: error.message });
      }
  }
);

router.put(
  "/:id",
  authManager,
  upload.fields([
    { name: "images", maxCount: 15 },
    { name: "placeImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
        if (req.user.role !== 'agency') {
          return res.status(403).json({ message: "Access denied. Only agencies can edit offers." });
        }
  
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: "Offer not found" });
  
        if (!offer.creator || offer.creator.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: "You can only edit your own offers." });
        }
  
        const {
          title, description, price, duration, city, country,
          latitude: latStr, longitude: lonStr, departureAirportIATA,
          categories, availableDates, placesToVisit, flightConnections, mainImageIndex,
        } = req.body;
  
        const newLat = parseFloat(latStr);
        const newLon = parseFloat(lonStr);
        const updatedCity = city || offer.city;
        const updatedCountry = country || offer.country;
        const updatedLat = isNaN(newLat) ? offer.latitude : newLat;
        const updatedLon = isNaN(newLon) ? offer.longitude : newLon;
  
        if ((!isNaN(newLat) || !isNaN(newLon) || city !== offer.city) && !isNaN(updatedLat)) {
          await fetchAndCacheWeather(updatedCity, updatedCountry, updatedLat, updatedLon);
        }
  
        const parsedCategories = JSON.parse(categories || "[]");
        const parsedDates = JSON.parse(availableDates || "[]").map((date) => new Date(date));
        const parsedPlaces = JSON.parse(placesToVisit || "[]");
        const parsedFlights = JSON.parse(flightConnections || "[]");
  
        const newImageUrls = req.files["images"] ? req.files["images"].map((file) => `/images/${file.filename}`) : [];
        offer.imageUrls = [...offer.imageUrls, ...newImageUrls];
        offer.mainImageIndex = mainImageIndex ? parseInt(mainImageIndex) : offer.mainImageIndex;
  
        if (parsedPlaces && parsedPlaces.length > 0) {
          let newPlaceImages = req.files["placeImages"] || [];
          let newImageIndex = 0;
  
          const updatedPlacesToVisit = parsedPlaces.map((place) => {
            let newImageUrl = place.imageUrl;
            if (place.imageUrl === null && newPlaceImages[newImageIndex]) {
              newImageUrl = `/images/${newPlaceImages[newImageIndex].filename}`;
              newImageIndex++;
            }
            return {
              name: place.name,
              description: place.description,
              address: place.address,
              imageUrl: newImageUrl,
            };
          });
          offer.placesToVisit = updatedPlacesToVisit;
        }
  
        offer.title = title || offer.title;
        offer.description = description || offer.description;
        offer.price = price ? Number(price) : offer.price;
        offer.duration = duration ? Number(duration) : offer.duration;
        offer.city = updatedCity;
        offer.country = updatedCountry;
        offer.latitude = updatedLat;
        offer.longitude = updatedLon;
        offer.departureAirportIATA = departureAirportIATA || offer.departureAirportIATA;
        if (parsedCategories.length > 0) offer.categories = parsedCategories;
        if (parsedDates.length > 0) offer.availableDates = parsedDates;
  
        if (parsedFlights.length > 0) {
          const newFlightIds = [];
          for (const fcData of parsedFlights) {
            if (!fcData.departureAirportIATA?.trim() || !fcData.arrivalAirportIATA?.trim()) continue;
  
            const flightConnection = new FlightConnection({
              offerId: offer._id,
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
            offer.flightConnections = [...offer.flightConnections, ...newFlightIds];
          }
        }
  
        offer.status = 'pending';
        sendEmail(ADMIN_EMAIL, `OFFER UPDATED: ${offer.title}`, `
          <h3>Offer Updated by Agency</h3>
          <p>The offer "<b>${offer.title}</b>" has been modified.</p>
          <p>Status reset to <b>Pending</b>. Please review again.</p>
        `).catch(console.error);
  
        await offer.save();
        const populatedOffer = await Offer.findById(offer._id).populate("flightConnections");
        res.json(populatedOffer);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
  }
);

router.delete("/:id", authManager, async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ message: "Offer not found" });
    
        if (req.user.role === "agency") {
          if (!offer.creator || offer.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own offers." });
          }
        }
    
        await Offer.findByIdAndDelete(req.params.id);
        await FlightConnection.deleteMany({ offerId: req.params.id });
    
        res.json({ message: "Offer deleted" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});


router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid Offer ID" });
  }

  try {
    const offer = await Offer.findById(req.params.id)
      .populate("user", "username")
      .populate("flightConnections");

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const searchKey = `${offer.city.toLowerCase().trim()}_${offer.country.toLowerCase().trim()}_${offer.latitude}_${offer.longitude}`;
    let weatherData = await CityWeather.findOne({ searchKey });

    if (!weatherData && offer.latitude && offer.longitude) {
      weatherData = await fetchAndCacheWeather(
        offer.city,
        offer.country,
        offer.latitude,
        offer.longitude
      );
    }

    res.json({
      offer: offer,
      weather: weatherData ? weatherData.monthlyWeather : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;