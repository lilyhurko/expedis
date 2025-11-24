const mongoose = require('mongoose');

const chatFeedbackSchema = new mongoose.Schema({
  botMessage: { type: String },
  vote: { type: String, enum: ['up', 'down'], required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatFeedback', chatFeedbackSchema);