const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  deliveryFee: {
    type: Number,
    default: 20,
    min: 0,
  },
  currency: {
    type: String,
    default: 'GH₵',
  },
  businessPhone: {
    type: String,
    default: '059217747',
  },
  businessName: {
    type: String,
    default: 'Rita Jeans',
  },
  locations: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      locations: ['La Paz', 'Ablekuma'],
    });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
