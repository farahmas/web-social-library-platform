import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import AddToListModal from "../components/AddToListModal";
import "../styles/detail.css";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
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
    Promise.all([loadBook(), loadRating(), loadReviews()]).finally(() =>
      setLoading(false)
    );
  }, [id]);

  const loadBook = async () => {
    try {
      const res = await api.get(`books/${id}/`);
      const stats = await api.get(`books/${id}/rating-stats/`);

      const fullBook = {
        ...res.data,
        stats: stats.data,
      };

      setBook(fullBook);

      if (fullBook.id) {
        loadLibraryStatus(fullBook.id);
      }
    } catch (err) {
      console.error("Book load error:", err);
    }
  };

  const loadRating = async () => {
    try {
      const res = await api.get(`ratings/book/${id}/`);
      const scoreNum = Number(res.data.score);
      setRating(Number.isNaN(scoreNum) ? null : scoreNum);
    } catch {
      setRating(null);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await api.get(`reviews/book/${id}/`);
      setReviews(res.data);
    } catch (err) {
      console.error("Review load error:", err);
    }
  };

  const loadLibraryStatus = async (bookPk) => {
    try {
      const res = await api.get("library/book/");
      if (!me) return;

      const items = toArray(res.data);

      const statusObj = items.find(
        (s) => s.user === me.id && String(s.book) === String(bookPk)
      );

      setLibraryStatus(statusObj ? statusObj.status : null);
    } catch (err) {
      console.error("Library load error:", err);
    }
  };

  const submitRating = async (value) => {
    try {
      setRating(value);

      await api.post(`ratings/book/${id}/`, {
        score: value,
      });

      loadBook();
    } catch (err) {
      console.error("Rating error:", err);
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim()) return;

    try {
      await api.post(`reviews/book/${id}/`, {
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
      await api.put(`reviews/book/review/${reviewId}/`, {
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
      await api.delete(`reviews/book/review/${reviewId}/`);
      loadReviews();
    } catch (err) {
      console.error("Review delete error:", err);
    }
  };

  const updateLibraryStatus = async (newStatus) => {
    if (!me || !book || !book.id) return;

    const bookPk = book.id;

    try {
      const all = await api.get("library/book/");
      const items = toArray(all.data);

      const existing = items.find(
        (s) => s.user === me.id && String(s.book) === String(bookPk)
      );

      if (existing && existing.status === newStatus) {
        await api.delete(`library/book/${existing.id}/`);
        setLibraryStatus(null);
        return;
      }

      if (existing) {
        await api.delete(`library/book/${existing.id}/`);
      }

      await api.post("library/book/", {
        user: me.id,
        book: bookPk,
        status: newStatus,
      });

      setLibraryStatus(newStatus);
    } catch (err) {
      console.error("Library update error:", err);
    }
  };

  if (loading || !book) {
    return <div className="loading">Yükleniyor...</div>;
  }

  const description =
    book.description && book.description.trim().length > 0
      ? book.description
      : "Bu kitap için açıklama bulunamadı.";

  const yearLabel = book.publish_year ? book.publish_year : "Bilgi yok";
  const pageLabel = book.page_count ? book.page_count : "Bilgi yok";

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
            src={book.cover_url || "/profile.jpg"}
            className="detail-poster"
            alt={book.title}
            onError={(e) => (e.target.src = "/profile.jpg")}
          />
        </div>

        <div className="right">
          <h1 className="detail-title">{book.title}</h1>

          <p className="detail-director">
            <strong>Yazar(lar):</strong> {book.authors || "—"}
          </p>

          <p className="detail-overview">{description}</p>

          <div className="detail-info">
            <div>
              <strong>Yıl:</strong> {yearLabel}
            </div>
            <div>
              <strong>Sayfa:</strong> {pageLabel}
            </div>
          </div>

          <h3 className="rating-header">
            Ortalama:{" "}
            <span className="rating-number">
              {book.stats?.average || "—"}
            </span>{" "}
            ({book.stats?.count} oy)
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
                libraryStatus === "read" ? "lib-btn active" : "lib-btn"
              }
              onClick={() => updateLibraryStatus("read")}
            >
              Okudum
            </button>

            <button
              className={
                libraryStatus === "to_read" ? "lib-btn active" : "lib-btn"
              }
              onClick={() => updateLibraryStatus("to_read")}
            >
              Okuyacağım
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
          contentType="book"
          externalId={id}
          close={() => setAddListModal(false)}
        />
      )}
    </>
  );
}
