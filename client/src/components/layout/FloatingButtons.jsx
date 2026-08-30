import { FaWhatsapp } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import { generateWhatsAppLink } from '../../utils/helpers';

const FloatingButtons = () => {
  const whatsappLink = generateWhatsAppLink('059217747', 'Hi Rita! I\'d like to place an order.');

  return (
    <div className="floating-buttons" id="floating-buttons">
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fab fab-whatsapp"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>
      <a
        href="tel:059217747"
        className="fab fab-call"
        aria-label="Call to order"
        title="Call to order"
      >
        <FiPhone />
      </a>
    </div>
  );
};

export default FloatingButtons;
