const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// GET ALL ORDERS (Admin)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const orders = await Order.find().populate('buyer farmer', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET BUYER ORDERS
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('farmer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET FARMER ORDERS
router.get('/farmer-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user.id })
      .populate('buyer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Farmer orders fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE ORDER STATUS (Farmer)
router.put('/status/:id', auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      { orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found or unauthorized' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

module.exports = router;
