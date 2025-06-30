/**
 * Model komentarzy - definicja struktury danych komentarzy w systemie
 * Przechowuje informacje o użytkowniku, treści komentarza i dacie utworzenia
 */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;