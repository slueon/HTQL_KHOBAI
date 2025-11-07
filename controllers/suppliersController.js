const suppliersModel = require('../models/suppliersModel');

const suppliersController = {
  getAll: async (req, res) => {
    try {
      const suppliers = await suppliersModel.getAll();
      res.json({
        success: true,
        data: suppliers
      });
    } catch (error) {
      console.error('Error getting suppliers:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách nhà cung cấp'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const supplier = await suppliersModel.getById(parseInt(req.params.id));

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà cung cấp'
        });
      }

      res.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      console.error('Error getting supplier:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin nhà cung cấp'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, taxCode, address, phone, email } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập tên nhà cung cấp'
        });
      }

      const newSupplier = await suppliersModel.create({
        name,
        taxCode,
        address,
        phone,
        email
      });

      res.status(201).json({
        success: true,
        message: 'Tạo nhà cung cấp thành công',
        data: newSupplier
      });
    } catch (error) {
      console.error('Error creating supplier:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo nhà cung cấp'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, taxCode, address, phone, email } = req.body;

      const supplier = await suppliersModel.getById(parseInt(id));
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà cung cấp'
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (taxCode !== undefined) updateData.taxCode = taxCode;
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;

      const updated = await suppliersModel.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: 'Cập nhật nhà cung cấp thành công',
        data: updated
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật nhà cung cấp'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const supplier = await suppliersModel.getById(parseInt(id));
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhà cung cấp'
        });
      }

      await suppliersModel.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Xóa nhà cung cấp thành công'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa nhà cung cấp'
      });
    }
  }
};

module.exports = suppliersController;

