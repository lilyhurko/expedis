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

const RAPIDAPI_KEY = "463251c1a9msh9e573ca6257b1afp1576adjsn6ed05f3609c2";
const RAPIDAPI_HOST = "meteostat.p.rapidapi.com";

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
  if (!city || !country) {
    console.warn("[Weather] Skipping weather fetch: missing city/country");
    return null;
  }

  const latNum = parseFloat(latitude);
  const lonNum = parseFloat(longitude);
  if (isNaN(latNum) || isNaN(lonNum)) {
    console.warn(
      `[Weather] Skipping weather fetch: invalid lat/lon (${latitude}, ${longitude})`
    );
    return null;
  }

  const searchKey = `${city.toLowerCase().trim()}_${country
    .toLowerCase()
    .trim()}_${latNum}_${lonNum}`;
  try {
    let cachedWeather = await CityWeather.findOne({ searchKey });

    if (cachedWeather) {
      console.log(`[Weather] Weather found in cache for: ${city}`);
      return cachedWeather;
    }

    console.log(
      `[Weather] Fetching new weather data for: ${city} (using /point/normals) with lat: ${latNum}, lon: ${lonNum}`
    );

    const normalsResponse = await axios.get(
      "https://meteostat.p.rapidapi.com/point/normals",
      {
        params: {
          lat: latNum,
          lon: lonNum,
          units: "metric",
        },
        headers: {
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      }
    );

    if (
      !normalsResponse.data ||
      !normalsResponse.data.data ||
      normalsResponse.data.data.length === 0
    ) {
      console.warn(
        `[Weather] No weather data array returned from API for ${city}. API response was:`,
        JSON.stringify(normalsResponse.data)
      );
    }

    const recentWeatherData = (normalsResponse.data.data || []).filter(
      (d) => d.start === 1991 && d.end === 2020
    );

    let dataToMap = [];
    if (recentWeatherData.length === 12) {
      console.log(`[Weather] Using recent period (1991-2020) for ${city}.`);
      dataToMap = recentWeatherData;
    } else {
      console.warn(
        `[Weather] Could not find 12 months for 1991-2020. Using last 12 entries available.`
      );
      dataToMap = (normalsResponse.data.data || []).slice(-12);
    }

    const weatherData = dataToMap.map((monthData) => ({
      month: monthData.month,
      avg_temp: monthData.tavg,
      avg_min_temp: monthData.tmin,
      precipitation: monthData.prcp,
      sunshine_hours: monthData.tsun ? Math.round(monthData.tsun / 3600) : null,
    }));

    if (weatherData.length > 0) {
      console.log(
        `[Weather] Successfully mapped ${weatherData.length} months of data for ${city}.`
      );
    } else {
      console.warn(
        `[Weather] Mapped 0 months of data for ${city}. Caching empty array.`
      );
    }

    const newCachedWeather = new CityWeather({
      searchKey: searchKey,
      city: city,
      country: country,
      monthlyWeather: weatherData,
    });
    await newCachedWeather.save();
    console.log(`[Weather] Successfully cached weather for ${city}.`);

    return newCachedWeather;
  } catch (error) {
    console.error(`!!!!!!!!!! FAILED TO FETCH WEATHER FOR ${city} !!!!!!!!!!`);
    if (error.response) {
      console.error(
        "Error Data:",
        JSON.stringify(error.response.data, null, 2)
      );
      console.error("Error Status:", error.response.status);
      console.error(
        "Error Headers:",
        JSON.stringify(error.response.headers, null, 2)
      );
    } else if (error.request) {
      console.error("Error Request:", error.request);
    } else {
      console.error("Error Message:", error.message);
    }

    return null;
  }
}

