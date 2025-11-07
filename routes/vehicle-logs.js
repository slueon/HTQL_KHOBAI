const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const vehicleLogsController = require('../controllers/vehicleLogsController');

router.use(authenticateToken);

router.get('/', vehicleLogsController.getAll);
router.get('/alerts/parked', vehicleLogsController.getParkedAlerts);
router.get('/stats/report', vehicleLogsController.getStatsReport);
router.get('/:id', vehicleLogsController.getById);
router.post('/', vehicleLogsController.create);

module.exports = router;

