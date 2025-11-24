const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const path = require("path");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret"
    );
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.log(token);
    return res.status(403).json({ message: "Invalid token" });
  }
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/images'); 
  },
  filename(req, file, cb) {
    cb(
      null,
      `avatar-${req.userId}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! (jpg, png, gif)'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/me", authenticate, async (req, res) => {
  const { name, surname, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, surname, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

router.delete("/me", authenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

router.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }


    const avatarUrl = `/images/${req.file.filename}`;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: 'Avatar updated successfully',
      avatar: avatarUrl 
    });

  } catch (err) {
    console.error(err.message);
    if (err.message.includes('Images only')) {
        return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error during avatar upload' });
  }
});

router.get("/wishlist", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("wishlist");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.wishlist);
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ message: "Server error fetching wishlist" });
  }
});

router.post("/wishlist/:offerId", authenticate, async (req, res) => {
  try {
    const { offerId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const index = user.wishlist.indexOf(offerId);

    if (index === -1) {
      user.wishlist.push(offerId);
      await user.save();
      return res.json({ message: "Added to wishlist", wishlist: user.wishlist, isAdded: true });
    } else {
      user.wishlist.pull(offerId);
      await user.save();
      return res.json({ message: "Removed from wishlist", wishlist: user.wishlist, isAdded: false });
    }
  } catch (err) {
    console.error("Error toggling wishlist:", err);
    res.status(500).json({ message: "Server error updating wishlist" });
  }
});

module.exports = router;
