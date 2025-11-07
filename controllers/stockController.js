const { dataStore } = require('../models/dataStore');

const stockController = {
  // GET /api/stock?locationId=&productId=
  getCurrent: (req, res) => {
    try {
      let stockData = [];

      // Get all products
      dataStore.products.forEach(product => {
        // Filter by productId if provided
        if (req.query.productId && product.id !== parseInt(req.query.productId)) {
          return;
        }

        // Get stock entries for this product
        const stockEntries = dataStore.stock.filter(
          s => {
            // Filter by locationId if provided
            if (req.query.locationId && s.locationId !== parseInt(req.query.locationId)) {
              return false;
            }
            return s.productId === product.id;
          }
        );

        if (req.query.locationId) {
          // Return stock per location
          stockEntries.forEach(entry => {
            const location = dataStore.locations.find(l => l.id === entry.locationId);
            stockData.push({
              id: entry.id,
              productId: product.id,
              sku: product.sku,
              productName: product.name,
              locationId: entry.locationId,
              locationName: location ? location.name : '',
              quantity: entry.quantity,
              unit: product.unit,
              price: product.price,
              value: entry.quantity * product.price
            });
          });
        } else {
          // Aggregate stock across all locations
          const totalQuantity = stockEntries.reduce((sum, entry) => sum + entry.quantity, 0);
          if (totalQuantity > 0 || !req.query.locationId) {
            stockData.push({
              productId: product.id,
              sku: product.sku,
              productName: product.name,
              locationId: null,
              locationName: 'Tất cả kho',
              quantity: totalQuantity,
              unit: product.unit,
              price: product.price,
              value: totalQuantity * product.price
            });
          }
        }
      });

      res.json({
        success: true,
        data: stockData
      });
    } catch (error) {
      console.error('Error getting stock:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin tồn kho'
      });
    }
  },

  // GET /api/stock/history?dateFrom=&dateTo=&type=
  getHistory: (req, res) => {
    try {
      const { dateFrom, dateTo, type } = req.query;

      let transactions = [];

      // Get receipts
      if (!type || type === 'receipt') {
        dataStore.receipts.forEach(receipt => {
          if (dateFrom && receipt.date < dateFrom) return;
          if (dateTo && receipt.date > dateTo) return;

          receipt.items.forEach(item => {
            const product = dataStore.products.find(p => p.id === item.productId);
            transactions.push({
              date: receipt.createdAt,
              type: 'receipt',
              code: receipt.code,
              productName: product ? product.name : '',
              productId: item.productId,
              quantity: item.quantity,
              user: receipt.createdBy || 'System'
            });
          });
        });
      }

      // Get issues
      if (!type || type === 'issue') {
        dataStore.issues.forEach(issue => {
          if (dateFrom && issue.date < dateFrom) return;
          if (dateTo && issue.date > dateTo) return;

          issue.items.forEach(item => {
            const product = dataStore.products.find(p => p.id === item.productId);
            transactions.push({
              date: issue.createdAt,
              type: 'issue',
              code: issue.code,
              productName: product ? product.name : '',
              productId: item.productId,
              quantity: item.quantity,
              user: issue.createdBy || 'System'
            });
          });
        });
      }

      // Sort by date (newest first)
      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Error getting stock history:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy lịch sử giao dịch'
      });
    }
  }
};

module.exports = stockController;

