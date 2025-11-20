const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

const Booking = require("../models/Booking");
const User = require("../models/User");
const Offer = require("../models/Offer");
const mongoose = require("mongoose");

router.post("/create", auth, async (req, res) => {
  const { offerId, amount, selectedDate, travelers } = req.body;
  const userId = req.user.id;

  if (!offerId || !amount || !selectedDate || !travelers) {
    return res
      .status(400)
      .json({ message: "Please provide all booking details" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");

    if (user.balance < amount) {
      return res
        .status(402)
        .json({ message: "Insufficient funds. Please top up your wallet." });
    }

    const offer = await Offer.findById(offerId)
      .populate("creator")
      .session(session);
    if (!offer) throw new Error("Offer not found");

    user.balance -= amount;
    user.balance_held += amount;
    await user.save({ session });

    const booking = new Booking({
      user: userId,
      offer: offerId,
      agency: offer.creator._id,
      amount: amount,
      selectedDate: new Date(selectedDate),
      travelers: travelers,
      status: "pending",
    });
    await booking.save({ session });

    await session.commitTransaction();

    if (offer.creator && offer.creator.email) {
      const agencyHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #2c3e50; text-align: center;">New Booking! 🎉</h2>
            <p style="font-size: 16px; color: #555;">You received a new booking for your tour <strong>${offer.title}</strong>.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
            
            <p><strong>Client:</strong> ${user.name} ${user.surname}</p>
            <p><strong>Email:</strong> <a href="mailto:${user.email}" style="color: #3498db;">${user.email}</a></p>
            <p><strong>Amount:</strong> ${amount} PLN</p>
            <p><strong>Date:</strong> ${new Date(selectedDate).toLocaleDateString()}</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000/my-bookings" style="background-color: #3498db; color: white; padding: 14px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
                Open Dashboard
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
              Expedis Travel Platform
            </p>
          </div>
        </div>
      `;
      sendEmail(
        offer.creator.email,
        `New Booking: ${offer.title}`,
        agencyHtml
      ).catch(console.error);
    }
    
    const userHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #27ae60;">Booking Received! ✅</h2>
        <p>You successfully booked the tour <strong>${offer.title}</strong>.</p>
        <p>The amount <strong>${amount} PLN</strong> has been temporarily held in your wallet.</p>
        <p>Please wait for the organizer's confirmation.</p>

      </div>
    `;
    sendEmail(user.email, `Successful booking:: ${offer.title}`, userHtml).catch(
      console.error
    );

    res.status(201).json({
      message: "Booking request sent! Awaiting confirmation.",
      booking: booking,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(error.message);
    if (error.message.includes("Insufficient funds")) {
      return res
        .status(402)
        .json({ message: "Insufficient funds. Please top up your wallet." });
    }
    res.status(500).json({ message: error.message || "Server Error" });
  } finally {
    session.endSession();
  }
});

router.get("/my-bookings", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("offer", "title city country imageUrls")
      .populate("agency", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/agency-orders", auth, async (req, res) => {
  try {
    if (req.user.role !== "agency" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Booking.find({ agency: req.user.id })
      .populate("user", "name surname email avatar")
      .populate("offer", "title price duration")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
