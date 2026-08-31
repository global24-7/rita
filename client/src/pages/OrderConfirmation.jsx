import { useLocation, Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { FiPhone, FiCheckCircle, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const order = state?.order;
  const whatsappLink = state?.whatsappLink;

  if (!order) {
    return (
      <div className="order-confirmation">
        <div className="container">
          <div className="empty-state">
            <h3>No Order Found</h3>
            <p>It looks like you navigated here directly. Please place an order first.</p>
            <Link to="/catalog" className="btn btn-primary">
              Shop Now <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation" id="order-confirmation">
      <div className="container">
        <div className="confirmation-card">
          <div className="confirmation-icon">
            <FiCheckCircle size={56} />
          </div>
          <h1 className="confirmation-title">Order Placed Successfully!</h1>
          <p className="confirmation-text">
            Thank you, {order.customerName}! Your order has been received.
            Please confirm your order with Rita via WhatsApp or call.
          </p>

          <div className="confirmation-order-id">
            Order ID: {order._id}
          </div>

          <div className="confirmation-details">
            <h3>Order Details</h3>
            <div className="cart-summary-rows">
              {order.items?.map((item, idx) => (
                <div key={idx} className="cart-summary-row">
                  <span>{item.name} (Size: {item.size}) &times; {item.qty}</span>
                  <span>GH&cent;{(item.priceAtOrder * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="cart-summary-divider" />
            <div className="cart-summary-row">
              <span>Delivery ({order.deliveryLocation})</span>
              <span className={order.deliveryFee === 0 ? 'text-success' : ''}>
                {order.deliveryFee === 0 ? 'FREE' : `GH\u20B5${order.deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="cart-summary-row cart-summary-total">
              <span>Total</span>
              <span>GH&cent;{order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="confirmation-actions">
            <a
              href={whatsappLink || `https://wa.me/233592117747`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-lg btn-block"
            >
              <FaWhatsapp size={18} /> Confirm on WhatsApp
            </a>
            <a href="tel:0592117747" className="btn btn-outline btn-lg btn-block">
              <FiPhone size={18} /> Call to Confirm
            </a>
            <Link to="/catalog" className="btn btn-ghost btn-block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
