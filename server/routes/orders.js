const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { customerAuth } = require('../middleware/customerAuth');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getAnalytics,
  getMyOrders,
} = require('../controllers/orderController');

// Public routes
router.post('/', createOrder);

// Customer routes
router.get('/my', customerAuth, getMyOrders);

// Admin routes
router.get('/analytics', auth, getAnalytics);
router.get('/', auth, getOrders);
router.get('/:id', auth, getOrder);
router.put('/:id/status', auth, updateOrderStatus);

module.exports = router;
