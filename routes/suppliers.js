const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const suppliersController = require('../controllers/suppliersController');

router.use(authenticateToken);

router.get('/', suppliersController.getAll);
router.get('/:id', suppliersController.getById);
router.post('/', suppliersController.create);
router.put('/:id', suppliersController.update);
router.delete('/:id', suppliersController.delete);

module.exports = router;

