import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { useCustomer } from '../context/CustomerContext';
import { getMyOrders } from '../api';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const Account = () => {
  const { customer, loading, updateProfile, logout, isAuthenticated } = useCustomer();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.error('Please sign in to view your account');
      navigate('/');
      return;
    }
    if (customer) {
      setForm({ name: customer.name || '', email: customer.email || '', phone: customer.phone || '' });
    }
  }, [customer, loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      setOrdersLoading(true);
      getMyOrders()
        .then((res) => setOrders(res.data.orders || res.data || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [isAuthenticated]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="account-page">
        <div className="container">
          <p className="account-loading">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <h1 className="account-title">My Account</h1>
          <button className="account-logout-btn" onClick={handleLogout}>
            <FiLogOut /> Sign Out
          </button>
        </div>

        <div className="account-grid">
          {/* Profile Section */}
          <section className="account-section">
            <div className="section-header">
              <h2>Profile</h2>
              {!editing && (
                <button className="icon-btn" onClick={() => setEditing(true)}>
                  <FiEdit2 /> Edit
                </button>
              )}
            </div>
            {editing ? (
              <div className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-save" onClick={handleSave} disabled={saving}>
                    <FiCheck /> {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        name: customer.name || '',
                        email: customer.email || '',
                        phone: customer.phone || '',
                      });
                    }}
                  >
                    <FiX /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{customer.name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{customer.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{customer.phone || '—'}</span>
                </div>
              </div>
            )}
          </section>

          {/* Order History Section */}
          <section className="account-section">
            <div className="section-header">
              <h2>Order History</h2>
            </div>
            {ordersLoading ? (
              <p className="section-empty">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="section-empty">
                <p>No orders yet.</p>
                <Link to="/catalog" className="btn-shop-now">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-id">#{order._id?.slice(-8).toUpperCase()}</span>
                      <span className={`order-status status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="order-items">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span className="item-name">
                            {item.name} × {item.qty}
                          </span>
                          {item.size && <span className="item-size">Size: {item.size}</span>}
                          <span className="item-price">
                            ₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      Total: ₹{(order.total || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Account;
