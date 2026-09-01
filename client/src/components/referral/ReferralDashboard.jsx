import { useState, useEffect } from 'react';
import { getReferralDashboard } from '../../api';
import toast from 'react-hot-toast';

export default function ReferralDashboard({ customer }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getReferralDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load referral dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = data?.referralCode
    ? `${window.location.origin}/?ref=${data.referralCode}`
    : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hey! Check out Rita Jeans for premium denim in Accra. Use my referral link for 10% off your first order: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const shareSMS = () => {
    const msg = encodeURIComponent(
      `Check out Rita Jeans for premium denim! Use my link for 10% off: ${referralLink}`
    );
    window.open(`sms:?body=${msg}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  if (loading) {
    return (
      <div className="referral-loading" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!data) return null;

  const activeVouchers = data.vouchers.filter(
    (v) => !v.is_used && new Date(v.expires_at) > new Date()
  );

  return (
    <div className="referral-dashboard">
      <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>
        Refer a Friend
      </h3>

      {/* Referral Link Section */}
      <div style={{
        background: 'var(--color-bg-warm)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid var(--color-border)',
      }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
          Share your unique link and earn rewards
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={referralLink}
            readOnly
            style={{
              flex: 1,
              padding: '0.625rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--text-sm)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          <button
            onClick={copyLink}
            className="btn btn-primary"
            style={{ padding: '0.625rem 1rem', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        {/* Share Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={shareWhatsApp} className="btn btn-whatsapp" style={{ fontSize: 'var(--text-sm)', padding: '0.5rem 1rem' }}>
            WhatsApp
          </button>
          <button onClick={shareSMS} className="btn btn-outline" style={{ fontSize: 'var(--text-sm)', padding: '0.5rem 1rem' }}>
            SMS
          </button>
          <button onClick={shareFacebook} className="btn btn-outline" style={{ fontSize: 'var(--text-sm)', padding: '0.5rem 1rem' }}>
            Facebook
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { label: 'Invited', value: data.stats.totalInvited },
          { label: 'Signed Up', value: data.stats.totalSignedUp },
          { label: 'Purchased', value: data.stats.totalPurchased },
        ].map((stat) => (
          <div key={stat.label} style={{
            textAlign: 'center',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Active Vouchers */}
      {activeVouchers.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-success)' }}>
            Your Rewards ({activeVouchers.length})
          </h4>
          {activeVouchers.map((v) => (
            <div key={v.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-success)',
              background: '#f0fdf4',
              marginBottom: '0.5rem',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{v.description}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Code: <strong>{v.code}</strong> · Expires: {new Date(v.expires_at).toLocaleDateString()}
                </div>
              </div>
              <span style={{
                fontSize: 'var(--text-xs)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-success)',
                color: 'white',
                fontWeight: 600,
              }}>
                Active
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Referral History */}
      {data.referrals.length > 0 && (
        <div>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '0.75rem' }}>
            Referral History
          </h4>
          {data.referrals.slice(0, 10).map((r) => (
            <div key={r.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.625rem 0',
              borderBottom: '1px solid var(--color-border-light)',
              fontSize: 'var(--text-sm)',
            }}>
              <div>
                <span style={{ fontWeight: 500 }}>{r.referred_name || 'Friend'}</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              <span style={{
                fontSize: 'var(--text-xs)',
                padding: '0.125rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                background: r.status === 'first_purchase' ? 'var(--color-success)' : r.status === 'signed_up' ? 'var(--color-info)' : 'var(--color-bg-warm)',
                color: r.status === 'first_purchase' || r.status === 'signed_up' ? 'white' : 'var(--color-text-secondary)',
                textTransform: 'capitalize',
              }}>
                {r.status === 'first_purchase' ? 'Purchased' : r.status === 'signed_up' ? 'Signed Up' : 'Invited'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
