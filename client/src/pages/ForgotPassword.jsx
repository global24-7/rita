import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      setResetToken(res.data.resetToken || res.data.token);
      toast.success('Reset token generated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card">
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">Enter your email to receive a reset token.</p>

          {resetToken ? (
            <div className="reset-token-display">
              <p className="token-label">Your reset token:</p>
              <code className="token-value">{resetToken}</code>
              <p className="token-hint">Copy this token and use it to reset your password.</p>
              <Link to="/reset-password" className="auth-submit-btn">
                Reset Password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Token'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
