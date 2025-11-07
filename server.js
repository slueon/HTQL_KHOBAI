const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const locationsRoutes = require('./routes/locations');
const suppliersRoutes = require('./routes/suppliers');
const customersRoutes = require('./routes/customers');
const receiptsRoutes = require('./routes/receipts');
const issuesRoutes = require('./routes/issues');
const stockRoutes = require('./routes/stock');
const usersRoutes = require('./routes/users');
const vehiclesRoutes = require('./routes/vehicles');
const vehicleLogsRoutes = require('./routes/vehicle-logs');
const dashboardRoutes = require('./routes/dashboard');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/vehicle-logs', vehicleLogsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Warehouse Management API',
    version: '1.0.0',
    status: 'running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

