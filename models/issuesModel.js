const { query, getPool } = require('./db');
const stockModel = require('./stockModel');
const mssql = require('mssql');

const issuesModel = {
  getAll: async (filters = {}) => {
    let whereClause = 'WHERE 1=1';
    const params = {};
    
    if (filters.date) {
      whereClause += ' AND i.date = @date';
      params.date = filters.date;
    }
    
    if (filters.status) {
      whereClause += ' AND i.status = @status';
      params.status = filters.status;
    }
    
    const sql = `
      SELECT 
        i.*,
        c.name as customer_name
      FROM issues i
      LEFT JOIN customers c ON i.customerId = c.id
      ${whereClause}
      ORDER BY i.createdAt DESC
    `;
    
    const issues = await query(sql, params);
    
    // Get items for each issue
    for (const issue of issues) {
      const items = await query(
        'SELECT * FROM issue_items WHERE issueId = @issueId',
        { issueId: issue.id }
      );
      issue.items = items;
    }
    
    return issues;
  },

  getById: async (id) => {
    const issue = await query(
      `SELECT i.*, c.name as customer_name 
       FROM issues i 
       LEFT JOIN customers c ON i.customerId = c.id 
       WHERE i.id = @id`,
      { id }
    );
    
    if (issue.length === 0) return null;
    
    const items = await query(
      'SELECT * FROM issue_items WHERE issueId = @issueId',
      { issueId: id }
    );
    
    issue[0].items = items;
    return issue[0];
  },

  create: async (data, userId) => {
    // Generate issue code
    const issueCode = 'XU' + Date.now().toString().slice(-6);
    
    // Calculate total and validate stock
    let total = 0;
    for (const item of data.items) {
      total += parseFloat(item.price) * parseFloat(item.quantity);
      
      // Check stock availability
      const stock = await stockModel.getStock(item.productId, item.locationId);
      const availableStock = stock ? stock.quantity : 0;
      if (parseFloat(item.quantity) > availableStock) {
        throw new Error(`Sản phẩm không đủ số lượng tồn kho. Tồn kho: ${availableStock}`);
      }
    }
    
    const pool = getPool();
    const transaction = new mssql.Transaction(pool);
    
    try {
      await transaction.begin();
      const request = new mssql.Request(transaction);
      
      // Insert issue
      request.input('code', issueCode);
      request.input('customerId', data.customerId);
      request.input('date', data.date);
      request.input('note', data.note || '');
      request.input('total', total);
      request.input('status', data.status || 'completed');
      request.input('createdBy', userId);
      
      const issueResult = await request.query(`
        INSERT INTO issues (code, customerId, date, note, total, status, createdAt, createdBy)
        OUTPUT INSERTED.*
        VALUES (@code, @customerId, @date, @note, @total, @status, GETDATE(), @createdBy)
      `);
      
      const issue = issueResult.recordset[0];
      
      // Insert issue items and update stock
      for (const item of data.items) {
        const itemTotal = parseFloat(item.price) * parseFloat(item.quantity);
        
        const itemRequest = new mssql.Request(transaction);
        itemRequest.input('issueId', issue.id);
        itemRequest.input('productId', item.productId);
        itemRequest.input('quantity', item.quantity);
        itemRequest.input('locationId', item.locationId);
        itemRequest.input('price', item.price);
        itemRequest.input('total', itemTotal);
        
        await itemRequest.query(`
          INSERT INTO issue_items (issueId, productId, quantity, locationId, price, total)
          VALUES (@issueId, @productId, @quantity, @locationId, @price, @total)
        `);
        
        // Update stock (decrease)
        await stockModel.decrease(item.productId, item.locationId, item.quantity, transaction);
      }
      
      await transaction.commit();
      
      // Get full issue with items
      return await issuesModel.getById(issue.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

module.exports = issuesModel;





