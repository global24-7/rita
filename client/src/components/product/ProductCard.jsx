import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import StarRating from '../common/StarRating';
import { useWishlist } from '../../context/WishlistContext';
import { getImageUrl, formatPrice, calculateDiscount } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product._id);
  const hasDiscount = product.discountPercent > 0;
  const discountedPrice = calculateDiscount(product.price, product.discountPercent);
  const isOnSale = product.isFlashSale && product.saleEndsAt && new Date(product.saleEndsAt) > new Date();

  return (
    <div className="product-card" id={`product-${product._id}`}>
      <div className="product-card-image">
        {product.images && product.images.length > 0 ? (
          <Link to={`/product/${product._id}`}>
            <img
              src={getImageUrl(product.images[0])}
              alt={product.name}
              loading="lazy"
            />
          </Link>
        ) : (
          <Link to={`/product/${product._id}`}>
            <div className="product-placeholder">👖</div>
          </Link>
        )}

        <div className="product-card-badges">
          {isOnSale && <span className="badge badge-sale">🔥 Sale</span>}
          {product.isNewArrival && <span className="badge badge-new">New</span>}
          {hasDiscount && (
            <span className="badge badge-sale">-{product.discountPercent}%</span>
          )}
        </div>

        <div className="product-card-actions">
          <button
            className={wishlisted ? 'wishlisted' : ''}
            onClick={() => toggleWishlist(product)}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {wishlisted ? <FaHeart /> : <FiHeart />}
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-name">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>

        {product.reviewCount > 0 && (
          <div className="product-card-rating">
            <StarRating rating={product.averageRating} size="0.8rem" />
            <span className="count">({product.reviewCount})</span>
          </div>
        )}

        <div className="product-card-footer">
          <div className="price-display">
            <span className="price-current">{formatPrice(discountedPrice)}</span>
            {hasDiscount && (
              <span className="price-original">{formatPrice(product.price)}</span>
            )}
          </div>
          {product.stock > 0 ? (
            <span className="badge badge-stock">In Stock</span>
          ) : (
            <span className="badge badge-out">Sold Out</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
