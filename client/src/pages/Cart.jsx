import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { getImageUrl, formatPrice } from '../utils/helpers';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiShoppingBag size={48} strokeWidth={1} />
            </div>
            <h3>Your cart is empty</h3>
            <p>Add some amazing jeans to get started.</p>
            <Link to="/catalog" className="btn btn-primary">
              Start Shopping <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" id="cart-page">
      <div className="container">
        <h1 className="page-title">Shopping Cart ({cartCount})</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="cart-item">
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  ) : (
                    <div className="cart-item-placeholder">No Image</div>
                  )}
                </div>
                <div className="cart-item-details">
                  <Link to={`/product/${item.productId}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <span className="cart-item-size">Size: {item.size}</span>
                  <span className="cart-item-price">{formatPrice(item.price)}</span>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-stepper">
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.productId, item.size, item.qty - 1)}
                      disabled={item.qty <= 1}
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="quantity-value">{item.qty}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.productId, item.size, item.qty + 1)}
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <span className="cart-item-total">{formatPrice(item.price * item.qty)}</span>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.productId, item.size)}
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" onClick={clearCart}>
              Clear Cart
            </button>
          </div>

          <div className="cart-summary">
            <h3 className="cart-summary-title">Order Summary</h3>
            <div className="cart-summary-rows">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="cart-summary-row">
                  <span>{item.name} &times; {item.qty}</span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="cart-summary-divider" />
            <div className="cart-summary-row cart-summary-total">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <p className="cart-summary-note">
              Delivery fee calculated at checkout. Free delivery in Ablekuma.
            </p>
            <Link to="/checkout" className="btn btn-primary btn-lg btn-block">
              Checkout <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
