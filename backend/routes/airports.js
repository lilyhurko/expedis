const express = require("express");
const router = express.Router();
const Airport = require("../models/Airport");

router.get("/", async (req, res) => {
  const { city, country, iata } = req.query; 

  if (!city && !country && !iata) { 
    return res.status(400).json({ error: "City, country or iata is required" });
  }

  const query = {};
  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }
  if (country) {
    query.country = country;
  }
  if (iata) { 
    query.iata = iata.toUpperCase();
  }

  try {
    const matchedAirports = await Airport.find(query).limit(50).sort({ name: 1 });
    console.log(`Found airports for query: ${JSON.stringify(req.query)}: ${matchedAirports.length}`);
    res.json(matchedAirports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;