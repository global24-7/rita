const Review = require('../models/Review');

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
      isApproved: true,
    }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a new review
// @route   POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { productId, customerName, rating, comment, isVerifiedPurchase } = req.body;

    const review = await Review.create({
      productId,
      customerName,
      rating,
      comment,
      isVerifiedPurchase: isVerifiedPurchase || false,
      isApproved: false, // requires admin approval
    });

    res.status(201).json({
      review,
      message: 'Review submitted successfully! It will appear after approval.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending (unapproved) reviews (admin)
// @route   GET /api/reviews/pending
exports.getPendingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or hide a review (admin)
// @route   PUT /api/reviews/:id/approve
exports.toggleApproval = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    // Recalculate the product's average rating
    await Review.updateProductRating(review.productId);

    res.json({ review, message: `Review ${review.isApproved ? 'approved' : 'hidden'}.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (admin)
// @route   DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate the product's average rating
    await Review.updateProductRating(productId);

    res.json({ message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
