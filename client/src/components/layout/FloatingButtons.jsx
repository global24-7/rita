import { FaWhatsapp } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import { generateWhatsAppLink } from '../../utils/helpers';

const FloatingButtons = () => {
  const whatsappLink = generateWhatsAppLink('0592117747', "Hi Rita! I'd like to place an order.");

  return (
    <div className="floating-buttons" id="floating-buttons">
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn floating-btn-whatsapp"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={20} />
      </a>
      <a
        href="tel:0592117747"
        className="floating-btn floating-btn-call"
        aria-label="Call to order"
        title="Call to order"
      >
        <FiPhone size={20} />
      </a>
    </div>
  );
};

export default FloatingButtons;
