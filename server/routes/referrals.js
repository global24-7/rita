const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { customerAuth } = require('../middleware/customerAuth');
const {
  getDashboard,
  trackVisit,
  processSignup,
  processPurchase,
  applyVoucher,
  getAdminAnalytics,
} = require('../controllers/referralController');

// Customer routes
router.get('/dashboard', customerAuth, getDashboard);
router.post('/apply-voucher', customerAuth, applyVoucher);

// Public routes
router.post('/track', trackVisit);
router.post('/process-signup', processSignup);
router.post('/process-purchase', processPurchase);

// Admin routes
router.get('/admin/analytics', auth, getAdminAnalytics);

module.exports = router;
