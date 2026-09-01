const supabase = require('../config/supabase');

// @desc    Get referral dashboard for logged-in customer
// @route   GET /api/referrals/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const customerId = req.customer.id;

    // Get customer's referral code
    const { data: customer } = await supabase
      .from('customers')
      .select('referral_code')
      .eq('id', customerId)
      .single();

    // Get referral stats
    const { data: referrals } = await supabase
      .from('referrals')
      .select('id, status, referred_name, referred_email, created_at')
      .eq('referrer_id', customerId)
      .order('created_at', { ascending: false });

    const totalInvited = referrals ? referrals.length : 0;
    const totalSignedUp = referrals ? referrals.filter(r => r.status === 'signed_up' || r.status === 'first_purchase').length : 0;
    const totalPurchased = referrals ? referrals.filter(r => r.status === 'first_purchase').length : 0;

    // Get earned vouchers
    const { data: vouchers } = await supabase
      .from('vouchers')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    const activeVouchers = vouchers ? vouchers.filter(v => !v.is_used && new Date(v.expires_at) > new Date()) : [];
    const usedVouchers = vouchers ? vouchers.filter(v => v.is_used) : [];
    const pendingVouchers = referrals ? referrals.filter(r => r.status === 'signed_up' && !r.reward_issued).length : 0;

    res.json({
      referralCode: customer?.referral_code,
      stats: {
        totalInvited,
        totalSignedUp,
        totalPurchased,
        activeVouchers: activeVouchers.length,
        usedVouchers: usedVouchers.length,
        pendingRewards: pendingVouchers,
      },
      referrals: referrals || [],
      vouchers: vouchers || [],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track a referral visit (called when someone clicks referral link)
// @route   POST /api/referrals/track
exports.trackVisit = async (req, res, next) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: 'Referral code is required' });
    }

    // Verify referral code exists
    const { data: referrer } = await supabase
      .from('customers')
      .select('id, name')
      .eq('referral_code', referralCode)
      .single();

    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    // Store in cookie for tracking (30 day expiry)
    res.cookie('referral_code', referralCode, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ message: 'Referral tracked', referrerName: referrer.name });
  } catch (error) {
    next(error);
  }
};

