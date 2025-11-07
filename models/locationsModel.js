const { query, getById, insert, update, remove } = require('./db');

const locationsModel = {
  getAll: async () => {
    const locations = await query('SELECT * FROM locations ORDER BY name');
    
    // Calculate used capacity for each location
    for (const location of locations) {
      const stockResult = await query(
        'SELECT ISNULL(SUM(quantity), 0) as used FROM stock WHERE locationId = @locationId',
        { locationId: location.id }
      );
      location.used = stockResult[0]?.used || 0;
    }
    
    return locations;
  },

  getById: async (id) => {
    const location = await getById('locations', id);
    if (!location) return null;
    
    const stockResult = await query(
      'SELECT ISNULL(SUM(quantity), 0) as used FROM stock WHERE locationId = @locationId',
      { locationId: id }
    );
    location.used = stockResult[0]?.used || 0;
    
    return location;
  },

  getByCode: async (code) => {
    const result = await query('SELECT * FROM locations WHERE code = @code', { code });
    return result.length > 0 ? result[0] : null;
  },

  create: async (data) => {
    return await insert('locations', {
      name: data.name,
      code: data.code,
      capacity: data.capacity || 0
    });
  },

  update: async (id, data) => {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    
    return await update('locations', id, updateData);
  },

  delete: async (id) => {
    // Check if has stock
    const hasStock = await query(
      'SELECT TOP 1 1 FROM stock WHERE locationId = @id',
      { id }
    );
    
    if (hasStock.length > 0) {
      throw new Error('Không thể xóa vị trí kho đang có tồn kho');
    }
    
    return await remove('locations', id);
  }
};

module.exports = locationsModel;





