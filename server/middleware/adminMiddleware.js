const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find user and check role
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'admin') {
      console.log(`❌ Admin Access Denied for user: ${user?.email || 'Unknown'}`);
      return res.status(403).json({ message: 'Admin access only' });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Admin Middleware Error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = adminMiddleware;
