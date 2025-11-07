const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const locationsController = require('../controllers/locationsController');

router.use(authenticateToken);

router.get('/', locationsController.getAll);
router.get('/:id', locationsController.getById);
router.post('/', locationsController.create);
router.put('/:id', locationsController.update);
router.delete('/:id', locationsController.delete);

module.exports = router;

