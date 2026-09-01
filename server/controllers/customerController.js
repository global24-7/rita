const supabase = require('../config/supabase');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateReferralCode = () => {
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `RITA-${hex}`;
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = (customer, statusCode, res) => {
  const token = generateToken(customer.id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(statusCode)
    .cookie('customerToken', token, cookieOptions)
    .json({
      _id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      referralCode: customer.referral_code,
      token,
    });
};

// @desc    Register customer
// @route   POST /api/customers/register
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, password, referredBy } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required' });
    }

    // Check phone uniqueness
    const { data: existingPhone } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Check email uniqueness if provided
    if (email) {
      const { data: existingEmail } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .single();

      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        name,
        email: email || null,
        phone,
        password: hashedPassword,
        referral_code: referralCode,
        referred_by: referredBy || null,
      })
      .select()
      .single();

    if (error) throw error;

    sendTokenResponse(customer, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login customer
// @route   POST /api/customers/login
exports.loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !customer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!customer.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    sendTokenResponse(customer, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current customer profile
// @route   GET /api/customers/me
exports.getMe = async (req, res, next) => {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, name, email, phone, referral_code, created_at')
      .eq('id', req.customer.id)
      .single();

    if (error || !customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get wishlist
    const { data: wishlistData } = await supabase
      .from('customer_wishlists')
      .select('product_id')
      .eq('customer_id', customer.id);

    let wishlist = [];
    if (wishlistData && wishlistData.length > 0) {
      const productIds = wishlistData.map(w => w.product_id);
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
      wishlist = products || [];
    }

    res.json({ ...customer, wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer profile
// @route   PUT /api/customers/me
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    // Check email uniqueness if changing
    if (email) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .neq('id', req.customer.id)
        .single();

      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Check phone uniqueness if changing
    if (phone) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .neq('id', req.customer.id)
        .single();

      if (existing) {
        return res.status(400).json({ message: 'Phone number already in use' });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', req.customer.id)
      .select('id, name, email, phone, referral_code')
      .single();

    if (error) throw error;

    res.json({
      _id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      referralCode: customer.referral_code,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - generate reset token
// @route   POST /api/customers/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .single();

    if (error || !customer) {
      return res.status(404).json({ message: 'No account with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const { error: updateError } = await supabase
      .from('customers')
      .update({
        reset_password_token: hashedToken,
        reset_password_expire: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      })
      .eq('id', customer.id);

    if (updateError) throw updateError;

    res.json({
      message: 'Password reset token generated',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with token
// @route   PUT /api/customers/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('reset_password_token', hashedToken)
      .gt('reset_password_expire', new Date().toISOString())
      .single();

    if (error || !customer) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
      .from('customers')
      .update({
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expire: null,
      })
      .eq('id', customer.id);

    if (updateError) throw updateError;

    sendTokenResponse(customer, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout customer
// @route   POST /api/customers/logout
exports.logoutCustomer = async (req, res, next) => {
  try {
    res
      .cookie('customerToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
      })
      .json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a customer (guest/referral)
// @route   POST /api/customers
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, phone, referredBy } = req.body;

    // Check if phone already exists
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();

    if (existing) {
      return res.json(existing);
    }

    const referralCode = generateReferralCode();

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        name,
        phone,
        referral_code: referralCode,
        referred_by: referredBy || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer by phone
// @route   GET /api/customers/phone/:phone
exports.getCustomerByPhone = async (req, res, next) => {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('id, name, email, phone, referral_code, created_at')
      .eq('phone', req.params.phone)
      .single();

    if (error || !customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get wishlist
    const { data: wishlistData } = await supabase
      .from('customer_wishlists')
      .select('product_id')
      .eq('customer_id', customer.id);

    let wishlist = [];
    if (wishlistData && wishlistData.length > 0) {
      const productIds = wishlistData.map(w => w.product_id);
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);
      wishlist = products || [];
    }

    res.json({ ...customer, wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer wishlist
// @route   GET /api/customers/:id/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const { data: wishlistData } = await supabase
      .from('customer_wishlists')
      .select('product_id')
      .eq('customer_id', req.params.id);

    if (!wishlistData || wishlistData.length === 0) {
      return res.json([]);
    }

    const productIds = wishlistData.map(w => w.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    res.json(products || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Add/remove product from wishlist
// @route   PUT /api/customers/:id/wishlist
exports.updateWishlist = async (req, res, next) => {
  try {
    const { productId, action } = req.body; // action: 'add' or 'remove'

    if (action === 'add') {
      await supabase
        .from('customer_wishlists')
        .insert({ customer_id: req.params.id, product_id: productId })
        .select();
    } else if (action === 'remove') {
      await supabase
        .from('customer_wishlists')
        .delete()
        .eq('customer_id', req.params.id)
        .eq('product_id', productId);
    }

    // Return updated wishlist
    const { data: wishlistData } = await supabase
      .from('customer_wishlists')
      .select('product_id')
      .eq('customer_id', req.params.id);

    if (!wishlistData || wishlistData.length === 0) {
      return res.json([]);
    }

    const productIds = wishlistData.map(w => w.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    res.json(products || []);
  } catch (error) {
    next(error);
  }
};
