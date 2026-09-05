import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getImageUrl, formatPrice, calculateDiscount } from '../../utils/helpers';
import QuickBuyModal from './QuickBuyModal';

const colorMap = {
  'Black': '#1a1a1a',
  'Blue': '#3b5998',
  'Light Wash': '#87CEEB',
  'Dark Wash': '#1a3a5c',
  'White': '#f5f5f5',
  'Grey': '#808080',
  'Indigo': '#3f51b5',
  'Ripped': '#c9b99a',
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product._id);
  const hasDiscount = product.discountPercent > 0;
  const discountedPrice = calculateDiscount(product.price, product.discountPercent);
  const isOnSale = product.isFlashSale && product.saleEndsAt && new Date(product.saleEndsAt) > new Date();
  const isOutOfStock = product.stock <= 0;

  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [];
  const displayImage = hovered && images.length > 1 ? images[1] : images[selectedColor] || images[0];

  const colors = product.colors || [];
  const hasMultipleImages = images.length > 1;

  const handleQuickBuy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickBuyOpen(true);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <>
      <div
        className="product-card"
        id={`product-${product._id}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link to={`/product/${product._id}`} className="product-card-link">
          <div className="product-card-image">
            {displayImage ? (
              <img
                src={getImageUrl(displayImage)}
                alt={product.name}
                loading="lazy"
                className="product-card-img"
              />
            ) : (
              <div className="product-card-placeholder">No Image</div>
            )}

            <div className="product-card-badges">
              {isOnSale && <span className="product-badge product-badge-sale">Sale</span>}
              {product.isNewArrival && <span className="product-badge product-badge-new">New</span>}
              {product.isPreOrder && <span className="product-badge product-badge-preorder">Pre Order</span>}
              {product.isBackInStock && <span className="product-badge product-badge-back">Back in Stock</span>}
              {hasDiscount && !isOnSale && (
                <span className="product-badge product-badge-sale">-{product.discountPercent}%</span>
              )}
            </div>

            <button
              className={`product-card-wishlist ${wishlisted ? 'active' : ''}`}
              onClick={handleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {wishlisted ? <FaHeart size={18} /> : <FiHeart size={18} />}
            </button>

            {!isOutOfStock ? (
              <button className="product-card-quickadd" onClick={handleQuickBuy}>
                <FiShoppingBag size={16} />
                <span>Quick Buy</span>
              </button>
            ) : (
              <button className="product-card-quickadd product-card-quickadd-waitlist" onClick={handleQuickBuy}>
                <span>Join Waitlist</span>
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

            {colors.length > 0 && (
              <div className="product-card-colors">
                {colors.map((color, idx) => (
                  <button
                    key={idx}
                    className={`product-card-swatch ${selectedColor === idx ? 'active' : ''}`}
                    style={{ background: colorMap[color] || '#ccc' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(idx);
                    }}
                    aria-label={color}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>
      </div>

      {quickBuyOpen && (
        <QuickBuyModal
          product={product}
          onClose={() => setQuickBuyOpen(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
