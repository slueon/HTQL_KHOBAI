const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const stockController = require('../controllers/stockController');

router.use(authenticateToken);

router.get('/', stockController.getCurrent);
router.get('/history', stockController.getHistory);

module.exports = router;

