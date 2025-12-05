import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axios";
import "../styles/activityCard.css";

function formatTimeTr(timestamp) {
  if (!timestamp) return "";

  const match = timestamp.match(/(\d+)\s+([A-Za-z]+)/);
  if (!match) return timestamp;

  const num = match[1];
  const unitEn = match[2].toLowerCase();

  let trUnit;
  switch (unitEn) {
    case "minute":
    case "minutes":
      trUnit = "dakika";
      break;
    case "hour":
    case "hours":
      trUnit = "saat";
      break;
    case "day":
    case "days":
      trUnit = "gün";
      break;
    case "week":
    case "weeks":
      trUnit = "hafta";
      break;
    case "month":
    case "months":
      trUnit = "ay";
      break;
    case "year":
    case "years":
      trUnit = "yıl";
      break;
    default:
      return timestamp;
  }

  return `${num} ${trUnit} önce`;
}

export default function ActivityCard({ activity }) {
  const navigate = useNavigate();
  if (!activity) return null;

  const { user, action, content, timestamp } = activity;
  const timeLabel = formatTimeTr(timestamp);

  const [liked, setLiked] = useState(!!activity.liked_by_me);
  const [likeCount, setLikeCount] = useState(activity.like_count || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const toggleLike = async (e) => {
    e.stopPropagation();
    if (!activity.id || likeLoading) return;

    setLikeLoading(true);
    try {
      const res = await api.post(`activity/${activity.id}/like/`);
      setLiked(!!res.data.liked);
      if (typeof res.data.like_count === "number") {
        setLikeCount(res.data.like_count);
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const goToProfile = (e) => {
    e.stopPropagation();
    if (!user?.id) return;
    navigate(`/profile/${user.id}`);
  };

  const openDetail = () => {
    if (!content) return;
    if (content.type === "film") navigate(`/film/${content.id}`);
    if (content.type === "book") navigate(`/book/${content.id}`);
  };

  const avatarUrl =
    user?.avatar || user?.profile?.avatar || "/profile.jpg";

  if (!content) {
    return (
      <div className="activity-card">
        <div className="activity-right">
          <div className="activity-header">
            <img
              src={avatarUrl}
              alt="avatar"
              className="activity-avatar"
              onClick={goToProfile}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/profile.jpg";
              }}
            />
            <div className="activity-header-text">
              <span className="activity-username" onClick={goToProfile}>
                {user?.username}
              </span>
              <span className="activity-time">{timeLabel}</span>
            </div>
          </div>

          <p className="activity-action">{action}</p>

          <div className="activity-footer">
            <button
              className={`activity-btn activity-like-btn ${liked ? "liked" : ""}`}
              onClick={toggleLike}
              disabled={likeLoading}
            >
              <span className="heart-icon">♥</span>
              <span className="like-count">{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const coverUrl =
    content.poster ||
    content.cover ||
    content.cover_url ||
    content.poster_url ||
    "/no_pic.jpg";

  const title = content.title || "";
  const rawRating = Number(content.rating || 0) || 0;
  const filledStars = Math.round(rawRating / 2);

  const fullReview =
    content.review_text ||
    content.review ||
    content.review_excerpt ||
    "";

  const MAX_REVIEW_LEN = 180;

  let reviewExcerpt = fullReview;
  let isTruncated = false;

  if (fullReview.length > MAX_REVIEW_LEN) {
    reviewExcerpt = fullReview.slice(0, MAX_REVIEW_LEN);
    const lastSpace = reviewExcerpt.lastIndexOf(" ");
    if (lastSpace > 50) {
      reviewExcerpt = reviewExcerpt.slice(0, lastSpace);
    }
    reviewExcerpt = reviewExcerpt.trim();
    isTruncated = true;
  }

  return (
    <div className="activity-card" onClick={openDetail}>
      <div className="activity-left">
        <img
          src={coverUrl}
          alt={title}
          className="activity-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/no_pic.jpg";
          }}
        />
      </div>

      <div className="activity-right">
        <div className="activity-header">
          <img
            src={avatarUrl}
            alt="avatar"
            className="activity-avatar"
            onClick={goToProfile}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/profile.jpg";
            }}
          />
          <div className="activity-header-text">
            <span className="activity-username" onClick={goToProfile}>
              {user?.username}
            </span>
            <span className="activity-time">{timeLabel}</span>
          </div>
        </div>

        <p className="activity-action">{action}</p>
        <h4 className="activity-title">{title}</h4>

        {rawRating > 0 && (
          <div className="activity-rating-row">
            <div className="activity-stars">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={
                    i <= filledStars
                      ? "activity-star filled"
                      : "activity-star"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            <span className="activity-rating-text">
              {rawRating.toFixed(1)} / 10
            </span>
          </div>
        )}

        {fullReview && (
          <p className="activity-review">
            “{reviewExcerpt}
            {isTruncated ? "…" : ""}”
            {isTruncated && (
              <span
                className="activity-read-more"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetail();
                }}
              >
                {" "}
                daha fazlasını oku
              </span>
            )}
          </p>
        )}

        <div className="activity-footer">
          <button
            className={`activity-btn activity-like-btn ${liked ? "liked" : ""}`}
            onClick={toggleLike}
            disabled={likeLoading}
          >
            <span className="heart-icon">♥</span>
            <span className="like-count">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
