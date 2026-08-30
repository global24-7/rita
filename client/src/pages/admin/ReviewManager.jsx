import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAllReviews, toggleReviewApproval, deleteReview } from '../../api';
import StarRating from '../../components/common/StarRating';

const ReviewManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await getAllReviews();
      setReviews(res.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id) => {
    try {
      await toggleReviewApproval(id);
      toast.success('Review status updated');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await deleteReview(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'pending') return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    return true;
  });

  return (
    <div id="review-manager">
      <div className="admin-table-header" style={{ background: 'none', border: 'none', padding: 0, marginBottom: 'var(--space-lg)' }}>
        <h2>Reviews ({reviews.length})</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'pending', 'approved'].map((f) => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'pending' ? `Pending (${reviews.filter(r => !r.isApproved).length})` : 'Approved'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner"></div></div>
      ) : filteredReviews.length === 0 ? (
        <div className="empty-state">
          <h3>No reviews found</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {filteredReviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-card-header">
                <div>
                  <span className="review-card-product">
                    {review.productId?.name || 'Unknown Product'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <strong>{review.customerName}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="review-card-actions">
                  <button
                    className={`btn btn-sm ${review.isApproved ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => handleToggleApproval(review._id)}
                    title={review.isApproved ? 'Hide review' : 'Approve review'}
                    style={{ padding: '0.4rem 0.75rem' }}
                  >
                    {review.isApproved ? <><FiX /> Hide</> : <><FiCheck /> Approve</>}
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(review._id)}
                    title="Delete review"
                    style={{ padding: '0.4rem' }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <StarRating rating={review.rating} size="0.9rem" />
              {review.comment && (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  "{review.comment}"
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className={`status-badge ${review.isApproved ? 'status-delivered' : 'status-pending'}`}>
                  {review.isApproved ? 'Approved' : 'Pending'}
                </span>
                {review.isVerifiedPurchase && (
                  <span className="badge badge-stock" style={{ fontSize: '0.6rem' }}>Verified</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewManager;
