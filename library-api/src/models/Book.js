const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tytuł jest wymagany'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Autor jest wymagany'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN jest wymagany'],
    unique: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'borrowed'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema); 