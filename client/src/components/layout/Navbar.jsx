import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/catalog', label: 'Shop' },
    { to: '/catalog?flashSale=true', label: 'Sale' },
  ];

  return (
    <>
      <nav className="navbar" id="main-nav">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <div>
              <h1>Rita Jeans</h1>
              <div className="brand-sub">Premium Denim</div>
            </div>
          </Link>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-actions">
            <Link to="/catalog" className="navbar-icon" aria-label="Search products">
              <FiSearch />
            </Link>
            <Link to="/wishlist" className="navbar-icon" aria-label="Wishlist">
              <FiHeart />
              {wishlistCount > 0 && <span className="count-badge">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="navbar-icon" aria-label="Shopping cart">
              <FiShoppingBag />
              {cartCount > 0 && <span className="count-badge">{cartCount}</span>}
            </Link>
            <button
              className="menu-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} id="mobile-nav">
        <div className="mobile-nav-header">
          <Link to="/" className="navbar-brand" onClick={() => setMobileOpen(false)}>
            <h1 style={{ fontSize: '1.25rem' }}>Rita Jeans</h1>
          </Link>
          <button className="mobile-nav-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <FiX />
          </button>
        </div>
        <div className="mobile-nav-links">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              end
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/wishlist" onClick={() => setMobileOpen(false)}>
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </NavLink>
          <NavLink to="/cart" onClick={() => setMobileOpen(false)}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default Navbar;
