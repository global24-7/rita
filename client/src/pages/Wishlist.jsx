import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl, formatPrice, calculateDiscount } from '../utils/helpers';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="empty-state">
            <div className="icon"><FiHeart /></div>
            <h3>Your wishlist is empty</h3>
            <p>Save your favourite jeans for later!</p>
            <Link to="/catalog" className="btn btn-primary">
              <FiShoppingBag /> Browse Jeans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page" id="wishlist-page">
      <div className="container">
        <h1>My Wishlist ({wishlistItems.length})</h1>
        <div className="product-grid">
          {wishlistItems.map((item) => {
            const discountedPrice = calculateDiscount(item.price, item.discountPercent);
            const hasDiscount = item.discountPercent > 0;
            return (
              <div key={item._id} className="product-card">
                <div className="product-card-image">
                  {item.image ? (
                    <Link to={`/product/${item._id}`}>
                      <img src={getImageUrl(item.image)} alt={item.name} loading="lazy" />
                    </Link>
                  ) : (
                    <Link to={`/product/${item._id}`}>
                      <div className="product-placeholder">👖</div>
                    </Link>
                  )}
                </div>
                <div className="product-card-body">
                  <span className="product-card-category">{item.category}</span>
                  <h3 className="product-card-name">
                    <Link to={`/product/${item._id}`}>{item.name}</Link>
                  </h3>
                  <div className="product-card-footer">
                    <div className="price-display">
                      <span className="price-current">{formatPrice(discountedPrice)}</span>
                      {hasDiscount && (
                        <span className="price-original">{formatPrice(item.price)}</span>
                      )}
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeFromWishlist(item._id)}
                      style={{ color: 'var(--color-danger)' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
