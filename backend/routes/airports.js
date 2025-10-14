const express = require("express");
const router = express.Router();
const Airport = require("../models/Airport");

router.get("/", async (req, res) => {
  const { city, country } = req.query;

  if (!city && !country) {
    return res.status(400).json({ error: "City or country is required" });
  }

  const query = {};
  if (city) query.city = new RegExp(`^${city}$`, "i");
  if (country) query.country = country;

  try {
    const matchedAirports = await Airport.find(query).limit(50);
    res.json(matchedAirports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;