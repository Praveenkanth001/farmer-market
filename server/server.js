const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 🔧 1. LOAD DOTENV FIRST
dotenv.config();

console.log('=== 🚀 ENV DEBUG ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅' : '❌');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅' : '❌');
console.log('HF_TOKEN:', process.env.HF_TOKEN ? '✅' : '❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌');
console.log('NODE_ENV:', process.env.NODE_ENV || 'dev');
console.log('PORT:', process.env.PORT || 5000);

const app = express();

// 2. PRODUCTION MIDDLEWARE
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. HEALTH CHECK
app.get('/api/health', (req, res) => res.json({ status: 'OK', env: process.env.NODE_ENV, database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.get('/', (req, res) => res.json({ message: '🌾 Farmers Market API LIVE', version: '1.0.0' }));

// 4. ALL ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/predictions', require('./routes/prediction'));
app.use('/api/logistics', require('./routes/logistics'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai-price', require('./routes/aiPrice'));
app.use('/api/ai-crop-health', require('./routes/aiCropHealth'));
app.use('/api/disease', require('./routes/diseaseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/address', require('./routes/address'));
app.use('/api/payment', require('./routes/payment'));

// 5. ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('❌ SERVER ERROR:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'production' ? 'See server logs' : err.message 
  });
});

const PORT = process.env.PORT || 5000;

// 6. DB CONNECTION + SERVER START (Graceful Fallback)
mongoose.connect(process.env.MONGODB_URI || '', {
  serverSelectionTimeoutMS: 5000 // Stop trying after 5 seconds
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.log('⚠️ MongoDB connection failed:', err.message);
    console.log('💡 Note: API is running but features requiring DB will fail.');
  });

// Always start the server regardless of DB status
app.listen(PORT, () => {
  console.log(`🚀 Farmers Market Backend LIVE on port ${PORT}`);
  console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
  console.log('🌱 AI Plant Disease Detection API Ready');
});

const cors = require("cors");
app.use(cors());