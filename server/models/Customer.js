const mongoose = require('mongoose');
const crypto = require('crypto');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
  },
  referralCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: String,
    default: null,
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
}, {
  timestamps: true,
});

// Pre-save: auto-generate referral code
customerSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = 'RITA-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
