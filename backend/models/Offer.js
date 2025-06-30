/**
 * Model oferty - definicja struktury danych ofert w systemie
 * Przechowuje informacje o tytule, opisie, cenie, czasie trwania, zdjęciu i dacie utworzenia oferty
 */
const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;