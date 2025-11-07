const { query, getById, insert, update, remove } = require('./db');
const bcrypt = require('bcryptjs');

const usersModel = {
  getAll: async () => {
    const users = await query('SELECT id, username, fullName, email, role, status, createdAt, updatedAt FROM users ORDER BY username');
    return users;
  },

  getById: async (id) => {
    const user = await getById('users', id);
    if (!user) return null;
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  getByUsername: async (username) => {
    const result = await query('SELECT * FROM users WHERE username = @username', { username });
    return result.length > 0 ? result[0] : null;
  },

  create: async (data) => {
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await insert('users', {
      username: data.username,
      fullName: data.fullName,
      email: data.email || '',
      password: hashedPassword,
      role: data.role,
      status: data.status || 'active'
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  update: async (id, data) => {
    const updateData = {};
    if (data.username !== undefined) updateData.username = data.username;
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    
    // Update password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    const user = await update('users', id, updateData);
    if (!user) return null;
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  delete: async (id) => {
    return await remove('users', id);
  },

  authenticate: async (username, password) => {
    const user = await usersModel.getByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
};

module.exports = usersModel;





