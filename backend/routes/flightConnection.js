const express = require("express");
const router = express.Router();
const FlightConnection = require("../models/FlightConnection");

router.post("/", async (req, res) => {
  try {
    const { offerId, departureAirportIATA, arrivalAirportIATA, departureTime } = req.body;

    if (!offerId || !departureAirportIATA || !arrivalAirportIATA || !departureTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(departureTime)) {
      return res.status(400).json({ error: "Invalid departureTime format (HH:mm)" });
    }

    const flight = new FlightConnection({
      offerId,
      departureAirportIATA,
      arrivalAirportIATA,
      departureTime,
    });

    await flight.save();
    res.status(201).json(flight);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to save connection" });
  }
});

router.get("/", async (req, res) => {
  try {
    const flights = await FlightConnection.find().populate("offerId");
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;