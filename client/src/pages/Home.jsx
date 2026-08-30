import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiArrowRight, FiZap } from 'react-icons/fi';
import { getProducts } from '../api';
import ProductCard from '../components/product/ProductCard';
import FlashSaleTimer from '../components/product/FlashSaleTimer';
import { setReferralFromUrl } from '../utils/helpers';

const categories = [
  { name: 'Skinny', icon: '👖', desc: 'Slim & sleek' },
  { name: 'Straight', icon: '🧵', desc: 'Classic cut' },
  { name: 'Ripped', icon: '✂️', desc: 'Edgy style' },
  { name: 'Mom Fit', icon: '👗', desc: 'High-waisted' },
  { name: 'Baggy', icon: '🎒', desc: 'Relaxed fit' },
  { name: 'Wide Leg', icon: '🦿', desc: 'Flowing width' },
];

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReferralFromUrl();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [newRes, saleRes] = await Promise.all([
        getProducts({ newArrival: 'true', limit: 4 }),
        getProducts({ flashSale: 'true', limit: 4 }),
      ]);
      setNewArrivals(newRes.data.products);
      setFlashSales(saleRes.data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find the latest flash sale end date for the countdown
  const latestSaleEnd = flashSales.reduce((latest, p) => {
    if (p.saleEndsAt && new Date(p.saleEndsAt) > new Date(latest || 0)) {
      return p.saleEndsAt;
    }
    return latest;
  }, null);

  return (
    <div id="home-page">
      {/* Location Bar */}
      <div className="location-bar">
        <div className="container">
          <div className="location-item">
            <FiMapPin className="icon" />
            <span>La Paz, Accra</span>
          </div>
          <div className="location-item">
            <FiMapPin className="icon" />
            <span>Ablekuma, Accra</span>
          </div>
          <div className="location-item">
            <FiPhone className="icon" />
            <a href="tel:059217747" style={{ color: 'inherit' }}>059 217 7477</a>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <div className="hero-badge">✦ Premium Denim Since Day One</div>
          <h1>
            Wear Your <span className="highlight">Confidence</span>
          </h1>
          <p>
            Discover Rita Jeans — Ghana's favourite denim destination.
            From skinny to baggy, ripped to mom fit, find your perfect pair
            at unbeatable prices.
          </p>
          <div className="hero-buttons">
            <Link to="/catalog" className="btn btn-primary btn-lg">
              Shop Now <FiArrowRight />
            </Link>
            <Link to="/catalog?flashSale=true" className="btn btn-secondary btn-lg">
              <FiZap /> Flash Sales
            </Link>
          </div>
          <div className="hero-locations">
            <div className="hero-location">
              <FiMapPin className="icon" />
              <span>La Paz</span>
            </div>
            <div className="hero-location">
              <FiMapPin className="icon" />
              <span>Ablekuma</span>
            </div>
            <div className="hero-location">
              <span>Free delivery in Ablekuma!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" id="categories">
        <div className="container">
          <h2 className="section-title">
            Shop by <span>Category</span>
          </h2>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
              >
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sales */}
      {flashSales.length > 0 && (
        <section className="section" id="flash-sales">
          <div className="container">
            <div className="flash-sale-section">
              <div className="flash-sale-header">
                <h2 className="section-title" style={{ marginBottom: 0 }}>
                  <FiZap /> Flash <span>Sales</span>
                </h2>
                {latestSaleEnd && <FlashSaleTimer endDate={latestSaleEnd} />}
              </div>
              <div className="product-grid">
                {flashSales.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
                <Link to="/catalog?flashSale=true" className="btn btn-secondary">
                  View All Sales <FiArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section" id="new-arrivals">
          <div className="container">
            <h2 className="section-title">
              New <span>Arrivals</span>
            </h2>
            <div className="product-grid">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
              <Link to="/catalog?newArrival=true" className="btn btn-secondary">
                View All New Arrivals <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="section" id="cta">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">
            Can't find what you <span>need?</span>
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)', maxWidth: '500px', margin: '0 auto var(--space-xl)' }}>
            Call or WhatsApp us directly. We'll help you find the perfect pair of jeans!
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:059217747" className="btn btn-primary btn-lg">
              <FiPhone /> Call Now
            </a>
            <a
              href="https://wa.me/23359217747?text=Hi%20Rita!%20I'd%20like%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {loading && (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default Home;
