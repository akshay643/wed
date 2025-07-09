// Simple authentication middleware for wedding app
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-wedding-secret-key-change-this';
const WEDDING_PASSCODE = process.env.WEDDING_PASSCODE || 'Akshay&Tripti2025';
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'Admin@Wedding2025';

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); // 7 days for wedding period
};

const checkAuth = (req) => {
  const token = req.cookies?.authToken || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return { authenticated: false, user: null };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { authenticated: false, user: null };
  }

  return { authenticated: true, user: decoded };
};

const verifyPasscode = (passcode) => {
  return passcode === WEDDING_PASSCODE;
};

const verifyAdminPasscode = (passcode) => {
  return passcode === ADMIN_PASSCODE;
};

const PASSCODES = {
  WEDDING_PASSCODE,
  ADMIN_PASSCODE
};

// Server-side middleware for API routes
const withAuth = (handler) => {
  return async (req, res) => {
    try {
      const authResult = checkAuth(req);
      
      if (!authResult.authenticated) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Add user info to request
      req.user = authResult.user;
      
      // Call the original handler
      return await handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  };
};

module.exports = {
  verifyToken,
  generateToken,
  checkAuth,
  verifyPasscode,
  verifyAdminPasscode,
  withAuth,
  PASSCODES
};
