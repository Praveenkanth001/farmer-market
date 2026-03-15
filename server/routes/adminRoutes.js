const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Diagnosis = require('../models/Diagnosis');
const adminAuth = require('../middleware/adminMiddleware');

// All routes here should be protected by adminAuth
router.use(adminAuth);

/**
 * @section USER MANAGEMENT
 */

// GET /api/admin/users - List all farmers and buyers
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// DELETE /api/admin/user/:id - Remove a user
router.delete('/user/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

/**
 * @section PRODUCT MANAGEMENT
 */

// GET /api/admin/products - View all products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().populate('farmer', 'name email');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// DELETE /api/admin/product/:id - Remove a product
router.delete('/product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product removed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

/**
 * @section AI REPORTS
 */

// GET /api/admin/reports - View AI disease reports
router.get('/reports', async (req, res) => {
    try {
        const reports = await Diagnosis.find().populate('user', 'name email').sort({ timestamp: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching AI reports' });
    }
});

/**
 * @section DASHBOARD STATS
 */

router.get('/stats', async (req, res) => {
    try {
        const Order = require('../models/Order');
        const totalFarmers = await User.countDocuments({ role: 'farmer' });
        const totalBuyers = await User.countDocuments({ role: 'buyer' });
        const totalProducts = await Product.countDocuments();
        const totalScans = await Diagnosis.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const pendingDeliveries = await Order.countDocuments({ orderStatus: { $in: ['pending', 'confirmed', 'shipped'] } });
        const failedPayments = await Order.countDocuments({ paymentStatus: 'failed' });

        res.json({
            totalFarmers,
            totalBuyers,
            totalProducts,
            totalScans,
            totalOrders,
            totalRevenue,
            pendingDeliveries,
            failedPayments
        });
    } catch (err) {
        console.error("Admin stats error:", err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;
