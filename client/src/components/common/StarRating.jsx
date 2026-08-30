import { FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

const StarRating = ({ rating = 0, size = '0.9rem' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= Math.round(rating) ? (
        <FaStar key={i} className="star filled" style={{ fontSize: size }} />
      ) : (
        <FiStar key={i} className="star" style={{ fontSize: size }} />
      )
    );
  }
  return <div className="stars">{stars}</div>;
};

export default StarRating;
