import { useState } from 'react';
import { FiX, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { getImageUrl, formatPrice, calculateDiscount } from '../../utils/helpers';
import toast from 'react-hot-toast';
import WaitlistModal from './WaitlistModal';

const QuickBuyModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const hasDiscount = product.discountPercent > 0;
  const discountedPrice = calculateDiscount(product.price, product.discountPercent);
  const sizes = product.sizes || [];
  const images = product.images || [];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize, qty);
    toast.success(`${product.name} added to cart`);
    onClose();
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <div className="qb-overlay" onClick={handleBackdrop}>
        <div className="qb-modal">
          <button className="qb-close" onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>

          <div className="qb-content">
            <div className="qb-image">
              {images.length > 0 ? (
                <img src={getImageUrl(images[0])} alt={product.name} />
              ) : (
                <div className="product-card-placeholder">No Image</div>
              )}
            </div>

            <div className="qb-details">
              <span className="qb-category">{product.category}</span>
              <h2 className="qb-name">{product.name}</h2>
              <div className="qb-price">
                <span className="qb-price-current">{formatPrice(discountedPrice)}</span>
                {hasDiscount && (
                  <span className="qb-price-original">{formatPrice(product.price)}</span>
                )}
              </div>

              <div className="qb-sizes">
                <span className="qb-label">Size</span>
                <div className="qb-size-grid">
                  {sizes.map((size) => {
                    const isOutOfStock = product.stock <= 0;
                    return (
                      <button
                        key={size}
                        className={`qb-size-btn ${selectedSize === size ? 'selected' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                        onClick={() => {
                          if (isOutOfStock) {
                            setWaitlistOpen(true);
                          } else {
                            setSelectedSize(size);
                          }
                        }}
                        disabled={false}
                      >
                        {size}
                        {isOutOfStock && <span className="qb-size-oos-label">Waitlist</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="qb-qty">
                <span className="qb-label">Quantity</span>
                <div className="quantity-stepper">
                  <button
                    className="quantity-btn"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="quantity-value">{qty}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => setQty(qty + 1)}
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block qb-add-btn"
                onClick={handleAddToCart}
              >
                Add to Cart — {formatPrice(discountedPrice * qty)}
              </button>

              {product.stock <= 0 && (
                <button
                  className="btn btn-outline btn-block qb-waitlist-btn"
                  onClick={() => setWaitlistOpen(true)}
                >
                  Join Waitlist
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {waitlistOpen && (
        <WaitlistModal
          product={product}
          onClose={() => setWaitlistOpen(false)}
        />
      )}
    </>
  );
};

export default QuickBuyModal;
