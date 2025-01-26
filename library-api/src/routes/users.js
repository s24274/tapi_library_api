const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns list of users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _embedded:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      _embedded: {
        users: users.map(user => ({
          ...user.toJSON(),
          _links: {
            self: { href: `/api/users/${user._id}` },
            borrowings: { href: `/api/users/${user._id}/borrowings` }
          }
        }))
      },
      _links: {
        self: { href: '/api/users' },
        create: { href: '/api/users', method: 'POST' }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201)
      .header('Location', `/api/users/${user._id}`)
      .json({
        ...user.toJSON(),
        _links: {
          self: { href: `/api/users/${user._id}` },
          borrowings: { href: `/api/users/${user._id}/borrowings` }
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