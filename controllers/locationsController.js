const locationsModel = require('../models/locationsModel');

const locationsController = {
  getAll: async (req, res) => {
    try {
      const locations = await locationsModel.getAll();
      res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      console.error('Error getting locations:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách vị trí kho'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const location = await locationsModel.getById(parseInt(req.params.id));

      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy vị trí kho'
        });
      }

      res.json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('Error getting location:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin vị trí kho'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, code, capacity } = req.body;

      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
        });
      }

      // Check if code already exists
      const existing = await locationsModel.getByCode(code);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Mã khu vực đã tồn tại'
        });
      }

      const newLocation = await locationsModel.create({
        name,
        code,
        capacity: capacity ? parseInt(capacity) : 0
      });

      res.status(201).json({
        success: true,
        message: 'Tạo vị trí kho thành công',
        data: newLocation
      });
    } catch (error) {
      console.error('Error creating location:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo vị trí kho'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, code, capacity } = req.body;

      const existing = await locationsModel.getById(parseInt(id));
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy vị trí kho'
        });
      }

      if (code && code !== existing.code) {
        const codeExists = await locationsModel.getByCode(code);
        if (codeExists) {
          return res.status(400).json({
            success: false,
            message: 'Mã khu vực đã tồn tại'
          });
        }
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (code) updateData.code = code;
      if (capacity !== undefined) updateData.capacity = parseInt(capacity);

      const updated = await locationsModel.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: 'Cập nhật vị trí kho thành công',
        data: updated
      });
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật vị trí kho'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const location = await locationsModel.getById(parseInt(id));
      if (!location) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy vị trí kho'
        });
      }

      await locationsModel.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Xóa vị trí kho thành công'
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa vị trí kho'
      });
    }
  }
};

module.exports = locationsController;

