const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ✅ MIDDLEWARE ORDER (CRITICAL - Best Practice)
app.use(cors());                    // 1. CORS first
app.use(express.json());           // 2. Body parsing
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // 3. Static files

// ✅ ROUTES (after middleware)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const farmersRoutes = require('./routes/farmers'); // ✅ Make sure this file exists

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Farmers Market API running ✅', 
    endpoints: ['/api/farmers', '/api/products', '/api/auth'] 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/farmers', farmersRoutes);

// Error handling middleware (LAST)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Database + Server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Test endpoints:`);
      console.log(`   → http://localhost:${PORT}/api/farmers`);
      console.log(`   → http://localhost:${PORT}/api/products`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
