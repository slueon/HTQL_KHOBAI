const sql = require('mssql');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;

// Database configuration
const getConfig = () => {
  // If connection string is provided, use it
  if (process.env.DB_CONNECTION_STRING) {
    return process.env.DB_CONNECTION_STRING;
  }

  // Otherwise, build config from individual variables
  const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'QuanLyKhoPhanPhoi_SQLServer',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT === 'true' || true,
      enableArithAbort: true
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  // Add authentication
  if (process.env.DB_USER && process.env.DB_PASSWORD) {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
  } else {
    // Use Windows Authentication
    config.options.trustedConnection = true;
  }

  // Add instance if provided
  if (process.env.DB_INSTANCE) {
    config.options.instanceName = process.env.DB_INSTANCE;
  }

  return config;
};

// Connect to database
const connect = async () => {
  try {
    if (pool) {
      return pool;
    }

    const config = getConfig();
    pool = await sql.connect(config);
    
    console.log('✅ Đã kết nối thành công với SQL Server');
    console.log(`📊 Database: ${typeof config === 'string' ? 'N/A' : config.database}`);
    
    return pool;
  } catch (error) {
    console.error('❌ Lỗi kết nối database:', error.message);
    throw error;
  }
};

// Test connection
const testConnection = async () => {
  try {
    const pool = await connect();
    const result = await pool.request().query('SELECT 1 as test');
    return result.recordset.length > 0;
  } catch (error) {
    console.error('❌ Lỗi test kết nối:', error.message);
    return false;
  }
};

// Disconnect from database
const disconnect = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('✅ Đã ngắt kết nối database');
    }
  } catch (error) {
    console.error('❌ Lỗi khi ngắt kết nối:', error.message);
  }
};

// Get connection pool
const getPool = () => {
  if (!pool) {
    throw new Error('Database chưa được kết nối. Hãy gọi connect() trước.');
  }
  return pool;
};

// Auto-connect on module load (optional)
if (process.env.AUTO_CONNECT_DB !== 'false') {
  connect().catch(err => {
    console.error('⚠️ Không thể tự động kết nối database:', err.message);
  });
}

module.exports = {
  connect,
  disconnect,
  testConnection,
  getPool,
  sql
};
