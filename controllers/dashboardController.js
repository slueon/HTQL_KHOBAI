const { query } = require('../models/db');

const dashboardController = {
  // GET /api/dashboard/stats
  getStats: async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Total products
      const productsResult = await query('SELECT COUNT(*) as count FROM products');
      const totalProducts = productsResult[0]?.count || 0;

      // Total locations
      // const locationsResult = await query('SELECT COUNT(*) as count FROM locations');
      // const totalLocations = locationsResult[0]?.count || 0;

      // Today's receipts
      // const receiptsResult = await query(
      //   'SELECT COUNT(*) as count FROM receipts WHERE CAST(date AS DATE) = @today',
      //   { today }
      // );
      // const todayReceipts = receiptsResult[0]?.count || 0;

      // Today's issues
      // const issuesResult = await query(
      //   'SELECT COUNT(*) as count FROM issues WHERE CAST(date AS DATE) = @today',
      //   { today }
      // );
      // const todayIssues = issuesResult[0]?.count || 0;

      res.json({
        success: true,
        data: {
          totalProducts,
          // totalLocations,
          // todayReceipts,
          // todayIssues
        }
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê'
      });
    }
  },

  // GET /api/dashboard/reports?dateFrom=&dateTo=
  getReports: async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;

      let whereClause = 'WHERE 1=1';
      const params = {};

      if (dateFrom) {
        whereClause += ' AND date >= @dateFrom';
        params.dateFrom = dateFrom;
      }
      if (dateTo) {
        whereClause += ' AND date <= @dateTo';
        params.dateTo = dateTo;
      }

      // Build separate queries for receipts and issues
      let receiptWhere = 'WHERE 1=1';
      let issueWhere = 'WHERE 1=1';
      
      if (dateFrom) {
        receiptWhere += ' AND r.date >= @dateFrom';
        issueWhere += ' AND i.date >= @dateFrom';
      }
      if (dateTo) {
        receiptWhere += ' AND r.date <= @dateTo';
        issueWhere += ' AND i.date <= @dateTo';
      }

      const receiptsData = await query(`
        SELECT 
          r.date,
          SUM(ri.quantity) as receiptQty,
          SUM(ri.total) as receiptValue,
          0 as issueQty,
          0 as issueValue
        FROM receipts r
        INNER JOIN receipt_items ri ON r.id = ri.receiptId
        ${receiptWhere}
        GROUP BY r.date
      `, params);

      const issuesData = await query(`
        SELECT 
          i.date,
          0 as receiptQty,
          0 as receiptValue,
          SUM(ii.quantity) as issueQty,
          SUM(ii.total) as issueValue
        FROM issues i
        INNER JOIN issue_items ii ON i.id = ii.issueId
        ${issueWhere}
        GROUP BY i.date
      `, params);

      // Combine and group by date
      const dateMap = {};
      
      receiptsData.forEach(row => {
        if (!dateMap[row.date]) {
          dateMap[row.date] = {
            date: row.date,
            receiptQty: 0,
            receiptValue: 0,
            issueQty: 0,
            issueValue: 0
          };
        }
        dateMap[row.date].receiptQty += parseFloat(row.receiptQty);
        dateMap[row.date].receiptValue += parseFloat(row.receiptValue);
      });

      issuesData.forEach(row => {
        if (!dateMap[row.date]) {
          dateMap[row.date] = {
            date: row.date,
            receiptQty: 0,
            receiptValue: 0,
            issueQty: 0,
            issueValue: 0
          };
        }
        dateMap[row.date].issueQty += parseFloat(row.issueQty);
        dateMap[row.date].issueValue += parseFloat(row.issueValue);
      });

      const reportData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

      res.json({
        success: true,
        data: reportData
      });
    } catch (error) {
      console.error('Error getting dashboard reports:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy báo cáo'
      });
    }
  }
};

module.exports = dashboardController;
