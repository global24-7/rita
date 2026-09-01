import { useState, useEffect } from 'react';
import { getReferralAnalytics } from '../../api';

export default function AdminReferrals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getReferralAnalytics();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load referral analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!data) return <div>Failed to load referral data</div>;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>
        Referral Activity
      </h2>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Total Referrals', value: data.totalReferrals, color: 'var(--color-primary)' },
          { label: 'Signed Up', value: data.signedUp, color: 'var(--color-info)' },
          { label: 'First Purchase', value: data.firstPurchase, color: 'var(--color-success)' },
          { label: 'Vouchers Issued', value: data.totalVouchers, color: 'var(--color-accent)' },
          { label: 'Active Vouchers', value: data.activeVouchers, color: 'var(--color-warning)' },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Top Referrers */}
      {data.topReferrers.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '1rem' }}>Top Referrers</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: 'var(--text-sm)' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: 'var(--text-sm)' }}>Email</th>
                <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: 'var(--text-sm)' }}>Referrals</th>
              </tr>
            </thead>
            <tbody>
              {data.topReferrers.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '0.75rem', fontSize: 'var(--text-sm)' }}>{r.name}</td>
                  <td style={{ padding: '0.75rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{r.email}</td>
                  <td style={{ padding: '0.75rem', fontSize: 'var(--text-sm)', textAlign: 'center', fontWeight: 600 }}>{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Referrals */}
      {data.recentReferrals.length > 0 && (
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '1rem' }}>Recent Referrals</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: 'var(--text-sm)' }}>Referred</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: 'var(--text-sm)' }}>By</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: 'var(--text-sm)' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: 'var(--text-sm)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentReferrals.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '0.75rem', fontSize: 'var(--text-sm)' }}>
                      {r.referred_name || 'Unknown'}
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {r.referred_email || r.referred_phone || ''}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: 'var(--text-sm)' }}>
                      {r.referrer?.name || 'Unknown'}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: r.status === 'first_purchase' ? 'var(--color-success)' : r.status === 'signed_up' ? 'var(--color-info)' : 'var(--color-bg-warm)',
                        color: r.status === 'first_purchase' || r.status === 'signed_up' ? 'white' : 'var(--color-text-secondary)',
                        textTransform: 'capitalize',
                      }}>
                        {r.status === 'first_purchase' ? 'Purchased' : r.status === 'signed_up' ? 'Signed Up' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
