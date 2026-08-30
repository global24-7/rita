import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { createOrder, getSettings } from '../api';
import { formatPrice, getReferralCode } from '../utils/helpers';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(20);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    deliveryLocation: 'Ablekuma',
    deliveryAddress: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSettings();
      setDeliveryFee(res.data.deliveryFee);
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  const currentDeliveryFee = form.deliveryLocation === 'Ablekuma' ? 0 : deliveryFee;
  const total = cartTotal + currentDeliveryFee;

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (form.phone.trim() && !/^\d{9,15}$/.test(form.phone.replace(/\D/g, ''))) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!form.deliveryLocation) errs.deliveryLocation = 'Select a delivery location';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerName: form.customerName,
        phone: form.phone,
        deliveryLocation: form.deliveryLocation,
        deliveryAddress: form.deliveryAddress,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          size: item.size,
          priceAtOrder: item.price,
        })),
        referralCode: getReferralCode(),
      };

      const res = await createOrder(orderData);
      clearCart();
      navigate('/order-confirmation', {
        state: {
          order: res.data.order,
          whatsappLink: res.data.whatsappLink,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-state">
            <div className="icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products before checking out.</p>
            <Link to="/catalog" className="btn btn-primary">Shop Now</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page" id="checkout-page">
      <div className="container">
        <h1 style={{ marginBottom: 'var(--space-xl)' }}>Checkout</h1>

        <div className="checkout-layout">
          {/* Checkout Form */}
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2>Delivery Details</h2>

            <div className="form-group">
              <label htmlFor="customerName">Full Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                className="form-input"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.customerName && <p className="form-error">{errors.customerName}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 059217747"
              />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="deliveryLocation">Delivery Location *</label>
              <select
                id="deliveryLocation"
                name="deliveryLocation"
                className="form-select"
                value={form.deliveryLocation}
                onChange={handleChange}
              >
                <option value="Ablekuma">Ablekuma (Free Delivery!)</option>
                <option value="La Paz">La Paz</option>
                <option value="Other">Other Location</option>
              </select>
              {errors.deliveryLocation && <p className="form-error">{errors.deliveryLocation}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="deliveryAddress">Delivery Address / Landmark</label>
              <textarea
                id="deliveryAddress"
                name="deliveryAddress"
                className="form-input"
                rows="3"
                value={form.deliveryAddress}
                onChange={handleChange}
                placeholder="Describe your location or nearest landmark"
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 'var(--space-md)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              After placing your order, you'll be directed to confirm via WhatsApp or call.
            </p>
          </form>

          {/* Order Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            {cartItems.map((item) => (
              <div key={`${item.productId}-${item.size}`} className="cart-summary-row">
                <span>{item.name} (×{item.qty})</span>
                <span>{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <span style={{ color: currentDeliveryFee === 0 ? 'var(--color-success)' : 'inherit' }}>
                {currentDeliveryFee === 0 ? 'FREE' : formatPrice(currentDeliveryFee)}
              </span>
            </div>
            <div className="cart-summary-row total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
