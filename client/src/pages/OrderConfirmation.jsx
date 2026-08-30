import { useLocation, Link } from 'react-router-dom';
import { FaWhatsapp } from 'react-icons/fa';
import { FiPhone, FiCheckCircle, FiShoppingBag } from 'react-icons/fi';

const OrderConfirmation = () => {
  const { state } = useLocation();
  const order = state?.order;
  const whatsappLink = state?.whatsappLink;

  if (!order) {
    return (
      <div className="order-confirmation">
        <h1>No Order Found</h1>
        <p>It looks like you navigated here directly. Please place an order first.</p>
        <Link to="/catalog" className="btn btn-primary">
          <FiShoppingBag /> Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="order-confirmation" id="order-confirmation">
      <div className="success-icon">
        <FiCheckCircle />
      </div>
      <h1>Order Placed Successfully!</h1>
      <p>
        Thank you, {order.customerName}! Your order has been received.
        Please confirm your order with Rita via WhatsApp or call.
      </p>

      <div className="order-id">
        Order ID: {order._id}
      </div>

      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        textAlign: 'left',
        marginBottom: 'var(--space-xl)',
      }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Order Details</h3>
        {order.items?.map((item, idx) => (
          <div key={idx} className="cart-summary-row">
            <span>{item.name} (Size: {item.size}) × {item.qty}</span>
            <span>GH₵{(item.priceAtOrder * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="cart-summary-row">
          <span>Delivery ({order.deliveryLocation})</span>
          <span style={{ color: order.deliveryFee === 0 ? 'var(--color-success)' : 'inherit' }}>
            {order.deliveryFee === 0 ? 'FREE' : `GH₵${order.deliveryFee.toFixed(2)}`}
          </span>
        </div>
        <div className="cart-summary-row total">
          <span>Total</span>
          <span>GH₵{order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="actions">
        <a
          href={whatsappLink || `https://wa.me/23359217747`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-lg btn-block"
          style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)' }}
        >
          <FaWhatsapp /> Confirm on WhatsApp
        </a>
        <a href="tel:059217747" className="btn btn-secondary btn-lg btn-block">
          <FiPhone /> Call to Confirm
        </a>
        <Link to="/catalog" className="btn btn-ghost btn-block">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
