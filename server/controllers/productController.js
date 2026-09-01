const supabase = require('../config/supabase');
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

    let query = supabase.from('products').select('*', { count: 'exact' });

    // Filters
    if (category) {
      query = query.eq('category', category);
    }
    if (flashSale === 'true') {
      query = query.eq('is_flash_sale', true)
        .lte('sale_starts_at', new Date().toISOString())
        .gte('sale_ends_at', new Date().toISOString());
    }
    if (newArrival === 'true') {
      query = query.eq('is_new_arrival', true);
    }
    if (minPrice) {
      query = query.gte('price', Number(minPrice));
    }
    if (maxPrice) {
      query = query.lte('price', Number(maxPrice));
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('average_rating', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data: products, count, error } = await query;

    if (error) throw error;

    // Transform snake_case to camelCase for frontend compatibility
    const transformed = products.map(p => ({
      _id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      discountPercent: p.discount_percent,
      saleStartsAt: p.sale_starts_at,
      saleEndsAt: p.sale_ends_at,
      images: p.images || [],
      sizes: p.sizes || [],
      stock: p.stock,
      isNewArrival: p.is_new_arrival,
      isFlashSale: p.is_flash_sale,
      averageRating: p.average_rating,
      reviewCount: p.review_count,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      // Virtuals
      discountedPrice: p.discount_percent > 0
        ? Math.round(p.price - (p.price * p.discount_percent / 100))
        : p.price,
      isCurrentlyOnSale: p.is_flash_sale && p.sale_starts_at && p.sale_ends_at
        ? new Date() >= new Date(p.sale_starts_at) && new Date() <= new Date(p.sale_ends_at)
        : false,
    }));

    res.json({
      products: transformed,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Transform
    const transformed = {
      _id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      discountPercent: product.discount_percent,
      saleStartsAt: product.sale_starts_at,
      saleEndsAt: product.sale_ends_at,
      images: product.images || [],
      sizes: product.sizes || [],
      stock: product.stock,
      isNewArrival: product.is_new_arrival,
      isFlashSale: product.is_flash_sale,
      averageRating: product.average_rating,
      reviewCount: product.review_count,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      discountedPrice: product.discount_percent > 0
        ? Math.round(product.price - (product.price * product.discount_percent / 100))
        : product.price,
      isCurrentlyOnSale: product.is_flash_sale && product.sale_starts_at && product.sale_ends_at
        ? new Date() >= new Date(product.sale_starts_at) && new Date() <= new Date(product.sale_ends_at)
        : false,
    };

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    // Parse sizes if sent as a JSON string or comma-separated
    if (typeof productData.sizes === 'string') {
      try {
        productData.sizes = JSON.parse(productData.sizes);
      } catch {
        productData.sizes = productData.sizes.split(',').map(s => s.trim());
      }
    }

    // Parse boolean fields
    if (typeof productData.isNewArrival === 'string') {
      productData.isNewArrival = productData.isNewArrival === 'true';
    }
    if (typeof productData.isFlashSale === 'string') {
      productData.isFlashSale = productData.isFlashSale === 'true';
    }

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: Number(productData.price),
        discount_percent: Number(productData.discountPercent) || 0,
        sale_starts_at: productData.saleStartsAt || null,
        sale_ends_at: productData.saleEndsAt || null,
        images: images,
        sizes: productData.sizes || [],
        stock: Number(productData.stock) || 0,
        is_new_arrival: productData.isNewArrival || false,
        is_flash_sale: productData.isFlashSale || false,
      })
      .select()
      .single();

    if (error) throw error;

    // Transform response
    const transformed = {
      _id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      discountPercent: product.discount_percent,
      images: product.images || [],
      sizes: product.sizes || [],
      stock: product.stock,
      isNewArrival: product.is_new_arrival,
      isFlashSale: product.is_flash_sale,
      createdAt: product.created_at,
    };

    res.status(201).json(transformed);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Parse sizes
    if (typeof updateData.sizes === 'string') {
      try {
        updateData.sizes = JSON.parse(updateData.sizes);
      } catch {
        updateData.sizes = updateData.sizes.split(',').map(s => s.trim());
      }
    }

    // Parse booleans
    if (typeof updateData.isNewArrival === 'string') {
      updateData.isNewArrival = updateData.isNewArrival === 'true';
    }
    if (typeof updateData.isFlashSale === 'string') {
      updateData.isFlashSale = updateData.isFlashSale === 'true';
    }

    // Get existing product
    const { data: existing } = await supabase
      .from('products')
      .select('images')
      .eq('id', req.params.id)
      .single();

    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle images
    let images = existing.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      if (updateData.existingImages) {
        const existingImages = typeof updateData.existingImages === 'string'
          ? JSON.parse(updateData.existingImages)
          : updateData.existingImages;
        images = [...existingImages, ...newImages];
      } else {
        images = newImages;
      }
    } else if (updateData.existingImages) {
      images = typeof updateData.existingImages === 'string'
        ? JSON.parse(updateData.existingImages)
        : updateData.existingImages;
    }

    // Build update object
    const updates = {};
    if (updateData.name) updates.name = updateData.name;
    if (updateData.description) updates.description = updateData.description;
    if (updateData.category) updates.category = updateData.category;
    if (updateData.price !== undefined) updates.price = Number(updateData.price);
    if (updateData.discountPercent !== undefined) updates.discount_percent = Number(updateData.discountPercent);
    if (updateData.saleStartsAt !== undefined) updates.sale_starts_at = updateData.saleStartsAt;
    if (updateData.saleEndsAt !== undefined) updates.sale_ends_at = updateData.saleEndsAt;
    if (updateData.sizes) updates.sizes = updateData.sizes;
    if (updateData.stock !== undefined) updates.stock = Number(updateData.stock);
    if (updateData.isNewArrival !== undefined) updates.is_new_arrival = updateData.isNewArrival;
    if (updateData.isFlashSale !== undefined) updates.is_flash_sale = updateData.isFlashSale;
    updates.images = images;

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Transform
    const transformed = {
      _id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      discountPercent: product.discount_percent,
      saleStartsAt: product.sale_starts_at,
      saleEndsAt: product.sale_ends_at,
      images: product.images || [],
      sizes: product.sizes || [],
      stock: product.stock,
      isNewArrival: product.is_new_arrival,
      isFlashSale: product.is_flash_sale,
      averageRating: product.average_rating,
      reviewCount: product.review_count,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('images')
      .eq('id', req.params.id)
      .single();

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

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

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
