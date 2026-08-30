import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { getImageUrl, formatPrice } from '../utils/helpers';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state">
            <div className="icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some amazing jeans to get started!</p>
            <Link to="/catalog" className="btn btn-primary">
              <FiShoppingBag /> Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" id="cart-page">
      <div className="container">
        <h1 style={{ marginBottom: 'var(--space-xl)' }}>Shopping Cart ({cartCount})</h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="cart-item">
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  ) : (
                    <div className="product-placeholder" style={{ fontSize: '1.5rem', height: '100%' }}>👖</div>
                  )}
                </div>
                <div className="cart-item-details">
                  <span className="cart-item-name">
                    <Link to={`/product/${item.productId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.name}
                    </Link>
                  </span>
                  <span className="cart-item-meta">Size: {item.size}</span>
                  <span className="price-current" style={{ fontSize: '1rem' }}>
                    {formatPrice(item.price)}
                  </span>
                  <div className="cart-item-actions">
                    <div className="quantity-control">
                      <button onClick={() => updateQuantity(item.productId, item.size, item.qty - 1)}>
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.qty + 1)}>
                        +
                      </button>
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.productId, item.size)}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearCart}
              style={{ alignSelf: 'flex-start' }}
            >
              Clear Cart
            </button>
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="cart-summary-row">
                <span>{item.name} × {item.qty}</span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="cart-summary-row total">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.75rem 0' }}>
              Delivery fee calculated at checkout. Free delivery in Ablekuma!
            </p>
            <Link to="/checkout" className="btn btn-primary btn-block btn-lg">
              Checkout <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
