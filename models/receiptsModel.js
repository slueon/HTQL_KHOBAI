const { query, getPool } = require('./db');
const stockModel = require('./stockModel');
const sql = require('mssql');

const receiptsModel = {
  getAll: async (filters = {}) => {
    let whereClause = 'WHERE 1=1';
    const params = {};
    
    if (filters.date) {
      whereClause += ' AND r.date = @date';
      params.date = filters.date;
    }
    
    if (filters.status) {
      whereClause += ' AND r.status = @status';
      params.status = filters.status;
    }
    
    const sql = `
      SELECT 
        r.*,
        s.name as supplier_name
      FROM receipts r
      LEFT JOIN suppliers s ON r.supplierId = s.id
      ${whereClause}
      ORDER BY r.createdAt DESC
    `;
    
    const receipts = await query(sql, params);
    
    // Get items for each receipt
    for (const receipt of receipts) {
      const items = await query(
        'SELECT * FROM receipt_items WHERE receiptId = @receiptId',
        { receiptId: receipt.id }
      );
      receipt.items = items;
    }
    
    return receipts;
  },

  getById: async (id) => {
    const receipt = await query(
      `SELECT r.*, s.name as supplier_name 
       FROM receipts r 
       LEFT JOIN suppliers s ON r.supplierId = s.id 
       WHERE r.id = @id`,
      { id }
    );
    
    if (receipt.length === 0) return null;
    
    const items = await query(
      'SELECT * FROM receipt_items WHERE receiptId = @receiptId',
      { receiptId: id }
    );
    
    receipt[0].items = items;
    return receipt[0];
  },

  create: async (data, userId) => {
    // Generate receipt code
    const receiptCode = 'NH' + Date.now().toString().slice(-6);
    
    // Calculate total
    let total = 0;
    for (const item of data.items) {
      total += parseFloat(item.price) * parseFloat(item.quantity);
    }
    
    const pool = getPool();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      const request = new sql.Request(transaction);
      
      // Insert receipt
      request.input('code', receiptCode);
      request.input('supplierId', data.supplierId);
      request.input('date', data.date);
      request.input('note', data.note || '');
      request.input('total', total);
      request.input('status', data.status || 'completed');
      request.input('createdBy', userId);
      
      const receiptResult = await request.query(`
        INSERT INTO receipts (code, supplierId, date, note, total, status, createdAt, createdBy)
        OUTPUT INSERTED.*
        VALUES (@code, @supplierId, @date, @note, @total, @status, GETDATE(), @createdBy)
      `);
      
      const receipt = receiptResult.recordset[0];
      
      // Insert receipt items and update stock
      for (const item of data.items) {
        const itemTotal = parseFloat(item.price) * parseFloat(item.quantity);
        
        const itemRequest = new sql.Request(transaction);
        itemRequest.input('receiptId', receipt.id);
        itemRequest.input('productId', item.productId);
        itemRequest.input('quantity', item.quantity);
        itemRequest.input('locationId', item.locationId);
        itemRequest.input('price', item.price);
        itemRequest.input('total', itemTotal);
        
        await itemRequest.query(`
          INSERT INTO receipt_items (receiptId, productId, quantity, locationId, price, total)
          VALUES (@receiptId, @productId, @quantity, @locationId, @price, @total)
        `);
        
        // Update stock
        await stockModel.increase(item.productId, item.locationId, item.quantity, transaction);
      }
      
      await transaction.commit();
      
      // Get full receipt with items
      return await receiptsModel.getById(receipt.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

module.exports = receiptsModel;

