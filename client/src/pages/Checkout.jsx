import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiArrowRight, FiShoppingBag, FiTag, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { createOrder, getSettings, applyVoucher } from '../api';
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
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

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
  const total = cartTotal + currentDeliveryFee - voucherDiscount;

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

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Enter a voucher code');
      return;
    }
    setVoucherLoading(true);
    try {
      const res = await applyVoucher({ code: voucherCode.trim() });
      const { discount, type, value } = res.data;
      setAppliedVoucher(res.data);
      setVoucherDiscount(discount);
      toast.success(`Voucher applied! ${type === 'percentage' ? `${value}% off` : `${formatPrice(discount)} off`}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid voucher code');
      setAppliedVoucher(null);
      setVoucherDiscount(0);
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherDiscount(0);
    setVoucherCode('');
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
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
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
            <div className="empty-state-icon">
              <FiShoppingBag size={48} strokeWidth={1} />
            </div>
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
        <h1 className="page-title">Checkout</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h2 className="checkout-form-title">Delivery Details</h2>

            <div className="form-group">
              <label className="form-label" htmlFor="customerName">Full Name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                className="form-input"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
              {errors.customerName && <span className="form-error">{errors.customerName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-input"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 0592117747"
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Location</label>
              <div className="radio-group">
                {[
                  { value: 'Ablekuma', label: 'Ablekuma (Free Delivery!)' },
                  { value: 'La Paz', label: 'La Paz' },
                  { value: 'Other', label: 'Other Location' },
                ].map((opt) => (
                  <label key={opt.value} className={`radio-option ${form.deliveryLocation === opt.value ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="deliveryLocation"
                      value={opt.value}
                      checked={form.deliveryLocation === opt.value}
                      onChange={handleChange}
                    />
                    <span className="radio-label">{opt.label}</span>
                  </label>
                ))}
              </div>
              {errors.deliveryLocation && <span className="form-error">{errors.deliveryLocation}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="deliveryAddress">Delivery Address / Landmark</label>
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

            {/* Voucher Input */}
            <div className="form-group">
              <label className="form-label">
                <FiTag size={14} /> Referral Voucher
              </label>
              {appliedVoucher ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'rgba(226,176,74,0.08)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                    <FiCheck size={16} /> <strong>{appliedVoucher.code}</strong>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>
                      (-{formatPrice(voucherDiscount)})
                    </span>
                  </div>
                  <button type="button" onClick={handleRemoveVoucher} style={{
                    background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem',
                  }}>Remove</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Enter referral code"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={voucherLoading}
                    style={{
                      padding: '0 1rem',
                      background: 'var(--color-bg-alt)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: voucherLoading ? 'wait' : 'pointer',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                    }}
                  >
                    {voucherLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'} {!loading && <FiArrowRight size={16} />}
            </button>

            <p className="checkout-note">
              After placing your order, you'll be directed to confirm via WhatsApp or call.
            </p>
          </form>

          <div className="cart-summary">
            <h3 className="cart-summary-title">Order Summary</h3>
            <div className="cart-summary-rows">
              {cartItems.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="cart-summary-row">
                  <span>{item.name} (&times;{item.qty})</span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="cart-summary-divider" />
            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Delivery Fee</span>
              <span className={currentDeliveryFee === 0 ? 'text-success' : ''}>
                {currentDeliveryFee === 0 ? 'FREE' : formatPrice(currentDeliveryFee)}
              </span>
            </div>
            {voucherDiscount > 0 && (
              <div className="cart-summary-row" style={{ color: 'var(--color-primary)' }}>
                <span>Voucher Discount</span>
                <span>-{formatPrice(voucherDiscount)}</span>
              </div>
            )}
            <div className="cart-summary-divider" />
            <div className="cart-summary-row cart-summary-total">
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
