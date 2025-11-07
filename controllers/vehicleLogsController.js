const { dataStore, generateId } = require('../models/dataStore');

const vehicleLogsController = {
  // GET /api/vehicle-logs?filter=&date=&vehicleId=
  getAll: (req, res) => {
    try {
      let logs = [...dataStore.vehicleLogs];

      // Filter by vehicleId
      if (req.query.vehicleId) {
        logs = logs.filter(log => log.vehicleId === parseInt(req.query.vehicleId));
      }

      // Filter by type
      if (req.query.filter === 'in') {
        logs = logs.filter(log => log.type === 'in' && !log.exitLogId);
      } else if (req.query.filter === 'out') {
        logs = logs.filter(log => log.type === 'out');
      } else if (req.query.filter === 'parked') {
        logs = logs.filter(log => log.type === 'in' && !log.exitLogId);
      }

      // Filter by date
      if (req.query.date) {
        logs = logs.filter(log => log.datetime.startsWith(req.query.date));
      }

      logs.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('Error getting vehicle logs:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách nhật ký xe'
      });
    }
  },

  getById: (req, res) => {
    try {
      const log = dataStore.vehicleLogs.find(l => l.id === parseInt(req.params.id));

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhật ký'
        });
      }

      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      console.error('Error getting vehicle log:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin nhật ký'
      });
    }
  },

  create: (req, res) => {
    try {
      const { vehicleId, type, datetime, purpose, guard, note } = req.body;

      if (!vehicleId || !type || !datetime || !purpose || !guard) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
        });
      }

      // Validate vehicle exists
      const vehicle = dataStore.vehicles.find(v => v.id === parseInt(vehicleId));
      if (!vehicle) {
        return res.status(400).json({
          success: false,
          message: 'Xe không tồn tại'
        });
      }

      // Validate type
      if (type !== 'in' && type !== 'out') {
        return res.status(400).json({
          success: false,
          message: 'Loại giao dịch không hợp lệ'
        });
      }

      // For "out" type, check if there's a pending "in" log
      if (type === 'out') {
        const lastEntry = dataStore.vehicleLogs
          .filter(log => log.vehicleId === parseInt(vehicleId) && log.type === 'in' && !log.exitLogId)
          .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];

        if (!lastEntry) {
          return res.status(400).json({
            success: false,
            message: 'Xe này chưa có lượt vào. Vui lòng ghi nhận lượt vào trước.'
          });
        }
      }

      const newLog = {
        id: generateId('vehicleLogs'),
        vehicleId: parseInt(vehicleId),
        vehiclePlate: vehicle.plate,
        vehicleDriver: vehicle.driver,
        type,
        datetime,
        purpose,
        guard,
        note: note || '',
        exitLogId: null,
        createdAt: new Date().toISOString(),
        createdBy: req.user.userId
      };

      dataStore.vehicleLogs.push(newLog);

      // If this is an exit, link it to the last entry
      if (type === 'out') {
        const lastEntry = dataStore.vehicleLogs
          .filter(log => log.vehicleId === parseInt(vehicleId) && log.type === 'in' && !log.exitLogId)
          .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))[0];

        if (lastEntry && lastEntry.id !== newLog.id) {
          lastEntry.exitLogId = newLog.id;
        }
      }

      res.status(201).json({
        success: true,
        message: 'Ghi nhận thành công',
        data: newLog
      });
    } catch (error) {
      console.error('Error creating vehicle log:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi ghi nhận nhật ký'
      });
    }
  },

  // GET /api/vehicle-logs/alerts/parked?hours=
  getParkedAlerts: (req, res) => {
    try {
      const hours = parseInt(req.query.hours) || 8;
      const now = new Date();
      const alertTime = hours * 60 * 60 * 1000; // Convert to milliseconds

      const parkedLogs = dataStore.vehicleLogs.filter(
        log => log.type === 'in' && !log.exitLogId
      );

      const alerts = parkedLogs.filter(log => {
        const entryTime = new Date(log.datetime);
        const timeIn = now - entryTime;
        return timeIn >= alertTime;
      }).map(log => {
        const entryTime = new Date(log.datetime);
        const hoursIn = Math.floor((now - entryTime) / (60 * 60 * 1000));
        return {
          ...log,
          hoursIn
        };
      });

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      console.error('Error getting parked alerts:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy cảnh báo'
      });
    }
  },

  // GET /api/vehicle-logs/stats/report?dateFrom=&dateTo=
  getStatsReport: (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;

      let logs = [...dataStore.vehicleLogs];

      // Filter by date range
      if (dateFrom) {
        logs = logs.filter(log => log.datetime >= dateFrom);
      }
      if (dateTo) {
        logs = logs.filter(log => log.datetime <= dateTo);
      }

      // Group by date
      const dateMap = {};
      logs.forEach(log => {
        const date = log.datetime.split('T')[0];
        if (!dateMap[date]) {
          dateMap[date] = {
            date,
            inCount: 0,
            outCount: 0,
            parkedCount: 0
          };
        }

        if (log.type === 'in') {
          dateMap[date].inCount++;
          if (!log.exitLogId) {
            dateMap[date].parkedCount++;
          }
        } else {
          dateMap[date].outCount++;
        }
      });

      const reportData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

      // Calculate totals
      const totalIn = logs.filter(log => log.type === 'in').length;
      const totalOut = logs.filter(log => log.type === 'out').length;
      const totalParked = logs.filter(log => log.type === 'in' && !log.exitLogId).length;

      res.json({
        success: true,
        data: {
          summary: {
            totalIn,
            totalOut,
            totalParked
          },
          daily: reportData
        }
      });
    } catch (error) {
      console.error('Error getting stats report:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy báo cáo'
      });
    }
  }
};

module.exports = vehicleLogsController;

