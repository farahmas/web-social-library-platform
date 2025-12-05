import "./CarouselRow.css";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";

export default function CarouselRow({ title, items = [], type }) {
  const navigate = useNavigate();

  const openDetail = (item) => {
    navigate(`/${type}/${item.external_id}`);
  };

  const safeNum = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

  const uniqueItems = [];
  const seen = new Set();

  for (const item of items) {
    const key = String(item.external_id || item.id || "");
    if (!key) {
      uniqueItems.push(item);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueItems.push(item);
  }

  return (
    <section className="carousel-row">
      <h2 className="carousel-title">{title}</h2>

      {uniqueItems.length === 0 ? (
        <div className="carousel-empty">Henüz içerik yok.</div>
      ) : (
        <div className="carousel-scroll">
          {uniqueItems.map((item) => {
            const avg10 = safeNum(item.avg_rating);
            const avg5 = avg10 / 2;
            const key = item.external_id || item.id || item.title;

            return (
              <div
                key={key}
                className="carousel-card"
                onClick={() => openDetail(item)}
              >
                <div className="carousel-img-wrapper">
                  <img
                    src={
                      item.cover_url ||
                      item.poster_url ||
                      "/no_pic.jpg"
                    }
                    className="carousel-img"
                    alt={item.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no_pic.jpg";
                      e.target.style.objectFit = "contain";
                      e.target.style.background = "#111";
                    }}
                  />
                </div>

                <div className="carousel-info">
                  <div className="carousel-name">
                    {item.title?.length > 28
                      ? item.title.slice(0, 28) + "…"
                      : item.title}
                  </div>

                  <div className="carousel-rating">
                    <StarRating value={avg10} />
                    <span className="carousel-rating-text">
                      {avg5 ? avg5.toFixed(1) : "—"}/5
                    </span>
                  </div>

                  <div className="carousel-stats">
                    <span>⭐ {item.rating_count || 0} oy</span>
                    <span>💬 {item.review_count || 0} yorum</span>
                    <span>📚 {item.list_count || 0} liste</span>
                    <span className="pop-score">
                      🔥 {item.popularity || 0} popülerlik
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
