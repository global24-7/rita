const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Skinny', 'Straight', 'Ripped', 'Mom Fit', 'Baggy', 'Wide Leg'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  saleStartsAt: {
    type: Date,
    default: null,
  },
  saleEndsAt: {
    type: Date,
    default: null,
  },
  images: [{
    type: String,
  }],
  sizes: [{
    type: String,
    enum: ['26', '28', '30', '32', '34', '36', '38', '40'],
  }],
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  isFlashSale: {
    type: Boolean,
    default: false,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: compute discounted price
productSchema.virtual('discountedPrice').get(function () {
  if (this.discountPercent > 0) {
    return Math.round(this.price - (this.price * this.discountPercent / 100));
  }
  return this.price;
});

// Virtual: check if product is currently on sale
productSchema.virtual('isCurrentlyOnSale').get(function () {
  if (!this.isFlashSale || !this.saleStartsAt || !this.saleEndsAt) return false;
  const now = new Date();
  return now >= this.saleStartsAt && now <= this.saleEndsAt;
});

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFlashSale: 1, saleEndsAt: 1 });
productSchema.index({ isNewArrival: 1 });

module.exports = mongoose.model('Product', productSchema);
