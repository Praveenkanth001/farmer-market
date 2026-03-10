const jwt = require('jsonwebtoken');

// ✅ ROBUST AUTH MIDDLEWARE
const authMiddleware = (req, res, next) => {
  try {
    // ✅ Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. Invalid token format.' 
      });
    }

    // ✅ Verify token with secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Ensure required fields exist
    if (!decoded.id) {
      return res.status(401).json({ 
        message: 'Invalid token payload.' 
      });
    }

    // ✅ Attach user to request
    req.user = {
      id: decoded.id,
      role: decoded.role || 'user', // Default role
      email: decoded.email || null,
      name: decoded.name || null
    };

    console.log('✅ Authenticated user:', req.user.id, req.user.role);

    next();
    
  } catch (err) {
    console.error('❌ Auth error:', err.message);
    
    // ✅ Specific JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token signature.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please login again.' });
    }
    
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

module.exports = authMiddleware;
