const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Book');

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       required:
 *         - title
 *         - author
 *         - isbn
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         title:
 *           type: string
 *           description: Book title
 *         author:
 *           type: string
 *           description: Book author
 *         isbn:
 *           type: string
 *           description: ISBN number
 *         status:
 *           type: string
 *           enum: [available, borrowed]
 *           description: Book status
 *     Author:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Author's name
 *         nationality:
 *           type: string
 *           description: Author's nationality
 *         birthYear:
 *           type: integer
 *           description: Author's birth year
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email
 *         membershipDate:
 *           type: string
 *           format: date-time
 *           description: Date when user joined
 *         status:
 *           type: string
 *           enum: [active, suspended]
 *           description: User's status
 *     Borrowing:
 *       type: object
 *       required:
 *         - bookId
 *         - userId
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID
 *         bookId:
 *           type: string
 *           description: Reference to borrowed book
 *         userId:
 *           type: string
 *           description: Reference to user who borrowed
 *         borrowDate:
 *           type: string
 *           format: date-time
 *           description: When the book was borrowed
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: When the book should be returned
 *         returnDate:
 *           type: string
 *           format: date-time
 *           description: When the book was actually returned
 *         status:
 *           type: string
 *           enum: [active, returned, overdue]
 *           description: Status of borrowing
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Returns list of books
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Filter by title
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _embedded:
 *                   type: object
 *                   properties:
 *                     books:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 */
router.get('/', async (req, res) => {
  try {
    // Filtrowanie
    const filter = {};
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: 'i' }; // case-insensitive
    }
    if (req.query.author) {
      filter.author = { $regex: req.query.author, $options: 'i' };
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sort
    const sort = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    // Get total number of books
    const total = await Book.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get books
    const books = await Book.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // pagation prepare
    const paginationLinks = {
      self: { href: `/api/books?page=${page}&limit=${limit}` }
    };
    if (page > 1) {
      paginationLinks.prev = { href: `/api/books?page=${page-1}&limit=${limit}` };
    }
    if (page < totalPages) {
      paginationLinks.next = { href: `/api/books?page=${page+1}&limit=${limit}` };
    }
    paginationLinks.first = { href: `/api/books?page=1&limit=${limit}` };
    paginationLinks.last = { href: `/api/books?page=${totalPages}&limit=${limit}` };

    res.json({
      _embedded: {
        books: books.map(book => ({
          ...book.toJSON(),
          _links: {
            self: { href: `/api/books/${book._id}` },
            borrow: { href: `/api/books/${book._id}/borrow`, method: 'POST' },
            return: { href: `/api/books/${book._id}/return`, method: 'POST' }
          }
        }))
      },
      _links: {
        ...paginationLinks,
        create: { href: '/api/books', method: 'POST' }
      },
      page: {
        size: limit,
        totalElements: total,
        totalPages: totalPages,
        number: page
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Błąd serwera',
      message: error.message
    });
  }
});

// // GET /api/books - Lista wszystkich książek
// router.get('/', async (req, res) => {
//   try {
//     const books = await Book.find();
//     res.json({
//       _embedded: {
//         books: books.map(book => ({
//           ...book.toJSON(),
//           _links: {
//             self: { href: `/api/books/${book._id}` },
//             borrow: { href: `/api/books/${book._id}/borrow`, method: 'POST' },
//             return: { href: `/api/books/${book._id}/return`, method: 'POST' }
//           }
//         }))
//       },
//       _links: {
//         self: { href: '/api/books' },
//         create: { href: '/api/books', method: 'POST' }
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Błąd serwera' });
//   }
// });

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        error: 'Książka nie została znaleziona',
        _links: { books: { href: '/api/books' } }
      });
    }
    res.json({
      ...book.toJSON(),
      _links: {
        self: { href: `/api/books/${book._id}` },
        collection: { href: '/api/books' },
        borrow: { href: `/api/books/${book._id}/borrow`, method: 'POST' },
        return: { href: `/api/books/${book._id}/return`, method: 'POST' }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - isbn
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book created
 *       400:
 *         description: Invalid input
 */
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201)
      .header('Location', `/api/books/${book._id}`)
      .json({
        ...book.toJSON(),
        _links: {
          self: { href: `/api/books/${book._id}` },
          collection: { href: '/api/books' }
        }
      });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Błąd walidacji',
        details: error.message
      });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book updated
 *       404:
 *         description: Book not found
 *       400:
 *         description: Invalid input
 */
router.put('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!book) {
      return res.status(404).json({
        error: 'Książka nie została znaleziona',
        _links: { books: { href: '/api/books' } }
      });
    }
    res.json({
      ...book.toJSON(),
      _links: {
        self: { href: `/api/books/${book._id}` },
        collection: { href: '/api/books' }
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Błąd walidacji',
        details: error.message
      });
    }
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Book deleted
 *       404:
 *         description: Book not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({
        error: 'Książka nie została znaleziona',
        _links: { books: { href: '/api/books' } }
      });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

module.exports = router; 