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
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'BLOCKED'],
    default: 'ACTIVE'
  },
  membershipDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 