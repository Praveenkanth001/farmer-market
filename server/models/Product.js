const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String }, // vegetables, fruits, grains
    unit: { type: String, default: 'kg' }, // kg, liter
    pricePerKg: { type: Number, required: true },
    stockKg: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String }, // single image URL
    location: String, // village/district
    rating: { type: Number, default: 0 },
    images: [String], // keep for multiple images later
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model('Product', productSchema);
