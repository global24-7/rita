import { useState } from 'react';
import { FiX, FiMail } from 'react-icons/fi';
import { getImageUrl } from '../../utils/helpers';
import toast from 'react-hot-toast';

const WaitlistModal = ({ product, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    // Store in localStorage for now (would be API call in production)
    const waitlist = JSON.parse(localStorage.getItem('ritaWaitlist') || '[]');
    if (!waitlist.find((w) => w.productId === product._id && w.email === email)) {
      waitlist.push({ productId: product._id, productName: product.name, email, createdAt: new Date().toISOString() });
      localStorage.setItem('ritaWaitlist', JSON.stringify(waitlist));
    }
    setSubmitted(true);
    toast.success("You're on the waitlist!");
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="qb-overlay" onClick={handleBackdrop}>
      <div className="qb-modal qb-modal-waitlist">
        <button className="qb-close" onClick={onClose} aria-label="Close">
          <FiX size={20} />
        </button>

        <div className="qb-content">
          <div className="qb-image">
            {product.images?.[0] ? (
              <img src={getImageUrl(product.images[0])} alt={product.name} />
            ) : (
              <div className="product-card-placeholder">No Image</div>
            )}
          </div>

          <div className="qb-details">
            <span className="qb-category">{product.category}</span>
            <h2 className="qb-name">{product.name}</h2>

            {submitted ? (
              <div className="waitlist-success">
                <FiMail size={32} />
                <h3>You're on the list!</h3>
                <p>We'll email you at <strong>{email}</strong> when this item is back in stock.</p>
                <button className="btn btn-primary btn-block" onClick={onClose}>Done</button>
              </div>
            ) : (
              <>
                <p className="waitlist-text">
                  This item is currently out of stock. Enter your email and we'll notify you the moment it's back.
                </p>
                <form onSubmit={handleSubmit} className="waitlist-form">
                  <div className="form-group">
                    <label htmlFor="waitlist-email">Email Address</label>
                    <input
                      type="email"
                      id="waitlist-email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    <FiMail size={16} /> Join Waitlist
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistModal;
