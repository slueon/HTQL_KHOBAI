const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const receiptsController = require('../controllers/receiptsController');

router.use(authenticateToken);

router.get('/', receiptsController.getAll);
router.get('/:id', receiptsController.getById);
router.post('/', receiptsController.create);

module.exports = router;

