const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProductReviews,
  createReview,
  getPendingReviews,
  getAllReviews,
  toggleApproval,
  deleteReview,
} = require('../controllers/reviewController');

// Public routes
router.get('/:productId', getProductReviews);
router.post('/', createReview);

// Admin routes
router.get('/', auth, getAllReviews);
router.get('/pending/list', auth, getPendingReviews);
router.put('/:id/approve', auth, toggleApproval);
router.delete('/:id', auth, deleteReview);

module.exports = router;
