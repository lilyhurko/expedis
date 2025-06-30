// Model użytkownika z haszowaniem hasła i metodą porównywania haseł

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Tworzenie schematu dla użytkownika
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'  // domyślnie zwykły użytkownik
    }
});

// Haszowanie hasła przed zapisaniem użytkownika
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Metoda porównywania hasła
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
