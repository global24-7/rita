import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Rita Jeans</h4>
            <p>
              Your go-to destination for premium denim in Ghana. Quality jeans for every style,
              every body, every occasion. Visit us in La Paz or Ablekuma.
            </p>
          </div>
          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/catalog?category=Skinny">Skinny</Link>
            <Link to="/catalog?category=Straight">Straight</Link>
            <Link to="/catalog?category=Ripped">Ripped</Link>
            <Link to="/catalog?category=Mom Fit">Mom Fit</Link>
            <Link to="/catalog?category=Baggy">Baggy</Link>
            <Link to="/catalog?category=Wide Leg">Wide Leg</Link>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/catalog?flashSale=true">Flash Sales</Link>
            <Link to="/catalog?newArrival=true">New Arrivals</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/wishlist">Wishlist</Link>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <p>
              <FiPhone style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              <a href="tel:059217747">059 217 7477</a>
            </p>
            <p>
              <FiMapPin style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              La Paz, Accra
            </p>
            <p>
              <FiMapPin style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Ablekuma, Accra
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Rita Jeans. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
