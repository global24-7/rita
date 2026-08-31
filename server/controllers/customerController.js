const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sendTokenResponse = (customer, statusCode, res) => {
  const token = generateToken(customer._id);

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
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      referralCode: customer.referralCode,
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

    const existingPhone = await Customer.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    if (email) {
      const existingEmail = await Customer.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    const customer = await Customer.create({
      name,
      email: email || undefined,
      phone,
      password,
      referredBy: referredBy || null,
    });

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

    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await customer.isPasswordCorrect(password);
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
    const customer = await Customer.findById(req.customer._id).populate('wishlist');
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer profile
// @route   PUT /api/customers/me
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const customer = await Customer.findById(req.customer._id);

    if (name) customer.name = name;
    if (email) {
      if (email !== customer.email) {
        const existing = await Customer.findOne({ email });
        if (existing) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }
      customer.email = email;
    }
    if (phone) {
      if (phone !== customer.phone) {
        const existing = await Customer.findOne({ phone });
        if (existing) {
          return res.status(400).json({ message: 'Phone number already in use' });
        }
      }
      customer.phone = phone;
    }

    await customer.save();

    res.json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      referralCode: customer.referralCode,
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

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: 'No account with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    customer.resetPasswordToken = hashedToken;
    customer.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await customer.save({ validateBeforeSave: false });

    // In production, send email here. For now, return the raw token.
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

    const customer = await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!customer) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    customer.password = password;
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpire = undefined;
    await customer.save();

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
    let customer = await Customer.findOne({ phone });
    if (customer) {
      return res.json(customer);
    }

    customer = await Customer.create({
      name,
      phone,
      referredBy: referredBy || null,
    });

    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer by phone
// @route   GET /api/customers/phone/:phone
exports.getCustomerByPhone = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone })
      .populate('wishlist');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer wishlist
// @route   GET /api/customers/:id/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('wishlist');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer.wishlist);
  } catch (error) {
    next(error);
  }
};

// @desc    Add/remove product from wishlist
// @route   PUT /api/customers/:id/wishlist
exports.updateWishlist = async (req, res, next) => {
  try {
    const { productId, action } = req.body; // action: 'add' or 'remove'
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (action === 'add') {
      if (!customer.wishlist.includes(productId)) {
        customer.wishlist.push(productId);
      }
    } else if (action === 'remove') {
      customer.wishlist = customer.wishlist.filter(
        (id) => id.toString() !== productId
      );
    }

    await customer.save();
    const populated = await Customer.findById(customer._id).populate('wishlist');
    res.json(populated.wishlist);
  } catch (error) {
    next(error);
  }
};
