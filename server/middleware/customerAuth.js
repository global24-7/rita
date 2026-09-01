const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const customerAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies && req.cookies.customerToken) {
      token = req.cookies.customerToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, please log in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, name, email, phone, referral_code, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !customer) {
      return res.status(401).json({ message: 'Not authorized, customer not found' });
    }

    req.customer = customer;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies && req.cookies.customerToken) {
      token = req.cookies.customerToken;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: customer } = await supabase
        .from('customers')
        .select('id, name, email, phone, referral_code, created_at')
        .eq('id', decoded.id)
        .single();

      if (customer) {
        req.customer = customer;
      }
    }
  } catch (error) {
    // silently fail for optional auth
  }
  next();
};

module.exports = { customerAuth, optionalAuth };
