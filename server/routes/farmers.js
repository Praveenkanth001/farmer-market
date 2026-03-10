const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const router = express.Router();

// ✅ 1. GET ALL FARMERS (Farmers page cards) - /api/farmers
router.get('/', async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('name email location phone about avatar createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    // Add product count for each farmer
    const farmersWithCount = await Promise.all(
      farmers.map(async (farmer) => {
        const productCount = await Product.countDocuments({ farmer: farmer._id });
        return { ...farmer, productsCount: productCount };
      })
    );
    
    res.json(farmersWithCount);
  } catch (err) {
    console.error('Farmers fetch error:', err);
    res.status(500).json({ message: 'Server error fetching farmers' });
  }
});

// ✅ 2. GET SINGLE FARMER + PRODUCTS (Profile page) - /api/farmers/:id
router.get('/:id', async (req, res) => {
  try {
    const farmer = await User.findById(req.params.id).select('-password');
    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }
    
    const products = await Product.find({ farmer: req.params.id })
      .select('name price stock image category description');
    
    res.json({ 
      farmer, 
      products,
      productsCount: products.length 
    });
  } catch (err) {
    console.error('Farmer profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
