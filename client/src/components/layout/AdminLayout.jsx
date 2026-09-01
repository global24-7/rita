import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiShoppingCart, FiMessageSquare, FiLogOut, FiMenu, FiX, FiArrowLeft, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', icon: <FiGrid />, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: <FiPackage />, label: 'Products' },
    { to: '/admin/orders', icon: <FiShoppingCart />, label: 'Orders' },
    { to: '/admin/reviews', icon: <FiMessageSquare />, label: 'Reviews' },
    { to: '/admin/referrals', icon: <FiUsers />, label: 'Referrals' },
  ];

  return (
    <div className="admin-layout">
      {/* Overlay for mobile */}
      <div
        className={`admin-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <h2>Rita Jeans</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <NavLink to="/" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--color-text-muted)' }}>
            <FiArrowLeft /> View Store
          </NavLink>
          <button
            className="btn btn-ghost btn-sm btn-block"
            onClick={handleLogout}
            style={{ justifyContent: 'flex-start', gap: '0.5rem' }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="admin-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <h1>Admin Dashboard</h1>
          <div />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
