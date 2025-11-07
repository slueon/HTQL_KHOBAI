const { dataStore, generateId } = require('../models/dataStore');

const vehiclesController = {
  getAll: (req, res) => {
    try {
      res.json({
        success: true,
        data: dataStore.vehicles
      });
    } catch (error) {
      console.error('Error getting vehicles:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách xe'
      });
    }
  },

  getById: (req, res) => {
    try {
      const vehicle = dataStore.vehicles.find(v => v.id === parseInt(req.params.id));

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy xe'
        });
      }

      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      console.error('Error getting vehicle:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin xe'
      });
    }
  },

  getLogs: (req, res) => {
    try {
      const { id } = req.params;
      const { filter, date } = req.query;

      let logs = dataStore.vehicleLogs.filter(log => log.vehicleId === parseInt(id));

      if (filter === 'in') {
        logs = logs.filter(log => log.type === 'in' && !log.exitLogId);
      } else if (filter === 'out') {
        logs = logs.filter(log => log.type === 'out');
      } else if (filter === 'parked') {
        logs = logs.filter(log => log.type === 'in' && !log.exitLogId);
      }

      if (date) {
        logs = logs.filter(log => log.datetime.startsWith(date));
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
        message: 'Lỗi khi lấy nhật ký xe'
      });
    }
  },

  create: (req, res) => {
    try {
      const { plate, type, driver, driverPhone, owner, note } = req.body;

      if (!plate || !type || !driver || !owner) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
        });
      }

      // Check if plate already exists
      const existing = dataStore.vehicles.find(v => v.plate.toUpperCase() === plate.toUpperCase());
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Biển số đã tồn tại'
        });
      }

      const newVehicle = {
        id: generateId('vehicles'),
        plate: plate.toUpperCase(),
        type,
        driver,
        driverPhone: driverPhone || '',
        owner,
        note: note || '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dataStore.vehicles.push(newVehicle);

      res.status(201).json({
        success: true,
        message: 'Tạo xe thành công',
        data: newVehicle
      });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo xe'
      });
    }
  },

  update: (req, res) => {
    try {
      const { id } = req.params;
      const { plate, type, driver, driverPhone, owner, note, status } = req.body;

      const vehicleIndex = dataStore.vehicles.findIndex(v => v.id === parseInt(id));

      if (vehicleIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy xe'
        });
      }

      if (plate && plate.toUpperCase() !== dataStore.vehicles[vehicleIndex].plate) {
        const existing = dataStore.vehicles.find(
          v => v.plate.toUpperCase() === plate.toUpperCase() && v.id !== parseInt(id)
        );
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Biển số đã tồn tại'
          });
        }
      }

      dataStore.vehicles[vehicleIndex] = {
        ...dataStore.vehicles[vehicleIndex],
        ...(plate && { plate: plate.toUpperCase() }),
        ...(type && { type }),
        ...(driver && { driver }),
        ...(driverPhone !== undefined && { driverPhone }),
        ...(owner && { owner }),
        ...(note !== undefined && { note }),
        ...(status && { status }),
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Cập nhật xe thành công',
        data: dataStore.vehicles[vehicleIndex]
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật xe'
      });
    }
  },

  delete: (req, res) => {
    try {
      const { id } = req.params;
      const vehicleIndex = dataStore.vehicles.findIndex(v => v.id === parseInt(id));

      if (vehicleIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy xe'
        });
      }

      // Check if vehicle has logs
      const hasLogs = dataStore.vehicleLogs.some(log => log.vehicleId === parseInt(id));
      if (hasLogs) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa xe đã có nhật ký'
        });
      }

      dataStore.vehicles.splice(vehicleIndex, 1);

      res.json({
        success: true,
        message: 'Xóa xe thành công'
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa xe'
      });
    }
  }
};

module.exports = vehiclesController;

