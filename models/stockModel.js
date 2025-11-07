const { query } = require('./db');
const mssql = require('mssql');

const stockModel = {
  // Get stock by product and location
  getStock: async (productId, locationId) => {
    const sql = `
      SELECT * FROM stock 
      WHERE productId = @productId AND locationId = @locationId
    `;
    const result = await query(sql, { productId, locationId });
    return result.length > 0 ? result[0] : null;
  },

  // Get all stock entries
  getAll: async (filters = {}) => {
    let whereClause = 'WHERE 1=1';
    const params = {};
    
    if (filters.productId) {
      whereClause += ' AND s.productId = @productId';
      params.productId = filters.productId;
    }
    
    if (filters.locationId) {
      whereClause += ' AND s.locationId = @locationId';
      params.locationId = filters.locationId;
    }
    
    const sql = `
      SELECT 
        s.id,
        s.productId,
        p.sku,
        p.name as productName,
        s.locationId,
        l.name as locationName,
        s.quantity,
        p.unit,
        p.price,
        (s.quantity * p.price) as value
      FROM stock s
      INNER JOIN products p ON s.productId = p.id
      INNER JOIN locations l ON s.locationId = l.id
      ${whereClause}
      ORDER BY p.name, l.name
    `;
    
    return await query(sql, params);
  },

  // Increase stock (for receipts)
  increase: async (productId, locationId, quantity, transactionRequest = null) => {
    const existing = await stockModel.getStock(productId, locationId);
    
    if (existing) {
      const sqlQuery = `
        UPDATE stock 
        SET quantity = quantity + @quantity, updatedAt = GETDATE()
        WHERE id = @id
      `;
      if (transactionRequest) {
        const request = new mssql.Request(transactionRequest);
        request.input('id', existing.id);
        request.input('quantity', quantity);
        await request.query(sqlQuery);
      } else {
        await query(sqlQuery, { id: existing.id, quantity });
      }
    } else {
      const sqlQuery = `
        INSERT INTO stock (productId, locationId, quantity, updatedAt)
        VALUES (@productId, @locationId, @quantity, GETDATE())
      `;
      if (transactionRequest) {
        const request = new mssql.Request(transactionRequest);
        request.input('productId', productId);
        request.input('locationId', locationId);
        request.input('quantity', quantity);
        await request.query(sqlQuery);
      } else {
        await query(sqlQuery, { productId, locationId, quantity });
      }
    }
  },

  // Decrease stock (for issues)
  decrease: async (productId, locationId, quantity, transactionRequest = null) => {
    const existing = await stockModel.getStock(productId, locationId);
    
    if (!existing || existing.quantity < quantity) {
      throw new Error('Không đủ số lượng tồn kho');
    }
    
    const sqlQuery = `
      UPDATE stock 
      SET quantity = quantity - @quantity, updatedAt = GETDATE()
      WHERE id = @id
    `;
    if (transactionRequest) {
      const request = new mssql.Request(transactionRequest);
      request.input('id', existing.id);
      request.input('quantity', quantity);
      await request.query(sqlQuery);
    } else {
      await query(sqlQuery, { id: existing.id, quantity });
    }
  },

  // Get stock history from receipts and issues
  getHistory: async (filters = {}) => {
    let receiptWhere = 'WHERE 1=1';
    let issueWhere = 'WHERE 1=1';
    const params = {};
    
    if (filters.dateFrom) {
      receiptWhere += ' AND r.createdAt >= @dateFrom';
      issueWhere += ' AND i.createdAt >= @dateFrom';
      params.dateFrom = filters.dateFrom;
    }
    
    if (filters.dateTo) {
      receiptWhere += ' AND r.createdAt <= @dateTo';
      issueWhere += ' AND i.createdAt <= @dateTo';
      params.dateTo = filters.dateTo;
    }
    
    let receiptSql = '';
    let issueSql = '';
    
    if (!filters.type || filters.type === 'receipt') {
      receiptSql = `
        SELECT 
          r.createdAt as date,
          'receipt' as type,
          r.code,
          p.name as productName,
          ri.productId,
          ri.quantity,
          u.username as user
        FROM receipts r
        INNER JOIN receipt_items ri ON r.id = ri.receiptId
        INNER JOIN products p ON ri.productId = p.id
        LEFT JOIN users u ON r.createdBy = u.id
        ${receiptWhere}
      `;
    }
    
    if (!filters.type || filters.type === 'issue') {
      issueSql = `
        SELECT 
          i.createdAt as date,
          'issue' as type,
          i.code,
          p.name as productName,
          ii.productId,
          ii.quantity,
          u.username as user
        FROM issues i
        INNER JOIN issue_items ii ON i.id = ii.issueId
        INNER JOIN products p ON ii.productId = p.id
        LEFT JOIN users u ON i.createdBy = u.id
        ${issueWhere}
      `;
    }
    
    let sql = '';
    if (receiptSql && issueSql) {
      sql = `${receiptSql} UNION ALL ${issueSql} ORDER BY date DESC`;
    } else if (receiptSql) {
      sql = `${receiptSql} ORDER BY date DESC`;
    } else if (issueSql) {
      sql = `${issueSql} ORDER BY date DESC`;
    }
    
    return await query(sql, params);
  }
};

module.exports = stockModel;

