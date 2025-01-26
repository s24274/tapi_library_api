const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Imię i nazwisko jest wymagane'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    unique: true,
    trim: true,
    lowercase: true
  },
  membershipDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 