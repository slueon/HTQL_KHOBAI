const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const issuesController = require('../controllers/issuesController');

router.use(authenticateToken);

router.get('/', issuesController.getAll);
router.get('/:id', issuesController.getById);
router.post('/', issuesController.create);

module.exports = router;

