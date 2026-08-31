import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiMenu, FiX, FiSearch, FiUser } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCustomer } from '../../context/CustomerContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isAuthenticated } = useCustomer();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/catalog', label: 'Shop' },
    { to: '/catalog?flashSale=true', label: 'Sale' },
  ];

  return (
    <>
      <nav className="navbar" id="main-nav">
        <div className="navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="navbar-logo">Rita Jeans</span>
          </Link>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className="nav-link" end>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions">
            <Link to="/catalog" className="navbar-icon" aria-label="Search">
              <FiSearch size={20} />
            </Link>

            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="navbar-icon"
              aria-label="Account"
            >
              <FiUser size={20} />
            </Link>

            <Link to="/wishlist" className="navbar-icon" aria-label="Wishlist">
              <FiHeart size={20} />
              {wishlistCount > 0 && <span className="navbar-badge">{wishlistCount}</span>}
            </Link>

            <Link to="/cart" className="navbar-icon" aria-label="Cart">
              <FiShoppingBag size={20} />
              {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
            </Link>

            <button className="navbar-hamburger" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <FiMenu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)} />
        <div className="mobile-drawer-panel">
          <div className="mobile-drawer-header">
            <span className="navbar-logo">Rita Jeans</span>
            <button className="mobile-drawer-close" onClick={() => setMobileOpen(false)} aria-label="Close">
              <FiX size={22} />
            </button>
          </div>
          <div className="mobile-drawer-links">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className="mobile-drawer-link" onClick={() => setMobileOpen(false)} end>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/wishlist" className="mobile-drawer-link" onClick={() => setMobileOpen(false)}>
              Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
            </NavLink>
            <NavLink to="/cart" className="mobile-drawer-link" onClick={() => setMobileOpen(false)}>
              Cart {cartCount > 0 && `(${cartCount})`}
            </NavLink>
            <NavLink
              to={isAuthenticated ? '/account' : '/login'}
              className="mobile-drawer-link"
              onClick={() => setMobileOpen(false)}
            >
              {isAuthenticated ? 'My Account' : 'Sign In'}
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
