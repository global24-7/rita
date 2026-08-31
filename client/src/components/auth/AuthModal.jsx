import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';
import { useCustomer } from '../../context/CustomerContext';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useCustomer();
  const [mode, setMode] = useState('signin');
  const [loading, setLoading] = useState(false);

  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  if (!isOpen) return null;

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInForm.email.trim() || !signInForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(signInForm.email, signInForm.password);
      toast.success('Signed in successfully');
      setSignInForm({ email: '', password: '' });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!signUpForm.name.trim() || !signUpForm.email.trim() || !signUpForm.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (signUpForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: signUpForm.name,
        email: signUpForm.email,
        phone: signUpForm.phone,
        password: signUpForm.password,
      });
      toast.success('Account created successfully');
      setSignUpForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>

        {/* Mode Toggle */}
        <div className="auth-modal-tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signin' ? (
          <form className="auth-modal-form" onSubmit={handleSignIn}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={signInForm.email}
                onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={signInForm.password}
                onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                placeholder="Your password"
                required
              />
            </div>
            <Link
              to="/forgot-password"
              className="auth-forgot-link"
              onClick={onClose}
            >
              Forgot password?
            </Link>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="auth-modal-form" onSubmit={handleSignUp}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={signUpForm.name}
                onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={signUpForm.email}
                onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={signUpForm.phone}
                onChange={(e) => setSignUpForm({ ...signUpForm, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={signUpForm.password}
                onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                placeholder="Min. 6 characters"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={signUpForm.confirmPassword}
                onChange={(e) =>
                  setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })
                }
                placeholder="Re-enter password"
                required
              />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
