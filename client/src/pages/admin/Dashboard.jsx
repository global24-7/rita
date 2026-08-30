import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiDollarSign, FiTrendingUp, FiClock, FiUsers } from 'react-icons/fi';
import { getAnalytics } from '../../api';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalytics();
      setAnalytics(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loader"><div className="spinner"></div></div>;
  }

  if (!analytics) return null;

  return (
    <div id="admin-dashboard">
      {/* Stats Grid */}
      <div className="analytics-grid">
        <div className="stat-card">
          <p className="stat-label">Total Orders</p>
          <p className="stat-value accent">{analytics.totalOrders}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Revenue</p>
          <p className="stat-value success">GH₵{analytics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending Orders</p>
          <p className="stat-value" style={{ color: 'var(--color-warning)' }}>{analytics.pendingOrders}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Referral Orders</p>
          <p className="stat-value info">{analytics.referralOrders}</p>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="analytics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <p className="stat-label">Confirmed</p>
          <p className="stat-value info">{analytics.confirmedOrders}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Delivered</p>
          <p className="stat-value success">{analytics.deliveredOrders}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending</p>
          <p className="stat-value" style={{ color: 'var(--color-warning)' }}>{analytics.pendingOrders}</p>
        </div>
      </div>

      {/* Best Sellers */}
      {analytics.bestSellers?.length > 0 && (
        <div className="best-sellers">
          <h3>🏆 Best Selling Products</h3>
          <div className="table-overflow" style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.bestSellers.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.totalSold}</td>
                    <td>GH₵{item.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {analytics.recentOrders?.length > 0 && (
        <div className="admin-table-wrapper" style={{ marginTop: 'var(--space-lg)' }}>
          <div className="admin-table-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="table-overflow" style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.customerName}</td>
                    <td>GH₵{order.total.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
