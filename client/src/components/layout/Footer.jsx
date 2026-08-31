import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <h3 className="footer-logo">Rita Jeans</h3>
            <p className="footer-tagline">Premium denim crafted for Accra. Quality jeans for every style and every body.</p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Shop</h4>
            <div className="footer-links">
              <Link to="/catalog?category=Skinny">Skinny</Link>
              <Link to="/catalog?category=Straight">Straight</Link>
              <Link to="/catalog?category=Ripped">Ripped</Link>
              <Link to="/catalog?category=Mom Fit">Mom Fit</Link>
              <Link to="/catalog?category=Baggy">Baggy</Link>
              <Link to="/catalog?category=Wide Leg">Wide Leg</Link>
            </div>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Help</h4>
            <div className="footer-links">
              <a href="tel:0592117747"><FiPhone size={14} /> 059 211 7747</a>
              <span><FiMapPin size={14} /> La Paz, Accra</span>
              <span><FiMapPin size={14} /> Ablekuma, Accra</span>
              <Link to="/catalog?flashSale=true">Flash Sales</Link>
              <Link to="/catalog?newArrival=true">New Arrivals</Link>
            </div>
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
