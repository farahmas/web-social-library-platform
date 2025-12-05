import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import AddToListModal from "../components/AddToListModal";
import "../styles/detail.css";

export default function FilmDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [film, setFilm] = useState(null);
  const [rating, setRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const [libraryStatus, setLibraryStatus] = useState(null);
  const [addListModal, setAddListModal] = useState(false);

  const [loading, setLoading] = useState(true);

  const getMe = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const me = getMe();

  const toArray = (data) =>
    Array.isArray(data) ? data : data?.results || [];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadFilm(),
      loadRating(),
      loadReviews(),
      loadLibraryStatus(),
    ]).finally(() => setLoading(false));
  }, [id]);

  const loadFilm = async () => {
    try {
      const res = await api.get(`films/${id}/`);
      const stats = await api.get(`films/${id}/rating-stats/`);

      setFilm({
        ...res.data,
        stats: stats.data,
      });
    } catch (err) {
      console.error("Film load error:", err);
    }
  };

  const loadRating = async () => {
    try {
      const res = await api.get(`ratings/film/${id}/`);
      const scoreNum = Number(res.data.score);
      setRating(Number.isNaN(scoreNum) ? null : scoreNum);
    } catch {
      setRating(null);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.get(`reviews/film/${id}/`);
      setReviews(res.data);
    } catch (err) {
      console.error("Review load error:", err);
    }
  };

  const loadLibraryStatus = async () => {
    try {
      const res = await api.get("library/film/");
      if (!me) return;

      const items = toArray(res.data);

      const statusObj = items.find(
        (s) =>
          s.user === me.id &&
          String(s.film_external_id) === String(id)
      );

      setLibraryStatus(statusObj ? statusObj.status : null);
    } catch (err) {
      console.error("Library status load error:", err);
    }
  };

  const submitRating = async (value) => {
    try {
      setRating(value);

      await api.post("ratings/film/", {
        film: id,
        score: value,
      });

      loadFilm();
    } catch (err) {
      console.error("Rating error:", err);
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim()) return;

    try {
      await api.post(`reviews/film/${id}/`, {
        text: reviewText,
      });

      setReviewText("");
      loadReviews();
    } catch (err) {
      console.error("Review submit error:", err);
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditingText(review.text);
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditingText("");
  };

  const saveEditReview = async (reviewId) => {
    if (!editingText.trim()) return;
    try {
      await api.put(`reviews/film/review/${reviewId}/`, {
        text: editingText,
      });
      setEditingReviewId(null);
      setEditingText("");
      loadReviews();
    } catch (err) {
      console.error("Review update error:", err);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm("Yorumu silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`reviews/film/review/${reviewId}/`);
      loadReviews();
    } catch (err) {
      console.error("Review delete error:", err);
    }
  };

  const updateLibraryStatus = async (newStatus) => {
    if (!me || !film) return;

    const all = await api.get("library/film/");
    const items = toArray(all.data);

    const existing = items.find(
      (s) =>
        s.user === me.id &&
        String(s.film_external_id) === String(id)
    );

    if (existing) {
      await api.delete(`library/film/${existing.id}/`);
    }

    await api.post("library/film/", {
      user: me.id,
      film: film.id,
      status: newStatus,
    });

    setLibraryStatus(newStatus);
  };

  if (loading || !film) {
    return <div className="loading">Yükleniyor...</div>;
  }

  const overview =
    film.overview && film.overview.trim().length > 0
      ? film.overview
      : "Bu film için açıklama bulunamadı.";

  const yearLabel = film.release_year ? film.release_year : "Bilgi yok";
  const runtimeLabel = film.runtime ? `${film.runtime} dk` : "Bilgi yok";
  const genresLabel =
    film.genres && film.genres.trim().length > 0
      ? film.genres
      : "Bilgi yok";
  const actorsLabel =
    film.actors && film.actors.trim().length > 0
      ? film.actors
      : "Bilgi yok";

  return (
    <>
      <Navbar />

      <div className="detail-top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Geri
        </button>
      </div>

      <div className="detail-container">
        <div className="left">
          <img
            src={film.poster_url || "/no_pic.jpg"}
            className="detail-poster"
            alt={film.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/no_pic.jpg";
            }}
          />
        </div>

        <div className="right">
          <h1 className="detail-title">{film.title}</h1>

          <p className="detail-director">
            <strong>Yönetmen:</strong> {film.director || "Bilgi yok"}
          </p>

          <p className="detail-overview">{overview}</p>

          <div className="detail-info">
            <div>
              <strong>Yıl:</strong> {yearLabel}
            </div>
            <div>
              <strong>Süre:</strong> {runtimeLabel}
            </div>
            <div>
              <strong>Türler:</strong> {genresLabel}
            </div>
            <div>
              <strong>Oyuncular:</strong> {actorsLabel}
            </div>
          </div>

          <h3 className="rating-header">
            Ortalama:{" "}
            <span className="rating-number">
              {film.stats?.average || "—"}
            </span>{" "}
            ({film.stats?.count} oy)
          </h3>

          <div className="rating-buttons">
            {[...Array(10)].map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  className={
                    rating === n ? "selected rating-btn" : "rating-btn"
                  }
                  onClick={() => submitRating(n)}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <hr className="detail-divider" />

          <h3 className="section-title">Kütüphane</h3>

          <div className="library-btn-row">
            <button
              className={
                libraryStatus === "watched" ? "lib-btn active" : "lib-btn"
              }
              onClick={() => updateLibraryStatus("watched")}
            >
              İzledim
            </button>

            <button
              className={
                libraryStatus === "to_watch" ? "lib-btn active" : "lib-btn"
              }
              onClick={() => updateLibraryStatus("to_watch")}
            >
              İzleyeceğim
            </button>

            <button
              className="list-add-btn"
              onClick={() => setAddListModal(true)}
            >
              + Listeye Ekle
            </button>
          </div>

          <hr className="detail-divider" />

          <h3 className="section-title">Yorum Yap</h3>
          <textarea
            className="review-input"
            placeholder="Yorumunuzu yazın..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <button className="submit-review" onClick={submitReview}>
            Gönder
          </button>

          <hr className="detail-divider reviews-divider" />

          <h3 className="section-title">Yorumlar</h3>

          {reviews.length === 0 && (
            <div className="no-reviews">Henüz yorum yok.</div>
          )}

          {reviews.map((r) => {
            const isOwner = me && r.user && r.user.id === me.id;
            const dateLabel = r.created_at
              ? new Date(r.created_at).toLocaleDateString("tr-TR")
              : "";

            return (
              <div className="review-card" key={r.id}>
                <div className="review-header">
                  <div
                    className="review-user clickable"
                    onClick={() => navigate(`/profile/${r.user.id}`)}
                  >
                    {r.user.username}
                  </div>
                  <div className="review-meta">
                    <span className="review-date">{dateLabel}</span>
                    {isOwner && (
                      <div className="review-actions">
                        <button
                          className="review-edit-btn"
                          onClick={() => startEditReview(r)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="review-delete-btn"
                          onClick={() => deleteReview(r.id)}
                        >
                          Sil
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editingReviewId === r.id ? (
                  <>
                    <textarea
                      className="review-input edit"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                    />
                    <div className="review-edit-actions">
                      <button
                        className="review-edit-btn primary-save"
                        onClick={() => saveEditReview(r.id)}
                      >
                        Kaydet
                      </button>
                      <button
                        className="cancel-edit-btn"
                        onClick={cancelEditReview}
                      >
                        Vazgeç
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="review-text">{r.text}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {addListModal && (
        <AddToListModal
          contentType="film"
          externalId={id}
          close={() => setAddListModal(false)}
        />
      )}
    </>
  );
}
