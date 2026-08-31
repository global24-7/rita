import { Link } from 'react-router-dom';
import { FiHeart, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getImageUrl, formatPrice, calculateDiscount } from '../utils/helpers';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiHeart size={48} strokeWidth={1} />
            </div>
            <h3>Your wishlist is empty</h3>
            <p>Save your favourite jeans for later.</p>
            <Link to="/catalog" className="btn btn-primary">
              Browse Jeans <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page" id="wishlist-page">
      <div className="container">
        <h1 className="page-title">My Wishlist ({wishlistItems.length})</h1>
        <div className="product-grid product-grid-3">
          {wishlistItems.map((item) => {
            const discountedPrice = calculateDiscount(item.price, item.discountPercent);
            const hasDiscount = item.discountPercent > 0;
            return (
              <div key={item._id} className="product-card">
                <Link to={`/product/${item._id}`} className="product-card-link">
                  <div className="product-card-image">
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        loading="lazy"
                        className="product-card-img"
                      />
                    ) : (
                      <div className="product-card-placeholder">No Image</div>
                    )}
                    <button
                      className="product-card-wishlist active"
                      onClick={(e) => { e.preventDefault(); removeFromWishlist(item._id); }}
                      aria-label="Remove from wishlist"
                    >
                      <FiHeart size={18} />
                    </button>
                  </div>
                  <div className="product-card-body">
                    <span className="product-card-category">{item.category}</span>
                    <h3 className="product-card-name">{item.name}</h3>
                    <div className="product-card-pricing">
                      <span className="product-card-price">{formatPrice(discountedPrice)}</span>
                      {hasDiscount && (
                        <span className="product-card-price-original">{formatPrice(item.price)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
