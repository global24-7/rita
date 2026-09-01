import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiArrowRight } from 'react-icons/fi';
import { getProducts } from '../api';
import ProductCard from '../components/product/ProductCard';
import FlashSaleTimer from '../components/product/FlashSaleTimer';
import ReferralTracker from '../components/referral/ReferralTracker';

const categories = [
  { name: 'Skinny', desc: 'Slim & sleek' },
  { name: 'Straight', desc: 'Classic cut' },
  { name: 'Ripped', desc: 'Edgy style' },
  { name: 'Mom Fit', desc: 'High-waisted' },
  { name: 'Baggy', desc: 'Relaxed fit' },
  { name: 'Wide Leg', desc: 'Flowing width' },
];

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const latestSaleEnd = flashSales.reduce((latest, p) => {
    if (p.saleEndsAt && new Date(p.saleEndsAt) > new Date(latest || 0)) {
      return p.saleEndsAt;
    }
    return latest;
  }, null);

  return (
    <div className="home-page" id="home-page">
      <ReferralTracker />
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <span className="hero-badge">Premium Denim Since Day One</span>
            <h1 className="hero-title">
              Premium Denim,<br />Crafted for Accra
            </h1>
            <p className="hero-subtitle">
              From skinny to baggy, ripped to mom fit — discover your perfect pair
              at Ghana's favourite denim destination.
            </p>
            <div className="hero-buttons">
              <Link to="/catalog" className="btn btn-primary btn-lg">
                Shop Now <FiArrowRight size={18} />
              </Link>
              <Link to="/catalog?flashSale=true" className="btn btn-outline btn-lg">
                View Sale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div className="categories-scroll">
            <div className="categories-grid">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/catalog?category=${encodeURIComponent(cat.name)}`}
                  className="category-card"
                >
                  <div className="category-card-inner">
                    <h3 className="category-name">{cat.name}</h3>
                    <p className="category-desc">{cat.desc}</p>
                    <span className="category-link">Shop Now <FiArrowRight size={14} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sales */}
      {flashSales.length > 0 && (
        <section className="section flash-sale-section">
          <div className="container">
            <div className="section-header">
              <div className="section-header-left">
                <h2 className="section-title">Flash Sales</h2>
                {latestSaleEnd && <FlashSaleTimer endDate={latestSaleEnd} />}
              </div>
              <Link to="/catalog?flashSale=true" className="section-link">
                View All <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="product-grid product-grid-4">
              {flashSales.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section arrivals-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">New Arrivals</h2>
              <Link to="/catalog?newArrival=true" className="section-link">
                View All <FiArrowRight size={16} />
              </Link>
            </div>
            <div className="product-grid product-grid-4">
              {newArrivals.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2 className="cta-title">Visit Us in Accra</h2>
              <p className="cta-text">
                Come try on your perfect pair. We're in La Paz and Ablekuma — free delivery in Ablekuma.
              </p>
              <div className="cta-locations">
                <div className="cta-location">
                  <FiMapPin size={16} />
                  <span>La Paz, Accra</span>
                </div>
                <div className="cta-location">
                  <FiMapPin size={16} />
                  <span>Ablekuma, Accra</span>
                </div>
              </div>
              <div className="cta-actions">
                <a href="tel:0592117747" className="btn btn-primary">
                  <FiPhone size={16} /> Call Now
                </a>
                <a
                  href="https://wa.me/233592117747?text=Hi%20Rita!%20I'd%20like%20to%20place%20an%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
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
