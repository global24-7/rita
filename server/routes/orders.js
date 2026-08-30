const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  getAnalytics,
} = require('../controllers/orderController');

// Public routes
router.post('/', createOrder);

// Admin routes
router.get('/analytics', auth, getAnalytics);
router.get('/', auth, getOrders);
router.get('/:id', auth, getOrder);
router.put('/:id/status', auth, updateOrderStatus);

module.exports = router;
