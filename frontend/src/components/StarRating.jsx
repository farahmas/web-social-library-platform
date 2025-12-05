import "./starRating.css";

export default function StarRating({
  value = 0,        
  maxScore = 10,    
  maxStars = 5,     
  className = "",
}) {
  const numeric = Number(value) || 0;

  const clamped = Math.max(0, Math.min(maxScore, numeric));

  const starValue = (clamped / maxScore) * maxStars;

  const fullStars = Math.round(starValue);
  const emptyStars = maxStars - fullStars;

  return (
    <div className={`star-rating ${className}`}>
      <span className="stars">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`f-${i}`} className="star full">
            ★
          </span>
        ))}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`e-${i}`} className="star empty">
            ★
          </span>
        ))}
      </span>

      <span className="rating-number">
        {clamped.toFixed(1)}/{maxScore}
      </span>
    </div>
  );
}
