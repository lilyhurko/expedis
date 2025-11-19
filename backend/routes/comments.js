const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Offer = require("../models/Offer"); 
const User = require("../models/User");
const auth = require("../middleware/auth");


router.post("/:offerId/comments", auth, async (req, res) => {
  try {
    console.log("POST request to Offer Review:", req.params.offerId);
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const offer = await Offer.findById(req.params.offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    const newComment = new Comment({
      message: req.body.message || req.body.comment,
      userId: user._id,
      username: user.username || user.name,
      rating: req.body.rating || 0,

    });

    await newComment.save();
    await newComment.populate("userId", "username avatar");
    offer.comments.push(newComment._id);
    await offer.save();

    console.log("Offer comment saved:", newComment._id);
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error creating offer comment:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get("/:offerId", async (req, res) => {
  
  try {
    const offer = await Offer.findById(req.params.offerId).populate({
      path: "comments",
      populate: { path: "userId", select: "username avatar" },
    });
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    
    res.json(offer.comments || []);
  } catch (err) {
    console.error("Error fetching offer comments:", err.message);
    res.status(500).json({ message: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("userId", "username avatar")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(comments);
  } catch (err) {
    console.error("Error fetching all comments:", err.message);
    res.status(500).json({ message: err.message });
  }
});


router.post("/", auth, async (req, res) => {
  try {
    console.log("POST request to General Feedback");
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newComment = new Comment({
      message: req.body.message || req.body.comment,
      userId: user._id,
      username: user.username || user.name,
      rating: req.body.rating || 0,
    });

    await newComment.save();
    await newComment.populate("userId", "username avatar");

    console.log("General comment saved:", newComment._id);
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error creating general comment:", err.message);
    res.status(500).json({ message: err.message });
  }
});



router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();

 
    await Offer.updateMany(
      { comments: req.params.id },
      { $pull: { comments: req.params.id } }
    );

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.message = req.body.message || req.body.comment;
    if (req.body.rating) comment.rating = req.body.rating;
    
    await comment.save();
    await comment.populate("userId", "username avatar");

    res.json(comment);
  } catch (err) {
    console.error("Error updating comment:", err.message);
    res.status(500).json({ message: "Error updating comment" });
  }
});


router.delete("/:offerId/comments/:commentId", auth, async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found" });
  
      if (comment.userId.toString() !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      await comment.deleteOne();
  
      const offer = await Offer.findById(req.params.offerId);
      if (offer) {
        offer.comments = offer.comments.filter(c => c.toString() !== req.params.commentId);
        await offer.save();
      }
  
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      console.error("Error deleting comment:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;