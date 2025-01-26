const express = require('express');
const router = express.Router();
const Author = require('../models/Author');

/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Returns list of authors
 *     responses:
 *       200:
 *         description: List of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _embedded:
 *                   type: object
 *                   properties:
 *                     authors:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Author'
 *   post:
 *     summary: Create a new author
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               nationality:
 *                 type: string
 *               birthYear:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Author created
 */

// GET /api/authors
router.get('/', async (req, res) => {
  try {
    const authors = await Author.find();
    res.json({
      _embedded: {
        authors: authors.map(author => ({
          ...author.toJSON(),
          _links: {
            self: { href: `/api/authors/${author._id}` },
            books: { href: `/api/authors/${author._id}/books` }
          }
        }))
      },
      _links: {
        self: { href: '/api/authors' },
        create: { href: '/api/authors', method: 'POST' }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// POST /api/authors
router.post('/', async (req, res) => {
  try {
    const author = new Author(req.body);
    await author.save();
    res.status(201)
      .header('Location', `/api/authors/${author._id}`)
      .json({
        ...author.toJSON(),
        _links: {
          self: { href: `/api/authors/${author._id}` },
          books: { href: `/api/authors/${author._id}/books` }
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