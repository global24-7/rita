import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiShare2, FiArrowLeft } from 'react-icons/fi';
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

  // Review form state
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
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
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
        <Link to="/catalog" className="btn btn-ghost btn-sm" style={{ marginBottom: 'var(--space-lg)' }}>
          <FiArrowLeft /> Back to Shop
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
                <div className="product-placeholder" style={{ height: '100%' }}>👖</div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="product-gallery-thumbs">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`product-gallery-thumb ${idx === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={getImageUrl(img)} alt={`${product.name} ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div>
              <span className="product-card-category">{product.category}</span>
              <h1>{product.name}</h1>
            </div>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StarRating rating={product.averageRating} />
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="price-display">
              <span className="price-current" style={{ fontSize: '2rem' }}>
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="price-original" style={{ fontSize: '1.2rem' }}>
                    {formatPrice(product.price)}
                  </span>
                  <span className="price-discount">-{product.discountPercent}% OFF</span>
                </>
              )}
            </div>

            {/* Flash Sale Timer */}
            {isOnSale && (
              <div>
                <p style={{ fontSize: '0.85rem', color: '#ff4444', fontWeight: 600, marginBottom: '0.5rem' }}>
                  ⚡ Sale ends in:
                </p>
                <FlashSaleTimer endDate={product.saleEndsAt} />
              </div>
            )}

            {/* Description */}
            <p className="product-description">{product.description}</p>

            {/* Stock */}
            <div>
              {product.stock > 0 ? (
                <span className="badge badge-stock">✓ In Stock ({product.stock} left)</span>
              ) : (
                <span className="badge badge-out">✗ Out of Stock</span>
              )}
            </div>

            {/* Size Selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Size
              </label>
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
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quantity
              </label>
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions-row">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                style={{ flex: 1 }}
              >
                <FiShoppingBag /> Add to Cart
              </button>
              <button
                className={`btn ${wishlisted ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleWishlist(product)}
                style={{ padding: '1rem' }}
              >
                {wishlisted ? <FaHeart /> : <FiHeart />}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => shareProduct(product)}
                style={{ padding: '1rem' }}
              >
                <FiShare2 />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section" id="reviews">
          <h2 className="section-title" style={{ textAlign: 'left' }}>
            Customer <span>Reviews</span>
          </h2>

          {/* Review List */}
          {reviews.length > 0 ? (
            <div className="review-list">
              {reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <div>
                      <span className="review-author">{review.customerName}</span>
                      {review.isVerifiedPurchase && (
                        <span className="badge badge-stock" style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>
                          Verified Purchase
                        </span>
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
            <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet. Be the first!</p>
          )}

          {/* Review Form */}
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>Write a Review</h3>
            <div className="star-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= reviewRating ? 'active' : ''}
                  onClick={() => setReviewRating(star)}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <div className="form-group">
              <label>Your Name</label>
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
              <label>Comment (Optional)</label>
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
