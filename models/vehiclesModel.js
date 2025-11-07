const { query, getById, insert, update, remove } = require('./db');

const vehiclesModel = {
  getAll: async () => {
    return await query('SELECT * FROM vehicles ORDER BY plate');
  },

  getById: async (id) => {
    return await getById('vehicles', id);
  },

  getByPlate: async (plate) => {
    const result = await query('SELECT * FROM vehicles WHERE UPPER(plate) = UPPER(@plate)', { plate });
    return result.length > 0 ? result[0] : null;
  },

  create: async (data) => {
    return await insert('vehicles', {
      plate: data.plate.toUpperCase(),
      type: data.type,
      driver: data.driver,
      driverPhone: data.driverPhone || '',
      owner: data.owner,
      note: data.note || '',
      status: data.status || 'active'
    });
  },

  update: async (id, data) => {
    const updateData = {};
    if (data.plate !== undefined) updateData.plate = data.plate.toUpperCase();
    if (data.type !== undefined) updateData.type = data.type;
    if (data.driver !== undefined) updateData.driver = data.driver;
    if (data.driverPhone !== undefined) updateData.driverPhone = data.driverPhone;
    if (data.owner !== undefined) updateData.owner = data.owner;
    if (data.note !== undefined) updateData.note = data.note;
    if (data.status !== undefined) updateData.status = data.status;
    
    return await update('vehicles', id, updateData);
  },

  delete: async (id) => {
    // Check if has logs
    const hasLogs = await query(
      'SELECT TOP 1 1 FROM vehicle_logs WHERE vehicleId = @id',
      { id }
    );
    
    if (hasLogs.length > 0) {
      throw new Error('Không thể xóa xe đã có nhật ký');
    }
    
    return await remove('vehicles', id);
  }
};

module.exports = vehiclesModel;





