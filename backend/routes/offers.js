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
  if (file.mimetype.startsWith("image/")) {
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
  if (!city || !country) return null;

  const latNum = parseFloat(latitude);
  const lonNum = parseFloat(longitude);
  if (isNaN(latNum) || isNaN(lonNum)) return null;

  const searchKey = `${city.toLowerCase().trim()}_${country.toLowerCase().trim()}_${latNum}_${lonNum}`;
  
  try {
    let cachedWeather = await CityWeather.findOne({ searchKey });
    if (cachedWeather) return cachedWeather;

    const normalsResponse = await axios.get(
      "https://meteostat.p.rapidapi.com/point/normals",
      {
        params: { lat: latNum, lon: lonNum, units: "metric" },
        headers: { "x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": RAPIDAPI_HOST },
      }
    );

    const recentWeatherData = (normalsResponse.data.data || []).filter(
      (d) => d.start === 1991 && d.end === 2020
    );

    let dataToMap = recentWeatherData.length === 12 ? recentWeatherData : (normalsResponse.data.data || []).slice(-12);

    const weatherData = dataToMap.map((monthData) => ({
      month: monthData.month,
      avg_temp: monthData.tavg,
      avg_min_temp: monthData.tmin,
      precipitation: monthData.prcp,
      sunshine_hours: monthData.tsun ? Math.round(monthData.tsun / 3600) : null,
    }));

    const newCachedWeather = new CityWeather({
      searchKey,
      city,
      country,
      monthlyWeather: weatherData,
    });
    await newCachedWeather.save();
    return newCachedWeather;
  } catch (error) {
    console.error(`Weather fetch failed for ${city}:`, error.message);
    return null;
  }
}

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

router.get("/categories", async (req, res) => {
  try {
    const categories = await Offer.distinct("categories", { status: 'active' });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
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

router.get("/:id", async (req, res) => {
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

router.get("/agency/my-offers", authManager, async (req, res) => {
  try {
    const offers = await Offer.find({ creator: req.user._id })
      .sort({ createdAt: -1 }); 
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
      const imageUrls = req.files["images"] ? req.files["images"].map((file) => `/images/${file.filename}`) : [];
      const parsedMainIndex = mainImageIndex ? parseInt(mainImageIndex) : 0;

      const placesWithImages = parsedPlaces.map((place, index) => {
        const placeImageFile = req.files["placeImages"] ? req.files["placeImages"][index] : null;
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

module.exports = router;