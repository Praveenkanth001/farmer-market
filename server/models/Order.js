const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    quantityKg: { type: Number, required: true },
    pricePerKg: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  address: {
    fullName: String,
    phone: String,
    house: String,
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentId: { type: String }, // Razorpay Payment ID or Order ID
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
