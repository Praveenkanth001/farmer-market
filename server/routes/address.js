const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const auth = require('../middleware/authMiddleware');

// Add new address
router.post('/add', auth, async (req, res) => {
  try {
    console.log('📬 Address addition request:', req.body);
    const { fullName, phone, house, street, city, state, pincode, isDefault } = req.body;
    
    if (isDefault) {
      await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const address = await Address.create({
      userId: req.user.id,
      fullName: fullName || '',
      phone: phone || '',
      house: house || '',
      street: street || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      isDefault: isDefault === true
    });

    res.status(201).json(address);
  } catch (err) {
    console.error('❌ Error adding address:', err);
    res.status(500).json({ message: 'Error adding address', error: err.message });
  }
});

// Get user addresses
router.get('/user', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching addresses' });
  }
});

// Update address
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { isDefault } = req.body;
    if (isDefault) {
      await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: 'Error updating address' });
  }
});

// Delete address
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting address' });
  }
});

module.exports = router;
