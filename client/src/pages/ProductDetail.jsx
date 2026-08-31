import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiShare2, FiArrowLeft, FiMinus, FiPlus } from 'react-icons/fi';
import { FaHeart, FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getProduct, getProductReviews, submitReview } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import StarRating from '../components/common/StarRating';
import FlashSaleTimer from '../components/product/FlashSaleTimer';
import { getImageUrl, formatPrice, calculateDiscount, shareProduct } from '../utils/helpers';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getProduct(id);
      setProduct(res.data);
      if (res.data.sizes?.length > 0) {
        setSelectedSize(res.data.sizes[0]);
      }
    } catch (error) {
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await getProductReviews(id);
      setReviews(res.data);
    } catch (error) {
      console.error('Failed to fetch reviews');
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    addToCart(product, selectedSize, quantity);
    toast.success(`${product.name} added to cart!`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || reviewRating === 0) {
      toast.error('Please enter your name and rating');
      return;
    }
    setSubmittingReview(true);
    try {
      await submitReview({
        productId: id,
        customerName: reviewName,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted! It will appear after approval.');
      setReviewName('');
      setReviewRating(0);
      setReviewComment('');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/catalog" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPercent > 0;
  const discountedPrice = calculateDiscount(product.price, product.discountPercent);
  const isOnSale = product.isFlashSale && product.saleEndsAt && new Date(product.saleEndsAt) > new Date();
  const wishlisted = isInWishlist(product._id);

  return (
    <div className="product-detail" id="product-detail">
      <div className="container">
        <Link to="/catalog" className="back-link">
          <FiArrowLeft size={18} /> Back to Shop
        </Link>

        <div className="product-detail-grid">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="product-gallery-main">
              {product.images && product.images.length > 0 ? (
                <img
                  src={getImageUrl(product.images[selectedImage])}
                  alt={product.name}
                />
              ) : (
                <div className="product-gallery-placeholder">No Image</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="product-gallery-thumbs">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`product-thumb ${idx === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={getImageUrl(img)} alt={`${product.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <span className="product-info-category">{product.category}</span>
            <h1 className="product-info-name">{product.name}</h1>

            {product.reviewCount > 0 && (
              <div className="product-info-rating">
                <StarRating rating={product.averageRating} size="0.9rem" />
                <span>({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})</span>
              </div>
            )}

            <div className="product-info-price">
              <span className="product-price-current">{formatPrice(discountedPrice)}</span>
              {hasDiscount && (
                <>
                  <span className="product-price-original">{formatPrice(product.price)}</span>
                  <span className="product-price-discount">-{product.discountPercent}% OFF</span>
                </>
              )}
            </div>

            {isOnSale && (
              <div className="product-sale-timer">
                <span className="product-sale-label">Sale ends in:</span>
                <FlashSaleTimer endDate={product.saleEndsAt} />
              </div>
            )}

            <p className="product-info-description">{product.description}</p>

            <div className="product-info-stock">
              {product.stock > 0 ? (
                <span className="stock-in">In Stock ({product.stock} left)</span>
              ) : (
                <span className="stock-out">Out of Stock</span>
              )}
            </div>

            {/* Size Selector */}
            <div className="product-option">
              <label className="product-option-label">Size</label>
              <div className="size-selector">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="product-option">
              <label className="product-option-label">Quantity</label>
              <div className="quantity-stepper">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <FiMinus size={16} />
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <FiPlus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button
                className="btn btn-primary btn-lg product-add-btn"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <FiShoppingBag size={18} /> Add to Cart
              </button>
              <button
                className={`product-action-btn ${wishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {wishlisted ? <FaHeart size={18} /> : <FiHeart size={18} />}
              </button>
              <button
                className="product-action-btn"
                onClick={() => shareProduct(product)}
                aria-label="Share"
              >
                <FiShare2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section" id="reviews">
          <h2 className="section-title">Customer Reviews</h2>

          {reviews.length > 0 ? (
            <div className="review-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-card-header">
                    <div className="review-card-author">
                      <span className="review-name">{review.customerName}</span>
                      {review.isVerifiedPurchase && (
                        <span className="review-verified">Verified Purchase</span>
                      )}
                    </div>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="0.85rem" />
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="reviews-empty">No reviews yet. Be the first to review this product!</p>
          )}

          {/* Review Form */}
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3 className="review-form-title">Write a Review</h3>
            <div className="review-star-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`review-star ${star <= reviewRating ? 'active' : ''}`}
                  onClick={() => setReviewRating(star)}
                >
                  <FaStar size={20} />
                </button>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-input"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Comment (Optional)</label>
              <textarea
                className="form-input"
                rows="3"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingReview}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
