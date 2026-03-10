const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ✅ CREATE UPLOADS FOLDER
const uploadDir = 'uploads/products';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads/products folder');
}

// ✅ Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + 
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed!'), false);
    }
  },
});

// ✅ 1. GET all products (Public - Buyers see this)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('farmer', 'name location phone')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('GET products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ 2. GET single product (Public - Product Details page)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name location phone');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('GET product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ 3. GET MY PRODUCTS (Protected - Farmer Dashboard ONLY)
router.get('/my-products', auth, async (req, res) => {
  try {
    console.log('🔍 Fetching products for farmer:', req.user.id);
    
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can access their products' });
    }

    const products = await Product.find({ farmer: req.user.id })
      .populate('farmer', 'name location')
      .sort({ createdAt: -1 });
    
    console.log(`✅ Found ${products.length} products for farmer`);
    res.json(products);
  } catch (err) {
    console.error('GET my-products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ CREATE PRODUCT
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Creating product for:', req.user.id);
    console.log('📋 Body:', req.body);
    console.log('🖼️ File:', req.file?.filename || 'none');

    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers can add products' });
    }

    const { name, category = 'general', unit = 'kg', pricePerKg, stockKg, description = '', location = '' } = req.body;

    if (!name?.trim() || !pricePerKg || !stockKg) {
      return res.status(400).json({ 
        message: `Missing required fields: ${!name?.trim() ? 'name' : ''}${!pricePerKg ? ', pricePerKg' : ''}${!stockKg ? ', stockKg' : ''}`.slice(1)
      });
    }

    const productData = {
      farmer: req.user.id,
      name: name.trim(),
      category,
      unit,
      pricePerKg: parseFloat(pricePerKg),
      stockKg: parseFloat(stockKg),
      description: description.trim(),
      location: location.trim(),
    };

    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create(productData);
    const populated = await Product.findById(product._id).populate('farmer', 'name location');

    console.log('✅ Product created:', product._id);
    res.status(201).json(populated);
  } catch (err) {
    console.error('❌ POST product error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE PRODUCT
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, category, unit, pricePerKg, stockKg, description, location } = req.body;

    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category || 'general';
    if (unit !== undefined) product.unit = unit || 'kg';
    if (pricePerKg !== undefined) product.pricePerKg = parseFloat(pricePerKg);
    if (stockKg !== undefined) product.stockKg = parseFloat(stockKg);
    if (description !== undefined) product.description = description.trim();
    if (location !== undefined) product.location = location.trim();

    if (req.file) {
      product.image = `/uploads/products/${req.file.filename}`;
    }

    await product.save();
    const populated = await Product.findById(product._id).populate('farmer', 'name location');
    res.json(populated);
  } catch (err) {
    console.error('❌ PUT error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE PRODUCT
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
