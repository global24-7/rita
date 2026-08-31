import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { useCustomer } from '../../context/CustomerContext';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const navigate = useNavigate();
  const { mode: urlMode } = useParams();
  const { login, register, isAuthenticated } = useCustomer();
  const [mode, setMode] = useState(urlMode === 'signup' ? 'signup' : 'signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  if (isAuthenticated) {
    navigate('/account');
    return null;
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signInForm.email.trim() || !signInForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(signInForm.email, signInForm.password);
      toast.success('Welcome back!');
      navigate('/');
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
        password: signUpForm.password,
      });
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-bg">
        <div className="auth-bg-left" />
        <div className="auth-bg-right" />
      </div>

      <div className="auth-card">
        <h2 className="auth-card-logo">RITA JEANS</h2>

        {mode === 'signin' ? (
          <div className="auth-card-section">
            <p className="auth-card-welcome">Welcome Back!</p>
            <h3 className="auth-card-title">Sign In to RITA JEANS</h3>

            <form onSubmit={handleSignIn}>
              <div className="floating-input">
                <FiMail className="floating-input-icon" />
                <input
                  type="email"
                  id="signin-email"
                  value={signInForm.email}
                  onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                  required
                />
                <label htmlFor="signin-email">Email Address</label>
                <span className="floating-input-hint">Required</span>
              </div>

              <div className="floating-input">
                <FiLock className="floating-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signin-password"
                  value={signInForm.password}
                  onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                  required
                />
                <label htmlFor="signin-password">Password</label>
                <button
                  type="button"
                  className="floating-input-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                <Link to="/forgot-password" className="floating-input-hint auth-forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'SIGN IN'}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="auth-social">
              <button type="button" className="auth-social-btn" disabled>Google</button>
              <button type="button" className="auth-social-btn" disabled>Facebook</button>
              <button type="button" className="auth-social-btn" disabled>Apple</button>
            </div>

            <p className="auth-switch">
              Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('signup'); setShowPassword(false); }}>
                Sign Up
              </button>
            </p>
          </div>
        ) : (
          <div className="auth-card-section">
            <p className="auth-card-welcome">Sign Up</p>
            <h3 className="auth-card-title">Create an Account</h3>

            <form onSubmit={handleSignUp}>
              <div className="floating-input">
                <FiUser className="floating-input-icon" />
                <input
                  type="text"
                  id="signup-name"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                  required
                />
                <label htmlFor="signup-name">Full Name</label>
              </div>

              <div className="floating-input">
                <FiMail className="floating-input-icon" />
                <input
                  type="email"
                  id="signup-email"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                  required
                />
                <label htmlFor="signup-email">Email Address</label>
              </div>

              <div className="floating-input">
                <FiLock className="floating-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signup-password"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  required
                />
                <label htmlFor="signup-password">Password</label>
                <button
                  type="button"
                  className="floating-input-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div className="floating-input">
                <FiLock className="floating-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="signup-confirm"
                  value={signUpForm.confirmPassword}
                  onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                  required
                />
                <label htmlFor="signup-confirm">Confirm Password</label>
                <button
                  type="button"
                  className="floating-input-eye"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'SIGN UP'}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or sign up with</span>
            </div>

            <div className="auth-social">
              <button type="button" className="auth-social-btn" disabled>Google</button>
              <button type="button" className="auth-social-btn" disabled>Facebook</button>
              <button type="button" className="auth-social-btn" disabled>Apple</button>
            </div>

            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('signin'); setShowPassword(false); setShowConfirmPassword(false); }}>
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>

      <footer className="auth-page-footer">
        <span>&copy; RITA JEANS {new Date().getFullYear()}</span>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
      </footer>
    </div>
  );
};

export default AuthPage;
