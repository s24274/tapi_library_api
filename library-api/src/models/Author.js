const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Imię i nazwisko jest wymagane'],
    trim: true
  },
  biography: {
    type: String,
    trim: true
  },
  birthYear: {
    type: Number
  },
  nationality: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Author', authorSchema); 