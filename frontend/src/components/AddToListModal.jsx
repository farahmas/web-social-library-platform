import { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/modal.css";

export default function AddToListModal({ contentType, externalId, close }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getMe = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const loadLists = async () => {
      try {
        const res = await api.get("custom-lists/");
        const me = getMe();
        const all = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        const mine = me ? all.filter((l) => l.user === me.id) : [];
        setLists(mine);
      } catch (err) {
        console.log("List load error:", err);
        setError("Listeler yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, []);

  const handleAddToList = async (listId) => {
    setError("");

    try {
      let bookId = null;
      let filmId = null;

      if (contentType === "book") {
        const res = await api.post("books/google/import/", {
          google_id: externalId,
        });
        bookId = res.data.id;
      } else if (contentType === "film") {
        const res = await api.post("films/import/", {
          tmdb_id: externalId,
        });
        filmId = res.data.id;
      } else {
        setError("Geçersiz içerik tipi.");
        return;
      }

      await api.post("custom-lists/items/", {
        custom_list: listId,
        content_type: contentType,
        book: bookId,
        film: filmId,
      });

      close();
    } catch (err) {
      console.log("Add to list error:", err);
      setError("Listeye eklenemedi.");
    }
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Listeye Ekle</h2>

        {loading && <p>Yükleniyor...</p>}

        {!loading && lists.length === 0 && (
          <p>Henüz listen yok.</p>
        )}

        {!loading &&
          lists.length > 0 &&
          lists.map((list) => (
            <button
              key={list.id}
              className="save-btn"
              onClick={() => handleAddToList(list.id)}
            >
              {list.name}
            </button>
          ))}

        {error && <p className="modal-error">{error}</p>}

        <button className="cancel-btn" onClick={close}>
          Kapat
        </button>
      </div>
    </div>
  );
}
