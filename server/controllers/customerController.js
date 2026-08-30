const Customer = require('../models/Customer');

// @desc    Register a customer (optional, for wishlist/referral)
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