router.get("/", async (req, res) => {
  try {
    const {
      destination,
      maxPrice,
      duration,
      category,
      startDate,
      endDate,
    } = req.query;
    let filter = {};

    if (destination) {
      const destinations = Array.isArray(destination)
        ? destination
        : [destination];
      const destinationRegex = destinations.map((d) => new RegExp(d, "i"));

      filter["$or"] = [
        { city: { $in: destinationRegex } },
        { country: { $in: destinationRegex } },
      ];
    }

    if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    if (duration) {
      filter.duration = Number(duration);
    }

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
    const categories = await Offer.distinct("categories");
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/suggestions", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const regex = new RegExp(q, "i");
    const citySuggestions = await Offer.distinct("city", { city: regex });
    const countrySuggestions = await Offer.distinct("country", {
      country: regex,
    });
    const suggestions = [
      ...new Set([...citySuggestions, ...countrySuggestions]),
    ];

    res.json(suggestions.slice(0, 10));
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/alldestinations", async (req, res) => {
  try {
    const destinations = await Offer.aggregate([
      {
        $group: {
          _id: "$country",
          cities: { $addToSet: "$city" },
        },
      },
      {
        $unwind: "$cities",
      },
      {
        $sort: { cities: 1 },
      },
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
      {
        $sort: { country: 1 },
      },
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

    const searchKey = `${offer.city.toLowerCase().trim()}_${offer.country
      .toLowerCase()
      .trim()}_${offer.latitude}_${offer.longitude}`;

    console.log(
      `[GET /:id] Looking for weather in cache with key: ${searchKey}`
    );

    let weatherData = await CityWeather.findOne({ searchKey });

    if (!weatherData && offer.latitude && offer.longitude) {
      console.log(
        `[GET /:id] Weather not in cache for ${offer.city}. Fetching...`
      );
      weatherData = await fetchAndCacheWeather(
        offer.city,
        offer.country,
        offer.latitude,
        offer.longitude
      );
    } else if (weatherData) {
      console.log(`[GET /:id] Found weather in cache for ${offer.city}.`);
    } else {
      console.warn(
        `[GET /:id] Could not fetch weather for ${offer.city} (no lat/lon or fetch failed).`
      );
    }

    res.json({
      offer: offer,
      weather: weatherData ? weatherData.monthlyWeather : null,
    });
  } catch (error) {
    console.error(`[GET /:id] Error fetching offer ${req.params.id}:`, error);
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 15 },
    { name: "placeImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        duration,
        city,
        country,
        latitude: latStr,
        longitude: lonStr,
        departureAirportIATA,
        categories,
        availableDates,
        placesToVisit,
        flightConnections,
        mainImageIndex,
      } = req.body;

      const latNum = parseFloat(latStr);
      const lonNum = parseFloat(lonStr);

      console.log(
        `[POST /] Creating offer for ${city} with flights:`,
        flightConnections
      );

      if (
        !title ||
        !description ||
        !price ||
        !city ||
        !country ||
        !departureAirportIATA ||
        isNaN(latNum) ||
        isNaN(lonNum)
      ) {
        console.warn("[POST /] Validation failed. Missing required fields.");
        return res.status(400).json({
          error:
            "Missing or invalid required fields (including latitude/longitude as valid numbers)",
        });
      }

      console.log(`[POST /] Triggering weather fetch for ${city}...`);
      await fetchAndCacheWeather(city, country, latNum, lonNum);

      const parsedCategories = JSON.parse(categories || "[]");
      const parsedDates = JSON.parse(availableDates || "[]").map(
        (date) => new Date(date)
      );
      const parsedPlaces = JSON.parse(placesToVisit || "[]");
      const parsedFlights = JSON.parse(flightConnections || "[]");

      const imageUrls = req.files["images"]
        ? req.files["images"].map((file) => `/images/${file.filename}`)
        : [];
      const parsedMainIndex = mainImageIndex ? parseInt(mainImageIndex) : 0;

      const placesWithImages = parsedPlaces.map((place, index) => {
        const placeImageFile = req.files["placeImages"]
          ? req.files["placeImages"][index]
          : null;
        return {
          name: place.name,
          description: place.description,
          address: place.address, 
          imageUrl: placeImageFile
            ? `/images/${placeImageFile.filename}`
            : null,
        };
      });

      const flightConnectionIds = [];
      for (const fcData of parsedFlights) {
        if (
          !fcData.departureAirportIATA?.trim() ||
          !fcData.arrivalAirportIATA?.trim() ||
          !fcData.departureTime?.trim() ||
          !fcData.arrivalTime?.trim() ||
          !fcData.flightType?.trim()
        ) {
          console.log("[POST /] Skipping invalid flight connection:", fcData);
          continue;
        }

        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(fcData.departureTime)) {
          console.warn(
            "[POST /] Invalid departureTime format, skipping:",
            fcData.departureTime
          );
          continue;
        }

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
      console.log(
        `[POST /] Saved ${flightConnectionIds.length} flight connections.`
      );

      const newOffer = new Offer({
        title,
        description,
        price: Number(price),
        duration: Number(duration),
        city,
        country,
        latitude: latNum,
        longitude: lonNum,
        departureAirportIATA,
        categories: parsedCategories,
        availableDates: parsedDates,
        imageUrls,
        mainImageIndex: parsedMainIndex,
        placesToVisit: placesWithImages,
        flightConnections: flightConnectionIds,
      });

      await newOffer.save();
      console.log(
        `[POST /] Successfully saved new offer with ID: ${newOffer._id}`
      );

      for (const fcId of flightConnectionIds) {
        await FlightConnection.findByIdAndUpdate(fcId, {
          offerId: newOffer._id,
        });
      }
      console.log(
        `[POST /] Updated flight connections with offer ID ${newOffer._id}`
      );

      const populatedOffer = await Offer.findById(newOffer._id).populate(
        "flightConnections"
      );
      res.status(201).json(populatedOffer);
    } catch (error) {
      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          console.error("[POST /] Multer error: File too large", error);
          return res
            .status(400)
            .json({ message: "File is too large. Maximum size is 10MB." });
        }
      }

      console.error("[POST /] Error adding offer:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.put(
  "/:id",
  upload.fields([
    { name: "images", maxCount: 15 },
    { name: "placeImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const offer = await Offer.findById(req.params.id);
      if (!offer) return res.status(404).json({ message: "Offer not found" });

      console.log(`[PUT /:id] Updating offer ${req.params.id}`);

      const {
        title,
        description,
        price,
        duration,
        city,
        country,
        latitude: latStr,
        longitude: lonStr,
        departureAirportIATA,
        categories,
        availableDates,
        placesToVisit,
        flightConnections,
        mainImageIndex,
      } = req.body;

      const newLat = parseFloat(latStr);
      const newLon = parseFloat(lonStr);
      const updatedCity = city || offer.city;
      const updatedCountry = country || offer.country;
      const updatedLat = isNaN(newLat) ? offer.latitude : newLat;
      const updatedLon = isNaN(newLon) ? offer.longitude : newLon;

      const coordsChanged =
        !isNaN(newLat) ||
        !isNaN(newLon) ||
        city !== offer.city ||
        country !== offer.country;
      if (coordsChanged && !isNaN(updatedLat) && !isNaN(updatedLon)) {
        console.log(
          `[PUT /:id] Coords changed for ${updatedCity}. Refetching weather...`
        );
        await fetchAndCacheWeather(
          updatedCity,
          updatedCountry,
          updatedLat,
          updatedLon
        );
      }

      const parsedCategories = JSON.parse(categories || "[]");
      const parsedDates = JSON.parse(availableDates || "[]").map(
        (date) => new Date(date)
      );
      const parsedPlaces = JSON.parse(placesToVisit || "[]");
      const parsedFlights = JSON.parse(flightConnections || "[]");

      const newImageUrls = req.files["images"]
        ? req.files["images"].map((file) => `/images/${file.filename}`)
        : [];
      offer.imageUrls = [...offer.imageUrls, ...newImageUrls];
      offer.mainImageIndex = mainImageIndex
        ? parseInt(mainImageIndex)
        : offer.mainImageIndex;

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
            imageUrl: newImageUrl
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
      offer.departureAirportIATA =
        departureAirportIATA || offer.departureAirportIATA;
      offer.categories =
        parsedCategories.length > 0 ? parsedCategories : offer.categories;
      offer.availableDates =
        parsedDates.length > 0 ? parsedDates : offer.availableDates;

      if (parsedFlights.length > 0) {
        const newFlightIds = [];
        for (const fcData of parsedFlights) {
          if (
            !fcData.departureAirportIATA?.trim() ||
            !fcData.arrivalAirportIATA?.trim() ||
            !fcData.departureTime?.trim() ||
            !fcData.arrivalTime?.trim() ||
            !fcData.flightType?.trim()
          ) {
            console.log(
              "[PUT /:id] Skipping invalid flight connection in update:",
              fcData
            );
            continue;
          }

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
          console.log(
            `[PUT /:id] Adding ${newFlightIds.length} new flight connections.`
          );
          offer.flightConnections = [
            ...offer.flightConnections,
            ...newFlightIds,
          ];
        }
      }

      await offer.save();
      console.log(`[PUT /:id] Successfully updated offer ${offer._id}`);

      const populatedOffer = await Offer.findById(offer._id).populate(
        "flightConnections"
      );
      res.json(populatedOffer);
    } catch (error) {
      console.error(`[PUT /:id] Error updating offer ${req.params.id}:`, error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    console.log(`[DELETE /:id] Deleting offer ${req.params.id}`);
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      console.warn(`[DELETE /:id] Offer not found: ${req.params.id}`);
      return res.status(404).json({ message: "Offer not found" });
    }
    await FlightConnection.deleteMany({ offerId: req.params.id });
    console.log(
      `[DELETE /:id] Successfully deleted offer ${req.params.id} and associated flights.`
    );
    res.json({ message: "Offer deleted" });
  } catch (error) {
    console.error(
      `[DELETE /:id] Error deleting offer ${req.params.id}:`,
      error
    );
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;