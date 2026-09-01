const supabase = require('../config/supabase');

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', req.params.productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformed = (reviews || []).map(r => ({
      _id: r.id,
      productId: r.product_id,
      customerName: r.customer_name,
      rating: r.rating,
      comment: r.comment,
      isVerifiedPurchase: r.is_verified_purchase,
      isApproved: r.is_approved,
      createdAt: r.created_at,
    }));

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a new review
// @route   POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { productId, customerName, rating, comment, isVerifiedPurchase } = req.body;

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        customer_name: customerName,
        rating,
        comment: comment || '',
        is_verified_purchase: isVerifiedPurchase || false,
        is_approved: false,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      review: {
        _id: review.id,
        productId: review.product_id,
        customerName: review.customer_name,
        rating: review.rating,
        comment: review.comment,
        isVerifiedPurchase: review.is_verified_purchase,
        isApproved: review.is_approved,
        createdAt: review.created_at,
      },
      message: 'Review submitted successfully! It will appear after approval.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending (unapproved) reviews (admin)
// @route   GET /api/reviews/pending/list
exports.getPendingReviews = async (req, res, next) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformed = (reviews || []).map(r => ({
      _id: r.id,
      productId: r.product_id,
      productName: r.products?.name || '',
      customerName: r.customer_name,
      rating: r.rating,
      comment: r.comment,
      isVerifiedPurchase: r.is_verified_purchase,
      isApproved: r.is_approved,
      createdAt: r.created_at,
    }));

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformed = (reviews || []).map(r => ({
      _id: r.id,
      productId: r.product_id,
      productName: r.products?.name || '',
      customerName: r.customer_name,
      rating: r.rating,
      comment: r.comment,
      isVerifiedPurchase: r.is_verified_purchase,
      isApproved: r.is_approved,
      createdAt: r.created_at,
    }));

    res.json(transformed);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or hide a review (admin)
// @route   PUT /api/reviews/:id/approve
exports.toggleApproval = async (req, res, next) => {
  try {
    // Get current review
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Toggle approval
    const newApprovalStatus = !review.is_approved;

    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update({ is_approved: newApprovalStatus })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Trigger recalculates via SQL trigger, but let's also do it manually for safety
    const { data: approvedReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', review.product_id)
      .eq('is_approved', true);

    let avgRating = 0;
    let reviewCount = 0;
    if (approvedReviews && approvedReviews.length > 0) {
      const sum = approvedReviews.reduce((s, r) => s + r.rating, 0);
      avgRating = Math.round((sum / approvedReviews.length) * 100) / 100;
      reviewCount = approvedReviews.length;
    }

    await supabase
      .from('products')
      .update({ average_rating: avgRating, review_count: reviewCount })
      .eq('id', review.product_id);

    res.json({
      review: {
        _id: updatedReview.id,
        productId: updatedReview.product_id,
        customerName: updatedReview.customer_name,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        isApproved: updatedReview.is_approved,
        createdAt: updatedReview.created_at,
      },
      message: `Review ${newApprovalStatus ? 'approved' : 'hidden'}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (admin)
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('product_id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const productId = review.product_id;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    // Recalculate product rating
    const { data: approvedReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true);

    let avgRating = 0;
    let reviewCount = 0;
    if (approvedReviews && approvedReviews.length > 0) {
      const sum = approvedReviews.reduce((s, r) => s + r.rating, 0);
      avgRating = Math.round((sum / approvedReviews.length) * 100) / 100;
      reviewCount = approvedReviews.length;
    }

    await supabase
      .from('products')
      .update({ average_rating: avgRating, review_count: reviewCount })
      .eq('id', productId);

    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
