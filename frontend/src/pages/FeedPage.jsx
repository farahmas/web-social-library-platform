import { useEffect, useState } from "react";
import api from "../api/axios";
import ActivityCard from "../components/ActivityCard";
import Navbar from "../components/Navbar";
import "../styles/feed.css";

export default function FeedPage() {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActivities = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`activity/?page=${page}`);
      const newData = Array.isArray(res.data.results) ? res.data.results : [];

      setActivities((prev) => [...prev, ...newData]);

      if (!res.data.next) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
      setError("Akış yüklenirken bir hata oluştu.");
    }

    setLoading(false);
    setInitialLoading(false);
  };

  useEffect(() => {
    loadActivities();
  }, [page]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const refreshFeed = () => {
    setActivities([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
  };

  return (
    <>
      <Navbar />

      <div className="feed-container">
        <div className="feed-header">
          <h2 className="feed-title">Ana Sayfa (Sosyal Akış)</h2>
          <button className="refresh-btn" onClick={refreshFeed}>
            Yenile
          </button>
        </div>

        {initialLoading && (
          <div className="loading-center">
            <div className="spinner"></div>
            <p>Akış yükleniyor...</p>
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        {!initialLoading && activities.length === 0 && (
          <div className="empty-feed">
            Takip ettiğiniz kullanıcıların henüz aktivitesi yok.
          </div>
        )}

        {activities.map((act) => (
          <ActivityCard key={act.id} activity={act} />
        ))}

        {!initialLoading && hasMore && (
          <button
            className="load-more-btn"
            disabled={loading}
            onClick={loadMore}
          >
            {loading ? "Yükleniyor..." : "Daha Fazla Yükle"}
          </button>
        )}

        {!hasMore && activities.length > 0 && (
          <div className="end-text">Tüm aktiviteler yüklendi.</div>
        )}
      </div>
    </>
  );
}
