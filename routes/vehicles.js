const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const vehiclesController = require('../controllers/vehiclesController');

router.use(authenticateToken);

router.get('/', vehiclesController.getAll);
router.get('/:id', vehiclesController.getById);
router.get('/:id/logs', vehiclesController.getLogs);
router.post('/', vehiclesController.create);
router.put('/:id', vehiclesController.update);
router.delete('/:id', vehiclesController.delete);

module.exports = router;

