const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');
const Book = require('../models/Book');

/**
 * @swagger
 * /api/borrowings:
 *   get:
 *     summary: Returns list of borrowings
 *     responses:
 *       200:
 *         description: List of borrowings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _embedded:
 *                   type: object
 *                   properties:
 *                     borrowings:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Borrowing'
 *   post:
 *     summary: Create a new borrowing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookId
 *               - userId
 *             properties:
 *               bookId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Borrowing created
 *       400:
 *         description: Book not available
 */

// GET /api/borrowings
router.get('/', async (req, res) => {
  try {
    const borrowings = await Borrowing.find()
      .populate('book')
      .populate('user');
    
    res.json({
      _embedded: {
        borrowings: borrowings.map(borrowing => ({
          ...borrowing.toJSON(),
          _links: {
            self: { href: `/api/borrowings/${borrowing._id}` },
            book: { href: `/api/books/${borrowing.book._id}` },
            user: { href: `/api/users/${borrowing.user._id}` },
            return: { 
              href: `/api/borrowings/${borrowing._id}/return`,
              method: 'POST'
            }
          }
        }))
      },
      _links: {
        self: { href: '/api/borrowings' }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// POST /api/borrowings
router.post('/', async (req, res) => {
  try {
    const book = await Book.findById(req.body.book);
    if (!book) {
      return res.status(404).json({ error: 'Książka nie została znaleziona' });
    }
    if (book.status !== 'available') {
      return res.status(400).json({ error: 'Książka jest niedostępna' });
    }

    const borrowing = new Borrowing({
      ...req.body,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // +14 dni
    });
    
    await borrowing.save();
    await Book.findByIdAndUpdate(req.body.book, { status: 'borrowed' });

    res.status(201)
      .header('Location', `/api/borrowings/${borrowing._id}`)
      .json({
        ...borrowing.toJSON(),
        _links: {
          self: { href: `/api/borrowings/${borrowing._id}` },
          book: { href: `/api/books/${borrowing.book}` },
          user: { href: `/api/users/${borrowing.user}` }
        }
      });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Błąd walidacji', details: error.message });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router; 