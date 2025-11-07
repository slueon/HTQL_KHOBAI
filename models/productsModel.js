const { query } = require('./db');

const productsModel = {
  getAll: async (filters = {}) => {
    let whereClause = '';
    const params = {};
    
    if (filters.search) {
      whereClause += ' AND (LOWER(name) LIKE @search OR LOWER(sku) LIKE @search OR LOWER(description) LIKE @search)';
      params.search = `%${filters.search.toLowerCase()}%`;
    }
    
    if (filters.category) {
      whereClause += ' AND category = @category';
      params.category = filters.category;
    }
    
    const sql = `SELECT * FROM products WHERE 1=1 ${whereClause} ORDER BY name`;
    return await query(sql, params);
  },

  getById: async (id) => {
    const result = await query('SELECT * FROM products WHERE id = @id', { id });
    return result.length > 0 ? result[0] : null;
  },

  getBySku: async (sku) => {
    const result = await query('SELECT * FROM products WHERE sku = @sku', { sku });
    return result.length > 0 ? result[0] : null;
  },

  create: async (data) => {
    const sql = `
      INSERT INTO products (sku, name, description, unit, price, category, createdAt, updatedAt)
      OUTPUT INSERTED.*
      VALUES (@sku, @name, @description, @unit, @price, @category, GETDATE(), GETDATE())
    `;
    const result = await query(sql, {
      sku: data.sku,
      name: data.name,
      description: data.description || '',
      unit: data.unit,
      price: data.price,
      category: data.category || ''
    });
    return result[0];
  },

  update: async (id, data) => {
    const updates = [];
    const params = { id };
    
    if (data.sku !== undefined) {
      updates.push('sku = @sku');
      params.sku = data.sku;
    }
    if (data.name !== undefined) {
      updates.push('name = @name');
      params.name = data.name;
    }
    if (data.description !== undefined) {
      updates.push('description = @description');
      params.description = data.description;
    }
    if (data.unit !== undefined) {
      updates.push('unit = @unit');
      params.unit = data.unit;
    }
    if (data.price !== undefined) {
      updates.push('price = @price');
      params.price = data.price;
    }
    if (data.category !== undefined) {
      updates.push('category = @category');
      params.category = data.category;
    }
    
    updates.push('updatedAt = GETDATE()');
    
    const sql = `
      UPDATE products 
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `;
    
    const result = await query(sql, params);
    return result.length > 0 ? result[0] : null;
  },

  delete: async (id) => {
    await query('DELETE FROM products WHERE id = @id', { id });
    return true;
  },

  // Check if product is used in receipts or issues
  isUsed: async (id) => {
    const receiptCheck = await query(
      'SELECT TOP 1 1 FROM receipt_items WHERE productId = @id',
      { id }
    );
    const issueCheck = await query(
      'SELECT TOP 1 1 FROM issue_items WHERE productId = @id',
      { id }
    );
    return receiptCheck.length > 0 || issueCheck.length > 0;
  },

  // Get total stock for a product
  getTotalStock: async (productId) => {
    const result = await query(
      'SELECT ISNULL(SUM(quantity), 0) as totalStock FROM stock WHERE productId = @productId',
      { productId }
    );
    return result[0]?.totalStock || 0;
  }
};

module.exports = productsModel;





