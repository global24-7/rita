const express = require('express');
const router = express.Router();
const { customerAuth } = require('../middleware/customerAuth');
const {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  createCustomer,
  getCustomerByPhone,
  getWishlist,
  updateWishlist,
} = require('../controllers/customerController');

// Auth routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.post('/logout', logoutCustomer);
router.get('/me', customerAuth, getMe);
router.put('/me', customerAuth, updateProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password', resetPassword);

// Existing routes
router.post('/', createCustomer);
router.get('/phone/:phone', getCustomerByPhone);
router.get('/:id/wishlist', getWishlist);
router.put('/:id/wishlist', updateWishlist);

module.exports = router;
