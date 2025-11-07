const receiptsModel = require('../models/receiptsModel');
const suppliersModel = require('../models/suppliersModel');
const productsModel = require('../models/productsModel');
const locationsModel = require('../models/locationsModel');

const receiptsController = {
  getAll: async (req, res) => {
    try {
      const filters = {};
      if (req.query.date) filters.date = req.query.date;
      if (req.query.status) filters.status = req.query.status;

      const receipts = await receiptsModel.getAll(filters);

      res.json({
        success: true,
        data: receipts
      });
    } catch (error) {
      console.error('Error getting receipts:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách phiếu nhập'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const receipt = await receiptsModel.getById(parseInt(req.params.id));

      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phiếu nhập'
        });
      }

      res.json({
        success: true,
        data: receipt
      });
    } catch (error) {
      console.error('Error getting receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin phiếu nhập'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { supplierId, date, note, items } = req.body;

      if (!supplierId || !date || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin'
        });
      }

      // Validate supplier exists
      const supplier = await suppliersModel.getById(parseInt(supplierId));
      if (!supplier) {
        return res.status(400).json({
          success: false,
          message: 'Nhà cung cấp không tồn tại'
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

      const receiptData = {
        supplierId: parseInt(supplierId),
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

      const newReceipt = await receiptsModel.create(receiptData, req.user.userId);

      res.status(201).json({
        success: true,
        message: 'Tạo phiếu nhập thành công',
        data: newReceipt
      });
    } catch (error) {
      console.error('Error creating receipt:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo phiếu nhập'
      });
    }
  }
};

module.exports = receiptsController;

