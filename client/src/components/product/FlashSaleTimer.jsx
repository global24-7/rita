import useCountdown from '../../hooks/useCountdown';

const FlashSaleTimer = ({ endDate }) => {
  const timeLeft = useCountdown(endDate);

  if (!timeLeft || timeLeft.expired) {
    return <span className="badge badge-sale">Sale Ended</span>;
  }

  return (
    <div className="countdown">
      <div className="countdown-unit">
        <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="countdown-label">Days</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="countdown-label">Hrs</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="countdown-label">Min</span>
      </div>
      <div className="countdown-unit">
        <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="countdown-label">Sec</span>
      </div>
    </div>
  );
};

export default FlashSaleTimer;
