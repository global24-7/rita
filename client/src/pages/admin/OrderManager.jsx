import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getOrders, updateOrderStatus } from '../../api';

const statusOptions = ['pending', 'confirmed', 'delivered', 'cancelled'];

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterStatus) params.status = filterStatus;
      const res = await getOrders(params);
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div id="order-manager">
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h2>Orders</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`filter-chip ${!filterStatus ? 'active' : ''}`}
              onClick={() => { setFilterStatus(''); setPage(1); }}
            >
              All
            </button>
            {statusOptions.map((status) => (
              <button
                key={status}
                className={`filter-chip ${filterStatus === status ? 'active' : ''}`}
                onClick={() => { setFilterStatus(status); setPage(1); }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders found</h3>
          </div>
        ) : (
          <div className="table-overflow" style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Items</th>
                  <th>Location</th>
                  <th>Del. Fee</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{order.customerName}</td>
                    <td>
                      <a href={`tel:${order.phone}`} style={{ color: 'var(--color-accent)' }}>
                        {order.phone}
                      </a>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx}>{item.name} (×{item.qty}, {item.size})</div>
                        ))}
                      </div>
                    </td>
                    <td>{order.deliveryLocation}</td>
                    <td style={{ color: order.deliveryFee === 0 ? 'var(--color-success)' : 'inherit' }}>
                      {order.deliveryFee === 0 ? 'Free' : `GH₵${order.deliveryFee}`}
                    </td>
                    <td style={{ fontWeight: 600 }}>GH₵{order.total.toFixed(2)}</td>
                    <td>
                      <select
                        className="form-select"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{
                          padding: '0.3rem 0.5rem',
                          fontSize: '0.75rem',
                          minWidth: '110px',
                          background: 'var(--color-surface-light)',
                        }}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 'var(--space-lg)' }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
