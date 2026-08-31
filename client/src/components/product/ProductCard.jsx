import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getImageUrl, formatPrice, calculateDiscount } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product._id);
  const hasDiscount = product.discountPercent > 0;
  const discountedPrice = calculateDiscount(product.price, product.discountPercent);
  const isOnSale = product.isFlashSale && product.saleEndsAt && new Date(product.saleEndsAt) > new Date();

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (product.sizes && product.sizes.length > 0) {
      addToCart(product, product.sizes[0], 1);
    }
  };

  return (
    <div className="product-card" id={`product-${product._id}`}>
      <Link to={`/product/${product._id}`} className="product-card-link">
        <div className="product-card-image">
          {product.images && product.images.length > 0 ? (
            <img
              src={getImageUrl(product.images[0])}
              alt={product.name}
              loading="lazy"
              className="product-card-img"
            />
          ) : (
            <div className="product-card-placeholder">No Image</div>
          )}

          <div className="product-card-badges">
            {isOnSale && <span className="product-badge product-badge-sale">Sale</span>}
            {hasDiscount && !isOnSale && (
              <span className="product-badge product-badge-sale">-{product.discountPercent}%</span>
            )}
            {product.isNewArrival && <span className="product-badge product-badge-new">New</span>}
          </div>

          <button
            className={`product-card-wishlist ${wishlisted ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {wishlisted ? <FaHeart size={18} /> : <FiHeart size={18} />}
          </button>

          {product.stock > 0 && (
            <button className="product-card-quickadd" onClick={handleQuickAdd}>
              <FiShoppingBag size={16} />
              <span>Quick Add</span>
            </button>
          )}
        </div>

        <div className="product-card-body">
          <span className="product-card-category">{product.category}</span>
          <h3 className="product-card-name">{product.name}</h3>
          <div className="product-card-pricing">
            <span className="product-card-price">{formatPrice(discountedPrice)}</span>
            {hasDiscount && (
              <span className="product-card-price-original">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
