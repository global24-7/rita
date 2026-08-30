const Settings = require('../models/Settings');

// @desc    Get public settings
// @route   GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings (admin)
// @route   PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const { deliveryFee, currency, businessPhone, businessName, locations } = req.body;

    if (deliveryFee !== undefined) settings.deliveryFee = deliveryFee;
    if (currency) settings.currency = currency;
    if (businessPhone) settings.businessPhone = businessPhone;
    if (businessName) settings.businessName = businessName;
    if (locations) settings.locations = locations;

    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};
