const usersModel = require('../models/usersModel');

const usersController = {
  getAll: async (req, res) => {
    try {
      const users = await usersModel.getAll();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách người dùng'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await usersModel.getById(parseInt(req.params.id));

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin người dùng'
      });
    }
  },

  create: async (req, res) => {
    try {
      const { username, fullName, email, password, role } = req.body;

      if (!username || !fullName || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin'
        });
      }

      // Check if username already exists
      const existingUser = await usersModel.getByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập đã tồn tại'
        });
      }

      const newUser = await usersModel.create({
        username,
        fullName,
        email,
        password,
        role,
        status: 'active'
      });

      res.status(201).json({
        success: true,
        message: 'Tạo người dùng thành công',
        data: newUser
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo người dùng'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, fullName, email, password, role, status } = req.body;

      const existingUser = await usersModel.getById(parseInt(id));
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Check if username already exists (for another user)
      if (username && username !== existingUser.username) {
        const usernameExists = await usersModel.getByUsername(username);
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Tên đăng nhập đã tồn tại'
          });
        }
      }

      const updateData = {};
      if (username) updateData.username = username;
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      if (password) updateData.password = password;

      const updated = await usersModel.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: 'Cập nhật người dùng thành công',
        data: updated
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật người dùng'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await usersModel.getById(parseInt(id));
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }

      // Don't allow deleting yourself
      if (parseInt(id) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa chính mình'
        });
      }

      await usersModel.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Xóa người dùng thành công'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa người dùng'
      });
    }
  }
};

module.exports = usersController;
