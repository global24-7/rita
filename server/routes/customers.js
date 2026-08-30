const express = require('express');
const router = express.Router();
const {
  createCustomer,
  getCustomerByPhone,
  getWishlist,
  updateWishlist,
} = require('../controllers/customerController');

router.post('/', createCustomer);
router.get('/phone/:phone', getCustomerByPhone);
router.get('/:id/wishlist', getWishlist);
router.put('/:id/wishlist', updateWishlist);

module.exports = router;
