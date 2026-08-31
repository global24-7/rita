import useCountdown from '../../hooks/useCountdown';

const FlashSaleTimer = ({ endDate }) => {
  const timeLeft = useCountdown(endDate);

  if (!timeLeft || timeLeft.expired) {
    return <span className="sale-ended">Sale Ended</span>;
  }

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className="countdown">
      {units.map((unit, idx) => (
        <div key={idx} className="countdown-block">
          <span className="countdown-value">{String(unit.value).padStart(2, '0')}</span>
          <span className="countdown-label">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

export default FlashSaleTimer;
