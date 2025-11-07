const { query, getById, insert, update, remove } = require('./db');

const customersModel = {
  getAll: async () => {
    return await query('SELECT * FROM customers ORDER BY name');
  },

  getById: async (id) => {
    return await getById('customers', id);
  },

  create: async (data) => {
    return await insert('customers', {
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
    
    return await update('customers', id, updateData);
  },

  delete: async (id) => {
    // Check if used in issues
    const used = await query(
      'SELECT TOP 1 1 FROM issues WHERE customerId = @id',
      { id }
    );
    
    if (used.length > 0) {
      throw new Error('Không thể xóa khách hàng đã được sử dụng trong phiếu xuất');
    }
    
    return await remove('customers', id);
  }
};

module.exports = customersModel;





