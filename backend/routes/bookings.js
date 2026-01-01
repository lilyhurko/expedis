const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const sendEmail = require("../utils/sendEmail");

const Booking = require("../models/Booking");
const User = require("../models/User");
const Offer = require("../models/Offer");
const mongoose = require("mongoose");

router.get("/admin/pending", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const bookings = await Booking.find({ status: "pending" })
      .populate("user", "name surname email")
      .populate("offer", "title price")
      .populate("agency", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Error fetching pending bookings:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/create", auth, async (req, res) => {
  const { offerId, amount, selectedDate, travelers } = req.body;
  const userId = req.user.id;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (!offerId || !amount || !selectedDate || !travelers) {
    return res
      .status(400)
      .json({ message: "Please provide all booking details" });
  }

  const bookingDate = new Date(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    return res
      .status(400)
      .json({ message: "Cannot book a trip for a past date." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");

    if (user.balance < amount) {
      throw new Error("Insufficient funds");
    }

    const offer = await Offer.findById(offerId)
      .populate("creator")
      .session(session);
    if (!offer) throw new Error("Offer not found");

    user.balance -= amount;
    user.balance_held = (user.balance_held || 0) + amount;
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

    if (ADMIN_EMAIL) {
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Booking Request 📝</h2>
          <p>User <strong>${user.name} ${
        user.surname
      }</strong> requested to book <strong>${offer.title}</strong>.</p>
          <p><strong>Amount held:</strong> ${amount} PLN</p>
          <p><strong>Date:</strong> ${new Date(
            selectedDate
          ).toLocaleDateString()}</p>
          <p>Please review and confirm or reject this booking in your dashboard.</p>
          <a href="http://localhost:3000/admin/dashboard" style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Admin Dashboard</a>
        </div>
      `;
      sendEmail(ADMIN_EMAIL, `New Booking Request: ${offer.title}`, adminHtml)
        .then(() => console.log(`Email sent to Admin: ${ADMIN_EMAIL}`))
        .catch(console.error);
    }

    res.status(201).json({
      message: "Booking requested! Waiting for admin approval.",
      booking: booking,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Booking create error:", error);

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

router.patch("/:id/status", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    console.log(
      `[DEBUG] Update Request for ID: ${bookingId}, New Status: ${status}`
    );

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can change booking status" });
    }

    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("offer")
      .populate("agency")
      .session(session);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === status) {
      await session.abortTransaction();
      return res.status(200).json(booking);
    }

    const user = booking.user;
    const agency = booking.agency;
    const offer = booking.offer;

    if (status === "confirmed") {
      booking.status = "confirmed";

      await booking.save({ session });
      await session.commitTransaction();
      console.log("[DEBUG] Booking Confirmed. DB Updated.");

      if (user && user.email) {
        const clientHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #27ae60;">Booking Confirmed! ✅</h2>
            <p>Your trip to <strong>${
              offer.title
            }</strong> has been confirmed.</p>
            <p><strong>Date:</strong> ${new Date(
              booking.selectedDate
            ).toLocaleDateString()}</p>
            <p>Have a safe trip!</p>
          </div>
        `;
        sendEmail(
          user.email,
          `Booking Confirmed: ${offer.title}`,
          clientHtml
        ).catch(console.error);
      }

      if (agency && agency.email) {
        const agencyHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2c3e50;">New Confirmed Booking! 🎉</h2>
            <p>You have a new confirmed participant for <strong>${
              offer.title
            }</strong>.</p>
            <p><strong>Client:</strong> ${user.name} ${user.surname}</p>
            <p><strong>Date:</strong> ${new Date(
              booking.selectedDate
            ).toLocaleDateString()}</p>
          </div>
        `;
        sendEmail(
          agency.email,
          `New Traveler for: ${offer.title}`,
          agencyHtml
        ).catch(console.error);
      }
    } else if (status === "rejected") {
      booking.status = "rejected";

      console.log("[DEBUG] Rejecting booking. Returning funds...");

      user.balance += booking.amount;
      user.balance_held -= booking.amount;
      if (user.balance_held < 0) user.balance_held = 0;

      await user.save({ session });
      await booking.save({ session });
      await session.commitTransaction();
      console.log("[DEBUG] Funds returned. DB Updated.");

      if (user && user.email) {
        const rejectionHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #e74c3c;">Booking Rejected ❌</h2>
            <p>Unfortunately, your booking for <strong>${offer.title}</strong> was rejected by the administrator.</p>
            <p><strong>${booking.amount} PLN</strong> has been returned to your wallet balance.</p>
          </div>
        `;
        sendEmail(
          user.email,
          `Booking Update: ${offer.title}`,
          rejectionHtml
        ).catch(console.error);
      }
    } else {
      booking.status = status;
      await booking.save({ session });
      await session.commitTransaction();
    }

    res.json(booking);
  } catch (err) {
    await session.abortTransaction();
    console.error("[DEBUG] Status update error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

router.get("/my-bookings", auth, async (req, res) => {
  try {
    const currentDate = new Date();

    const bookingsToComplete = await Booking.find({
      user: req.user.id,
      status: "confirmed",
      selectedDate: { $lt: currentDate },
    })
      .populate("user", "email name")
      .populate("offer", "title")
      .populate("agency", "email");

    if (bookingsToComplete.length > 0) {
      await Booking.updateMany(
        {
          user: req.user.id,
          status: "confirmed",
          selectedDate: { $lt: currentDate },
        },
        { status: "completed" }
      );

      bookingsToComplete.forEach((booking) => {
        if (booking.user && booking.user.email) {
          const completedHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #3498db;">Welcome back! 🌍</h2>
              <p>We hope you enjoyed your trip to <strong>${booking.offer.title}</strong>.</p>
              <p>Please log in to your profile to leave a review and share your experience with others!</p>
              <a href="http://localhost:3000/offer/${booking.offer._id}" style="background: #f1c40f; color: #333; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Leave a Review</a>
            </div>
          `;
          sendEmail(
            booking.user.email,
            `How was your trip to ${booking.offer.title}?`,
            completedHtml
          ).catch((err) =>
            console.error("Failed to send completion email:", err)
          );
        }
      });
    }

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

router.patch("/:id/cancel", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id)
      .populate("offer", "title")
      .populate("agency", "email")
      .session(session);

    const user = await User.findById(req.user.id).session(session);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (["cancelled", "completed", "rejected"].includes(booking.status)) {
      throw new Error("Cannot cancel this booking");
    }

    if (new Date(booking.selectedDate) < new Date()) {
      throw new Error("Cannot cancel past bookings");
    }

    user.balance += booking.amount;
    user.balance_held -= booking.amount;

    if (user.balance_held < 0) user.balance_held = 0;

    booking.status = "cancelled";

    await user.save({ session });
    await booking.save({ session });

    await session.commitTransaction();

    if (user.email) {
      const refundHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #e74c3c;">Booking Cancelled ❌</h2>
          <p>You have successfully cancelled your booking for <strong>${booking.offer.title}</strong>.</p>
          <p><strong>${booking.amount} PLN</strong> has been returned to your wallet balance.</p>
        </div>
      `;
      sendEmail(
        user.email,
        `Booking Cancelled: ${booking.offer.title}`,
        refundHtml
      ).catch((err) => console.error("Client cancel email failed", err));
    }

    if (booking.agency && booking.agency.email) {
      const agencyCancelHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #e74c3c;">Booking Cancelled by User ⚠️</h2>
          <p>The client <strong>${user.name} ${
        user.surname
      }</strong> has cancelled their booking for <strong>${
        booking.offer.title
      }</strong>.</p>
          <p>Date: ${new Date(booking.selectedDate).toLocaleDateString()}</p>
          <p>The booking slot is now free.</p>
        </div>
      `;
      sendEmail(
        booking.agency.email,
        `Cancellation Alert: ${booking.offer.title}`,
        agencyCancelHtml
      ).catch((err) => console.error("Agency cancel email failed", err));
    }

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    await session.abortTransaction();
    console.error("Cancel error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
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
