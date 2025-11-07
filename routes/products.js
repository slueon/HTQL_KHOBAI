const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const productsController = require('../controllers/productsController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/products?search=&category=
router.get('/', productsController.getAll);

// GET /api/products/:id
router.get('/:id', productsController.getById);

// POST /api/products
router.post('/', productsController.create);

// PUT /api/products/:id
router.put('/:id', productsController.update);

// DELETE /api/products/:id
router.delete('/:id', productsController.delete);

module.exports = router;

