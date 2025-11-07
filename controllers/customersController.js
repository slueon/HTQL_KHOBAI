const customersModel = require('../models/customersModel');

const customersController = {
  getAll: async (req, res) => {
    try {
      const customers = await customersModel.getAll();
      res.json({
        success: true,
        data: customers
      });
    } catch (error) {
      console.error('Error getting customers:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách khách hàng'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const customer = await customersModel.getById(parseInt(req.params.id));

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Error getting customer:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin khách hàng'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { name, taxCode, address, phone, email } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập tên khách hàng'
        });
      }

      const newCustomer = await customersModel.create({
        name,
        taxCode,
        address,
        phone,
        email
      });

      res.status(201).json({
        success: true,
        message: 'Tạo khách hàng thành công',
        data: newCustomer
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo khách hàng'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, taxCode, address, phone, email } = req.body;

      const customer = await customersModel.getById(parseInt(id));
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (taxCode !== undefined) updateData.taxCode = taxCode;
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;

      const updated = await customersModel.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: 'Cập nhật khách hàng thành công',
        data: updated
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật khách hàng'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const customer = await customersModel.getById(parseInt(id));
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }

      await customersModel.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Xóa khách hàng thành công'
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa khách hàng'
      });
    }
  }
};

module.exports = customersController;
