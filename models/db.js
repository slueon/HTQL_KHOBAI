const { getPool, sql } = require('../config/database');

/**
 * Execute a SQL query with parameters
 * @param {string} queryText - SQL query string with @paramName placeholders
 * @param {object} params - Object with parameter values { paramName: value }
 * @returns {Promise<Array>} - Array of result records
 */
const query = async (queryText, params = {}) => {
  try {
    const pool = getPool();
    const request = pool.request();

    // Add parameters to request
    for (const [key, value] of Object.entries(params)) {
      // Handle different data types
      if (value === null || value === undefined) {
        request.input(key, sql.NVarChar, null);
      } else if (typeof value === 'number') {
        // Check if it's an integer or decimal
        if (Number.isInteger(value)) {
          request.input(key, sql.Int, value);
        } else {
          request.input(key, sql.Decimal(18, 2), value);
        }
      } else if (typeof value === 'boolean') {
        request.input(key, sql.Bit, value);
      } else if (value instanceof Date) {
        request.input(key, sql.DateTime, value);
      } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        // String that looks like a date (YYYY-MM-DD)
        request.input(key, sql.Date, value);
      } else {
        request.input(key, sql.NVarChar, value);
      }
    }

    const result = await request.query(queryText);
    return result.recordset;
  } catch (error) {
    console.error('❌ Lỗi khi thực thi query:', error.message);
    console.error('Query:', queryText);
    console.error('Params:', params);
    throw error;
  }
};

/**
 * Get the connection pool (for transactions)
 * @returns {sql.ConnectionPool} - Connection pool instance
 */
const getPoolInstance = () => {
  return getPool();
};

module.exports = {
  query,
  getPool: getPoolInstance,
  sql
};
