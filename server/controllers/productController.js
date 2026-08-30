const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Get all products (with filtering, search, pagination)
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      flashSale,
      newArrival,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (flashSale === 'true') {
      filter.isFlashSale = true;
      filter.saleEndsAt = { $gte: new Date() };
      filter.saleStartsAt = { $lte: new Date() };
    }
    if (newArrival === 'true') filter.isNewArrival = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    // Parse sizes if sent as a JSON string
    if (typeof productData.sizes === 'string') {
      productData.sizes = JSON.parse(productData.sizes);
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = { ...req.body };

    if (typeof updateData.sizes === 'string') {
      updateData.sizes = JSON.parse(updateData.sizes);
    }

    // If new images are uploaded, add them
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      // If existingImages is provided, keep those; otherwise replace all
      if (updateData.existingImages) {
        const existing = typeof updateData.existingImages === 'string'
          ? JSON.parse(updateData.existingImages)
          : updateData.existingImages;
        updateData.images = [...existing, ...newImages];
      } else {
        updateData.images = newImages;
      }
      delete updateData.existingImages;
    } else if (updateData.existingImages) {
      updateData.images = typeof updateData.existingImages === 'string'
        ? JSON.parse(updateData.existingImages)
        : updateData.existingImages;
      delete updateData.existingImages;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated image files
    if (product.images && product.images.length > 0) {
      product.images.forEach((imgPath) => {
        const fullPath = path.join(__dirname, '..', imgPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = ['Skinny', 'Straight', 'Ripped', 'Mom Fit', 'Baggy', 'Wide Leg'];
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
