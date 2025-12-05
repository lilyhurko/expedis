const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin", "agency", "caragency"], 
    default: "user",
  },
  
  balance: { type: Number, default: 0 },
  balance_held: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
    default: "",
  },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Offer" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;