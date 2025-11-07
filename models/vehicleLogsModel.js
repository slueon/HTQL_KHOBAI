const { query, getById, insert } = require('./db');

const vehicleLogsModel = {
  getAll: async (filters = {}) => {
    let whereClause = 'WHERE 1=1';
    const params = {};
    
    if (filters.vehicleId) {
      whereClause += ' AND vehicleId = @vehicleId';
      params.vehicleId = filters.vehicleId;
    }
    
    if (filters.filter === 'in') {
      whereClause += ' AND type = @type AND exitLogId IS NULL';
      params.type = 'in';
    } else if (filters.filter === 'out') {
      whereClause += ' AND type = @type';
      params.type = 'out';
    } else if (filters.filter === 'parked') {
      whereClause += ' AND type = @type AND exitLogId IS NULL';
      params.type = 'in';
    }
    
    if (filters.date) {
      whereClause += ' AND CAST(datetime AS DATE) = @date';
      params.date = filters.date;
    }
    
    const sql = `SELECT * FROM vehicle_logs ${whereClause} ORDER BY datetime DESC`;
    return await query(sql, params);
  },

  getById: async (id) => {
    return await getById('vehicle_logs', id);
  },

  create: async (data, userId) => {
    // For "out" type, check if there's a pending "in" log
    if (data.type === 'out') {
      const lastEntry = await query(`
        SELECT TOP 1 * FROM vehicle_logs 
        WHERE vehicleId = @vehicleId AND type = 'in' AND exitLogId IS NULL
        ORDER BY datetime DESC
      `, { vehicleId: data.vehicleId });
      
      if (lastEntry.length === 0) {
        throw new Error('Xe này chưa có lượt vào. Vui lòng ghi nhận lượt vào trước.');
      }
    }
    
    // Get vehicle info
    const vehicle = await query('SELECT * FROM vehicles WHERE id = @id', { id: data.vehicleId });
    if (vehicle.length === 0) {
      throw new Error('Xe không tồn tại');
    }
    
    const logData = {
      vehicleId: data.vehicleId,
      vehiclePlate: vehicle[0].plate,
      vehicleDriver: vehicle[0].driver,
      type: data.type,
      datetime: data.datetime,
      purpose: data.purpose,
      guard: data.guard,
      note: data.note || '',
      exitLogId: null,
      createdBy: userId
    };
    
    const newLog = await insert('vehicle_logs', logData);
    
    // If this is an exit, link it to the last entry
    if (data.type === 'out') {
      const lastEntry = await query(`
        SELECT TOP 1 * FROM vehicle_logs 
        WHERE vehicleId = @vehicleId AND type = 'in' AND exitLogId IS NULL
        ORDER BY datetime DESC
      `, { vehicleId: data.vehicleId });
      
      if (lastEntry.length > 0 && lastEntry[0].id !== newLog.id) {
        await query(
          'UPDATE vehicle_logs SET exitLogId = @exitLogId WHERE id = @id',
          { id: lastEntry[0].id, exitLogId: newLog.id }
        );
      }
    }
    
    return newLog;
  },

  getParkedAlerts: async (hours = 8) => {
    const now = new Date();
    const alertTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const logs = await query(`
      SELECT *, 
        DATEDIFF(HOUR, datetime, GETDATE()) as hoursIn
      FROM vehicle_logs 
      WHERE type = 'in' AND exitLogId IS NULL AND datetime <= @alertTime
      ORDER BY datetime ASC
    `, { alertTime: alertTime.toISOString() });
    
    return logs;
  },

  getStatsReport: async (filters = {}) => {
    let whereClause = 'WHERE 1=1';
    const params = {};
    
    if (filters.dateFrom) {
      whereClause += ' AND CAST(datetime AS DATE) >= @dateFrom';
      params.dateFrom = filters.dateFrom;
    }
    
    if (filters.dateTo) {
      whereClause += ' AND CAST(datetime AS DATE) <= @dateTo';
      params.dateTo = filters.dateTo;
    }
    
    const sql = `
      SELECT 
        CAST(datetime AS DATE) as date,
        SUM(CASE WHEN type = 'in' THEN 1 ELSE 0 END) as inCount,
        SUM(CASE WHEN type = 'out' THEN 1 ELSE 0 END) as outCount,
        SUM(CASE WHEN type = 'in' AND exitLogId IS NULL THEN 1 ELSE 0 END) as parkedCount
      FROM vehicle_logs
      ${whereClause}
      GROUP BY CAST(datetime AS DATE)
      ORDER BY date
    `;
    
    const daily = await query(sql, params);
    
    // Calculate totals
    const totals = await query(`
      SELECT 
        SUM(CASE WHEN type = 'in' THEN 1 ELSE 0 END) as totalIn,
        SUM(CASE WHEN type = 'out' THEN 1 ELSE 0 END) as totalOut,
        SUM(CASE WHEN type = 'in' AND exitLogId IS NULL THEN 1 ELSE 0 END) as totalParked
      FROM vehicle_logs
      ${whereClause}
    `, params);
    
    return {
      summary: totals[0] || { totalIn: 0, totalOut: 0, totalParked: 0 },
      daily: daily
    };
  }
};

module.exports = vehicleLogsModel;





