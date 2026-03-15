const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper to reduce stock and notify farmer
const fulfillOrder = async (orderId) => {
  try {
    console.log(`📦 Fulfilling Order: ${orderId}`);
    const order = await Order.findById(orderId);
    if (!order) {
        console.error('❌ Order not found for fulfillment');
        return;
    }

    // 1. Reduce Stock for each item
    for (const item of order.items) {
      console.log(`📉 Reducing stock for: ${item.name} (${item.quantityKg}kg)`);
      const product = await Product.findById(item.productId);
      if (product) {
        product.stockKg = Math.max(0, product.stockKg - item.quantityKg);
        if (product.stockKg === 0) {
          product.status = 'out_of_stock';
        }
        await product.save();
        console.log(`✅ ${item.name} New Stock: ${product.stockKg}`);

        // Check for Low Stock Alert
        const threshold = product.lowStockThreshold || 10;
        if (product.stockKg <= threshold) {
          console.log(`⚠️ Low stock detected for ${product.name}`);
          await Notification.create({
            recipientId: order.farmer,
            title: '⚠️ Low Stock Alert',
            message: `Your product "${product.name}" is running low (${product.stockKg}kg left). Please restock soon!`,
            type: 'low_stock'
          });
        }
      } else {
          console.error(`❌ Product not found: ${item.productId}`);
      }
    }

    // 2. Create Notification for Farmer
    await Notification.create({
      recipientId: order.farmer,
      title: 'New Order Received! 🛒',
      message: `You have a new order for ₹${order.totalAmount}. Check your dashboard for details.`,
      type: 'new_order'
    });
    console.log('📬 Farmer notified of new order');

  } catch (err) {
    console.error('Fulfillment Error:', err);
  }
};

// Create Razorpay Order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, farmerId, items, address } = req.body;
    const isDummy = process.env.RAZORPAY_KEY_ID?.includes('dummy');

    let rzpOrderId = `mock_order_${Date.now()}`;
    let rzpAmount = amount * 100;
    let rzpCurrency = 'INR';

    if (!isDummy) {
      try {
        const options = {
          amount: amount * 100, // in paise
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        };
        const rzpOrder = await razorpay.orders.create(options);
        rzpOrderId = rzpOrder.id;
        rzpAmount = rzpOrder.amount;
        rzpCurrency = rzpOrder.currency;
      } catch (rzpErr) {
        console.error('Real RZP Order Error:', rzpErr);
        // Fallback or error based on preference. Here we'll error if keys were intended to be real.
        return res.status(500).json({ message: 'Razorpay API error' });
      }
    } else {
      console.log('🏗️  Running in Payment Simulation Mode (Dummy Keys Detected)');
    }

    // Create a pending order in our database
    const newOrder = await Order.create({
      buyer: req.user.id,
      farmer: farmerId,
      items,
      totalAmount: amount,
      address,
      paymentId: rzpOrderId,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    res.json({
      orderId: rzpOrderId,
      currency: rzpCurrency,
      amount: rzpAmount,
      dbOrderId: newOrder._id,
      isSimulation: isDummy
    });
  } catch (err) {
    console.error('Backend Order Error:', err);
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// Verify Payment
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId, isSimulation } = req.body;

    // Skip signature check if it's a simulation
    if (isSimulation || process.env.RAZORPAY_KEY_ID?.includes('dummy')) {
        await Order.findByIdAndUpdate(dbOrderId, {
            paymentStatus: 'paid',
            paymentId: razorpay_payment_id || `sim_${Date.now()}`
        });
        await fulfillOrder(dbOrderId);
        return res.json({ message: 'Simulation payment successful' });
    }

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment successful
      await Order.findByIdAndUpdate(dbOrderId, {
        paymentStatus: 'paid',
        paymentId: razorpay_payment_id
      });
      await fulfillOrder(dbOrderId);
      return res.json({ message: 'Payment verified successfully' });
    } else {
      await Order.findByIdAndUpdate(dbOrderId, { paymentStatus: 'failed' });
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

module.exports = router;
