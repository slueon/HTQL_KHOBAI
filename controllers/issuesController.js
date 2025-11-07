const issuesModel = require('../models/issuesModel');
const customersModel = require('../models/customersModel');
const productsModel = require('../models/productsModel');
const locationsModel = require('../models/locationsModel');

const issuesController = {
  getAll: async (req, res) => {
    try {
      const filters = {};
      if (req.query.date) filters.date = req.query.date;
      if (req.query.status) filters.status = req.query.status;

      const issues = await issuesModel.getAll(filters);

      res.json({
        success: true,
        data: issues
      });
    } catch (error) {
      console.error('Error getting issues:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách phiếu xuất'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const issue = await issuesModel.getById(parseInt(req.params.id));

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phiếu xuất'
        });
      }

      res.json({
        success: true,
        data: issue
      });
    } catch (error) {
      console.error('Error getting issue:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin phiếu xuất'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { customerId, date, note, items } = req.body;

      if (!customerId || !date || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin'
        });
      }

      // Validate customer exists
      const customer = await customersModel.getById(parseInt(customerId));
      if (!customer) {
        return res.status(400).json({
          success: false,
          message: 'Khách hàng không tồn tại'
        });
      }

      // Validate items
      for (const item of items) {
        if (!item.productId || !item.quantity || !item.locationId || item.price === undefined) {
          return res.status(400).json({
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin sản phẩm'
          });
        }

        // Validate product exists
        const product = await productsModel.getById(parseInt(item.productId));
        if (!product) {
          return res.status(400).json({
            success: false,
            message: `Sản phẩm với ID ${item.productId} không tồn tại`
          });
        }

        // Validate location exists
        const location = await locationsModel.getById(parseInt(item.locationId));
        if (!location) {
          return res.status(400).json({
            success: false,
            message: `Vị trí kho với ID ${item.locationId} không tồn tại`
          });
        }
      }

      const issueData = {
        customerId: parseInt(customerId),
        date,
        note: note || '',
        items: items.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseFloat(item.quantity),
          locationId: parseInt(item.locationId),
          price: parseFloat(item.price)
        })),
        status: req.body.status || 'completed'
      };

      const newIssue = await issuesModel.create(issueData, req.user.userId);

      res.status(201).json({
        success: true,
        message: 'Tạo phiếu xuất thành công',
        data: newIssue
      });
    } catch (error) {
      console.error('Error creating issue:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo phiếu xuất'
      });
    }
  }
};

module.exports = issuesController;
