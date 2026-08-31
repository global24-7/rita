const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  size: { type: String, required: true },
  priceAtOrder: { type: Number, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  deliveryLocation: {
    type: String,
    required: [true, 'Delivery location is required'],
    enum: ['La Paz', 'Ablekuma', 'Other'],
  },
  deliveryAddress: {
    type: String,
    trim: true,
    default: '',
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: (v) => v.length > 0,
      message: 'Order must contain at least one item',
    },
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending',
  },
  referralCode: {
    type: String,
    default: null,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
  },
}, {
  timestamps: true,
});

// Pre-save: compute subtotal, deliveryFee, and total
orderSchema.pre('save', async function (next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.priceAtOrder * item.qty, 0);

  // Delivery fee logic
  if (this.deliveryLocation === 'Ablekuma') {
    this.deliveryFee = 0;
  } else if (this.deliveryFee === 0 || this.isNew) {
    // Fetch configurable delivery fee from Settings
    const Settings = mongoose.model('Settings');
    const settings = await Settings.findOne();
    this.deliveryFee = settings ? settings.deliveryFee : Number(process.env.DEFAULT_DELIVERY_FEE || 20);
  }

  this.total = this.subtotal + this.deliveryFee;
  next();
});

orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
