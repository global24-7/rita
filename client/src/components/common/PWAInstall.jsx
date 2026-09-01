import { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';

export default function PWAInstall() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setShow(true);
    };

    const installedHandler = () => {
      setShow(false);
      window.deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShow(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!window.deferredPrompt) return;
    window.deferredPrompt.prompt();
    const { outcome } = await window.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    window.deferredPrompt = null;
  };

  if (!show) return null;

  return (
    <button
      onClick={handleInstall}
      id="pwa-install-btn"
      style={{
        position: 'fixed',
        bottom: '5.5rem',
        right: '1.25rem',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'var(--color-primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-lg)',
        cursor: 'pointer',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        transition: 'var(--transition-base)',
      }}
      onMouseEnter={(e) => e.target.style.background = 'var(--color-primary-light)'}
      onMouseLeave={(e) => e.target.style.background = 'var(--color-primary)'}
    >
      <FiDownload /> Install App
    </button>
  );
}
