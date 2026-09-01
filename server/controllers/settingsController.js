const supabase = require('../config/supabase');

// @desc    Get public settings
// @route   GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    let { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    // Create default settings if none exist
    if (error || !settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('settings')
        .insert({
          delivery_fee: 20,
          currency: 'GH₵',
          business_phone: '0592117747',
          business_name: 'Rita Jeans',
          locations: ['La Paz', 'Ablekuma'],
        })
        .select()
        .single();

      if (createError) throw createError;
      settings = newSettings;
    }

    // Transform
    const transformed = {
      _id: settings.id,
      deliveryFee: settings.delivery_fee,
      currency: settings.currency,
      businessPhone: settings.business_phone,
      businessName: settings.business_name,
      locations: settings.locations || [],
      createdAt: settings.created_at,
      updatedAt: settings.updated_at,
    };

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings (admin)
// @route   PUT /api/settings
exports.updateSettings = async (req, res, next) => {
  try {
    let { data: settings } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (!settings) {
      // Create if doesn't exist
      const { data: newSettings } = await supabase
        .from('settings')
        .insert({
          delivery_fee: 20,
          currency: 'GH₵',
          business_phone: '0592117747',
          business_name: 'Rita Jeans',
          locations: ['La Paz', 'Ablekuma'],
        })
        .select()
        .single();
      settings = newSettings;
    }

    const { deliveryFee, currency, businessPhone, businessName, locations } = req.body;

    const updates = {};
    if (deliveryFee !== undefined) updates.delivery_fee = deliveryFee;
    if (currency) updates.currency = currency;
    if (businessPhone) updates.business_phone = businessPhone;
    if (businessName) updates.business_name = businessName;
    if (locations) updates.locations = locations;

    const { data: updated, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('id', settings.id)
      .select()
      .single();

    if (error) throw error;

    const transformed = {
      _id: updated.id,
      deliveryFee: updated.delivery_fee,
      currency: updated.currency,
      businessPhone: updated.business_phone,
      businessName: updated.business_name,
      locations: updated.locations || [],
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};
