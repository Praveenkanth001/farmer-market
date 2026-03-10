// backend/src/routes/orders.js - ADD STOCK DEDUCTION
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// ✅ CREATE ORDER - AUTO REDUCE STOCK
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }

    // ✅ STEP 1: Check stock availability
    const stockErrors = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        stockErrors.push(`${item.name} not found`);
      } else if (product.stockKg < item.quantityKg) {
        stockErrors.push(`${item.name}: Only ${product.stockKg}kg available`);
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Stock issues:', 
        errors: stockErrors 
      });
    }

    // ✅ STEP 2: Create order
    const order = await Order.create({
      buyer: req.user.id,
      items,
      totalAmount,
      status: 'pending'
    });

    // ✅ STEP 3: REDUCE STOCK from products
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { stockKg: -item.quantityKg }  // ✅ Deduct stock
        }
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name')
      .populate('items.productId', 'name pricePerKg image');

    console.log(`✅ Order created & stock deducted: ${order._id}`);
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('❌ Order creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET FARMER ORDERS (shows in dashboard)
router.get('/farmer-orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Farmers only' });
    }

    const orders = await Order.find({ 
      'items.productId.farmer': req.user.id,  // Orders for farmer's products
      status: { $ne: 'cancelled' } 
    })
    .populate('buyer', 'name phone')
    .populate('items.productId', 'name pricePerKg')
    .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
