const { query, getById, insert, update, remove } = require('./db');

const suppliersModel = {
  getAll: async () => {
    return await query('SELECT * FROM suppliers ORDER BY name');
  },

  getById: async (id) => {
    return await getById('suppliers', id);
  },

  create: async (data) => {
    return await insert('suppliers', {
      name: data.name,
      tax_code: data.taxCode || '',
      address: data.address || '',
      phone: data.phone || '',
      email: data.email || ''
    });
  },

  update: async (id, data) => {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.taxCode !== undefined) updateData.tax_code = data.taxCode;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    
    return await update('suppliers', id, updateData);
  },

  delete: async (id) => {
    // Check if used in receipts
    const used = await query(
      'SELECT TOP 1 1 FROM receipts WHERE supplierId = @id',
      { id }
    );
    
    if (used.length > 0) {
      throw new Error('Không thể xóa nhà cung cấp đã được sử dụng trong phiếu nhập');
    }
    
    return await remove('suppliers', id);
  }
};

module.exports = suppliersModel;