// @desc    Process referral on signup (called internally)
// @route   POST /api/referrals/process-signup
exports.processSignup = async (req, res, next) => {
  try {
    const { referralCode, customerId, customerName, customerEmail, customerPhone } = req.body;

    if (!referralCode || !customerId) {
      return res.json({ message: 'No referral to process' });
    }

    // Find referrer
    const { data: referrer } = await supabase
      .from('customers')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    if (!referrer) {
      return res.json({ message: 'Invalid referral code' });
    }

    // Fraud prevention: block self-referral
    if (referrer.id === customerId) {
      return res.json({ message: 'Self-referral blocked' });
    }

    // Check if already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrer.id)
      .eq('referred_id', customerId)
      .single();

    if (existing) {
      return res.json({ message: 'Already referred' });
    }

    // Create referral record
    const { data: referral, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: customerId,
        referral_code: referralCode,
        status: 'signed_up',
        referred_name: customerName,
        referred_email: customerEmail,
        referred_phone: customerPhone,
      })
      .select()
      .single();

    if (error) throw error;

    // Issue 10% discount voucher to the new customer
    const discountCode = `REFER-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from('vouchers')
      .insert({
        customer_id: customerId,
        type: 'percent_discount',
        value: 10,
        code: discountCode,
        description: '10% off your first order - Referral Welcome',
        referral_id: referral.id,
        expires_at: expiresAt,
      });

    res.json({
      message: 'Referral processed',
      referralId: referral.id,
      discountCode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process referral reward on first purchase (called internally)
// @route   POST /api/referrals/process-purchase
exports.processPurchase = async (req, res, next) => {
  try {
    const { customerId, orderId } = req.body;

    if (!customerId) {
      return res.json({ message: 'No customer to process' });
    }

    // Find referral where this customer is the referred person
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', customerId)
      .eq('status', 'signed_up')
      .single();

    if (!referral) {
      return res.json({ message: 'No pending referral found' });
    }

    // Update referral status to first_purchase
    await supabase
      .from('referrals')
      .update({
        status: 'first_purchase',
        first_order_id: orderId,
      })
      .eq('id', referral.id);

    // Issue free delivery voucher to referrer
    const deliveryCode = `FREEDEL-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from('vouchers')
      .insert({
        customer_id: referral.referrer_id,
        type: 'free_delivery',
        value: 0,
        code: deliveryCode,
        description: 'Free delivery - Referral reward',
        referral_id: referral.id,
        expires_at: expiresAt,
      });

    // Mark reward as issued
    await supabase
      .from('referrals')
      .update({ reward_issued: true })
      .eq('id', referral.id);

    res.json({
      message: 'Referral reward issued',
      referrerVoucher: deliveryCode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply a voucher to an order
// @route   POST /api/referrals/apply-voucher
exports.applyVoucher = async (req, res, next) => {
  try {
    const { voucherCode, orderId } = req.body;
    const customerId = req.customer.id;

    if (!voucherCode) {
      return res.status(400).json({ message: 'Voucher code is required' });
    }

    // Find voucher
    const { data: voucher } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', voucherCode)
      .eq('customer_id', customerId)
      .single();

    if (!voucher) {
      return res.status(404).json({ message: 'Invalid voucher code' });
    }

    if (voucher.is_used) {
      return res.status(400).json({ message: 'Voucher already used' });
    }

    if (new Date(voucher.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Voucher expired' });
    }

    // If orderId provided, apply immediately
    if (orderId) {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      let discount = 0;
      if (voucher.type === 'free_delivery') {
        discount = order.delivery_fee;
      } else if (voucher.type === 'percent_discount') {
        discount = Math.round(order.subtotal * voucher.value / 100);
      }

      await supabase
        .from('orders')
        .update({
          voucher_id: voucher.id,
          voucher_discount: discount,
          total: order.total - discount,
        })
        .eq('id', orderId);

      await supabase
        .from('vouchers')
        .update({ is_used: true, used_at: new Date().toISOString(), used_in_order_id: orderId })
        .eq('id', voucher.id);

      return res.json({ message: 'Voucher applied', discount, voucher });
    }

    // Just validate and return voucher info
    res.json({ message: 'Voucher valid', voucher });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin referral analytics
// @route   GET /api/referrals/admin/analytics
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // Total referrals
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true });

    // Signed up referrals
    const { count: signedUp } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .in('status', ['signed_up', 'first_purchase']);

    // First purchase referrals
    const { count: firstPurchase } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'first_purchase');

    // Total vouchers issued
    const { count: totalVouchers } = await supabase
      .from('vouchers')
      .select('*', { count: 'exact', head: true });

    // Active vouchers
    const { count: activeVouchers } = await supabase
      .from('vouchers')
      .select('*', { count: 'exact', head: true })
      .eq('is_used', false);

    // Recent referrals with customer names
    const { data: recentReferrals } = await supabase
      .from('referrals')
      .select(`
        id, status, referred_name, referred_email, created_at,
        referrer:customers!referrals_referrer_id_fkey(name, email, referral_code)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    // Top referrers
    const { data: topReferrers } = await supabase
      .from('referrals')
      .select('referrer_id, customers!referrals_referrer_id_fkey(name, email)')
      .in('status', ['signed_up', 'first_purchase']);

    // Aggregate top referrers in JS
    const referrerCounts = {};
    if (topReferrers) {
      topReferrers.forEach(r => {
        const id = r.referrer_id;
        if (!referrerCounts[id]) {
          referrerCounts[id] = {
            name: r.customers?.name || 'Unknown',
            email: r.customers?.email || '',
            count: 0,
          };
        }
        referrerCounts[id].count++;
      });
    }

    const topReferrersList = Object.values(referrerCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      totalReferrals: totalReferrals || 0,
      signedUp: signedUp || 0,
      firstPurchase: firstPurchase || 0,
      totalVouchers: totalVouchers || 0,
      activeVouchers: activeVouchers || 0,
      recentReferrals: recentReferrals || [],
      topReferrers: topReferrersList,
    });
  } catch (error) {
    next(error);
  }
};
