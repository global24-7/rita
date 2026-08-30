const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');

// Public routes
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin routes
router.post('/', auth, upload.array('images', 5), createProduct);
router.put('/:id', auth, upload.array('images', 5), updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;
