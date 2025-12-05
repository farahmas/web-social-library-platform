import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import "../styles/listDetail.css";
import "../styles/detail.css";

export default function CustomListDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addMode, setAddMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const me = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const loadList = async () => {
      try {
        const res = await api.get(`custom-lists/${id}/`);
        setList(res.data);
        setItems(res.data.items || []);
      } catch (err) {
        console.log("List load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadList();
  }, [id]);

  const reloadList = async () => {
    try {
      const res = await api.get(`custom-lists/${id}/`);
      setList(res.data);
      setItems(res.data.items || []);
    } catch (err) {
      console.log("Reload list error:", err);
    }
  };

  const deleteList = async () => {
    if (!window.confirm("Bu listeyi silmek istediğine emin misin?")) return;

    try {
      await api.delete(`custom-lists/${id}/`);
      if (me) {
        navigate(`/profile/${me.id}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`custom-lists/items/${itemId}/`);
      reloadList();
    } catch (err) {
      console.log("Remove error:", err);
    }
  };

  const searchContent = async () => {
    if (!searchQuery.trim()) return;

    try {
      const [booksRes, filmsRes] = await Promise.all([
        api.get("books/google/search/", { params: { q: searchQuery } }),
        api.get("films/tmdb/search/", { params: { q: searchQuery } }),
      ]);

      const booksList = Array.isArray(booksRes.data)
        ? booksRes.data
        : booksRes.data.results || [];
      const filmsList = Array.isArray(filmsRes.data)
        ? filmsRes.data
        : filmsRes.data.results || [];

      const normalized = [
        ...booksList.map((b) => ({
          _type: "book",
          external_id: b.google_id,
          title: b.title,
          image: b.thumbnail,
        })),
        ...filmsList.map((f) => ({
          _type: "film",
          external_id: f.external_id,
          title: f.title,
          image: f.poster_url,
        })),
      ];

      setSearchResults(normalized);
    } catch (err) {
      console.log("Search error:", err);
    }
  };

  const addItemToList = async (item) => {
    try {
      let bookId = null;
      let filmId = null;

      if (item._type === "book") {
        const res = await api.post("books/google/import/", {
          google_id: item.external_id,
        });
        bookId = res.data.id;
      } else {
        const res = await api.post("films/import/", {
          tmdb_id: Number(item.external_id),
        });
        filmId = res.data.id;
      }

      await api.post("custom-lists/items/", {
        custom_list: id,
        content_type: item._type,
        book: bookId,
        film: filmId,
      });

      setAddMode(false);
      setSearchQuery("");
      setSearchResults([]);

      reloadList();
    } catch (err) {
      console.log("Add error:", err);
    }
  };

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (!list) return <div className="loading">Liste bulunamadı.</div>;

  const isOwner = me && me.id === list.user;

  return (
    <>
      <Navbar />

      <div className="detail-top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Geri
        </button>
      </div>

      <div className="listDetail-container">
        <h1 className="listDetail-title">{list.name}</h1>

        {isOwner && (
          <>
            <button
              className="add-item-btn"
              onClick={() => setAddMode(!addMode)}
            >
              {addMode ? "Ekleme Modunu Kapat" : "İçerik Ekle"}
            </button>

            <button className="delete-list-btn" onClick={deleteList}>
              Listeyi Sil
            </button>
          </>
        )}

        {addMode && (
          <div className="addBox">
            <h3>İçerik Ara</h3>

            <div className="search-add">
              <input
                type="text"
                placeholder="Kitap veya film ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={searchContent}>Ara</button>
            </div>

            <div className="search-results">
              {searchResults.map((item, i) => (
                <div
                  key={i}
                  className="search-card"
                  onClick={() => addItemToList(item)}
                >
                  <img
                    src={item.image || "/no_pic.jpg"}
                    alt="image"
                    className="search-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no_pic.jpg";
                    }}
                  />
                  <div className="search-title">{item.title}</div>
                  <div className="type-tag">
                    {item._type === "book" ? "Kitap" : "Film"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="items-grid">
          {items.length === 0 && (
            <div className="empty-msg">Bu liste boş.</div>
          )}

          {items.map((item) => {
            const isBook = item.content_type === "book";
            const title = isBook ? item.book_title : item.film_title;
            const img = isBook ? item.book_cover : item.film_poster;
            const externalId = isBook
              ? item.book_external_id
              : item.film_external_id;

            return (
              <div key={item.id} className="item-card">
                <img
                  src={img || "/no_pic.jpg"}
                  alt="poster"
                  className="item-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/no_pic.jpg";
                  }}
                />

                <div className="item-title">
                  {title || "Bilinmiyor"}
                  <span className="type-tag-inline">
                    {isBook ? "Kitap" : "Film"}
                  </span>
                </div>

                <button
                  className="open-detail-btn"
                  onClick={() =>
                    navigate(
                      isBook ? `/book/${externalId}` : `/film/${externalId}`
                    )
                  }
                >
                  Detayı Aç
                </button>

                {isOwner && (
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                  >
                    Kaldır
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
