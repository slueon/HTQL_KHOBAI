const productsModel = require('../models/productsModel');

const productsController = {
  // GET /api/products
  getAll: async (req, res) => {
    try {
      const filters = {};
      if (req.query.search) filters.search = req.query.search;
      if (req.query.category) filters.category = req.query.category;

      const products = await productsModel.getAll(filters);
      
      // Calculate stock for each product
      for (const product of products) {
        product.stock = await productsModel.getTotalStock(product.id);
      }

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách sản phẩm'
      });
    }
  },

  // GET /api/products/:id
  getById: async (req, res) => {
    try {
      const product = await productsModel.getById(parseInt(req.params.id));

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      // Calculate stock
      product.stock = await productsModel.getTotalStock(product.id);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin sản phẩm'
      });
    }
  },

  // POST /api/products
  create: async (req, res) => {
    try {
      const { sku, name, description, unit, price, category } = req.body;

      // Validate required fields
      if (!sku || !name || !unit || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
        });
      }

      // Check if SKU already exists
      const existingProduct = await productsModel.getBySku(sku);
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Mã SKU đã tồn tại'
        });
      }

      const newProduct = await productsModel.create({
        sku,
        name,
        description,
        unit,
        price: parseFloat(price),
        category
      });

      res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm thành công',
        data: newProduct
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi tạo sản phẩm'
      });
    }
  },

  // PUT /api/products/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { sku, name, description, unit, price, category } = req.body;

      const existingProduct = await productsModel.getById(parseInt(id));
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      // Check if SKU already exists (for another product)
      if (sku && sku !== existingProduct.sku) {
        const skuProduct = await productsModel.getBySku(sku);
        if (skuProduct) {
          return res.status(400).json({
            success: false,
            message: 'Mã SKU đã tồn tại'
          });
        }
      }

      const updateData = {};
      if (sku) updateData.sku = sku;
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (unit) updateData.unit = unit;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (category !== undefined) updateData.category = category;

      const updatedProduct = await productsModel.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: 'Cập nhật sản phẩm thành công',
        data: updatedProduct
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi cập nhật sản phẩm'
      });
    }
  },

  // DELETE /api/products/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await productsModel.getById(parseInt(id));
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy sản phẩm'
        });
      }

      // Check if product is used
      const isUsed = await productsModel.isUsed(parseInt(id));
      if (isUsed) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa sản phẩm đã được sử dụng trong phiếu nhập/xuất'
        });
      }

      await productsModel.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Xóa sản phẩm thành công'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi xóa sản phẩm'
      });
    }
  }
};

module.exports = productsController;

