const usersModel = require('../models/usersModel');

// Default admin account (fallback if no users in database)
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123'
};

/**
 * Authenticate user with username and password
 * @param {string} username 
 * @param {string} password 
 * @returns {object|null} User object if authenticated, null otherwise
 */
async function authenticateUser(username, password) {
  try {
    // Try to authenticate from database
    const user = await usersModel.authenticate(username, password);
    if (user) {
      return user;
    }

    // Fallback to default admin (for initial setup)
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      return {
        id: 1,
        username: DEFAULT_ADMIN.username
      };
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    // Fallback to default admin on error
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      return {
        id: 1,
        username: DEFAULT_ADMIN.username
      };
    }
    return null;
  }
}

module.exports = {
  authenticateUser
};
