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
    enum: ['AVAILABLE', 'BORROWED', 'LOST', 'MAINTENANCE'],
    default: 'AVAILABLE'
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

module.exports = mongoose.model('Book', bookSchema); 