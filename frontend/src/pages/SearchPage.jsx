import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

import CarouselRow from "../components/CarouselRow";
import StarRating from "../components/StarRating";

import "../styles/search.css";

const TMDB_GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const TMDB_GENRE_NAMES = [...new Set(Object.values(TMDB_GENRES))];

export default function SearchPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [popularBooks, setPopularBooks] = useState([]);
  const [popularFilms, setPopularFilms] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [topFilms, setTopFilms] = useState([]);

  const [filters, setFilters] = useState({
    type: "all",
    year: "",
    rating: "",
    genre: "",
  });

  const [genreOptions, setGenreOptions] = useState(TMDB_GENRE_NAMES);

  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1950; y--) years.push(y);

  useEffect(() => {
    loadModules();
    loadGenres();
  }, []);

  const loadModules = async () => {
    try {
      const [booksRes, filmsRes] = await Promise.all([
        api.get("books/popular-local/"),
        api.get("films/popular-local/"),
      ]);

      const booksData = Array.isArray(booksRes.data)
        ? booksRes.data
        : booksRes.data.results || [];
      const filmsData = Array.isArray(filmsRes.data)
        ? filmsRes.data
        : filmsRes.data.results || [];

      setPopularBooks(booksData);
      setPopularFilms(filmsData);

      setTopBooks(
        [...booksData].sort(
          (a, b) =>
            (parseFloat(b.avg_rating) || 0) - (parseFloat(a.avg_rating) || 0)
        )
      );
      setTopFilms(
        [...filmsData].sort(
          (a, b) =>
            (parseFloat(b.avg_rating) || 0) - (parseFloat(a.avg_rating) || 0)
        )
      );
    } catch (err) {
      console.error("Popularity modules error:", err);
    }
  };

  const loadGenres = async () => {
    try {
      await api.get("films/genres/");
    } catch (err) {
      console.error("Genre load error:", err);
    } finally {
      setGenreOptions(TMDB_GENRE_NAMES);
    }
  };

  const genreIdToName = (id) => TMDB_GENRES[id] || null;

  const normalizeTitle = (title) =>
    (title || "")
      .normalize("NFKD")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .trim()
      .toLowerCase()
      .replace(/^[^a-z0-9ğüşöçı]+/i, "");

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    try {
      let booksList = [];
      let filmsList = [];

      if (filters.type === "all" || filters.type === "book") {
        const booksRes = await api.get("books/google/search/", {
          params: { q },
        });
        const booksRaw = booksRes.data;
        booksList = Array.isArray(booksRaw)
          ? booksRaw
          : booksRaw.results || [];
      }

      if (filters.type === "all" || filters.type === "film") {
        const filmsRes = await api.get("films/tmdb/search/", {
          params: { q },
        });
        const filmsRaw = filmsRes.data;
        filmsList = Array.isArray(filmsRaw)
          ? filmsRaw
          : filmsRaw.results || [];
      }

      let combined = [
        ...booksList.map((b) => ({
          ...b,
          _type: "book",
          external_id: b.google_id,
          title: b.title,
          poster_url: b.thumbnail,
          avg_rating: b.avg_rating || 0,
          rating_count: b.rating_count || 0,
          year: b.year || b.publish_year,
        })),
        ...filmsList.map((f) => {
          const year =
            f.year ||
            f.release_year ||
            (f.release_date ? String(f.release_date).slice(0, 4) : null);

          return {
            ...f,
            _type: "film",
            external_id: f.external_id,
            poster_url: f.poster_url,
            avg_rating: f.avg_rating || 0,
            rating_count: f.rating_count || 0,
            year,
          };
        }),
      ];

      combined = await enrichWithLocalFilmStats(combined);

      if (q) {
        const qNorm = normalizeTitle(q);
        combined = combined.filter((item) =>
          normalizeTitle(item.title).startsWith(qNorm)
        );
      }

      if (filters.type !== "all") {
        combined = combined.filter((i) => i._type === filters.type);
      }

      if (filters.year) {
        combined = combined.filter((i) => {
          const y = i.year || i.release_year || i.publish_year;
          return String(y || "") === String(filters.year);
        });
      }

      if (filters.genre) {
        const selectedName = filters.genre.toLowerCase();

        combined = combined.filter((item) => {
          if (item._type !== "film") return false;

          const names = new Set();

          Object.keys(item).forEach((key) => {
            if (!key.toLowerCase().includes("genre")) return;
            const value = item[key];

            if (Array.isArray(value)) {
              value.forEach((v) => {
                if (typeof v === "number") {
                  const name = genreIdToName(v);
                  if (name) names.add(name.toLowerCase());
                } else if (typeof v === "string") {
                  names.add(v.toLowerCase());
                }
              });
            } else if (typeof value === "string") {
              value
                .split(/[\/,|]/)
                .map((t) => t.trim())
                .filter(Boolean)
                .forEach((g) => names.add(g.toLowerCase()));
            }
          });

          if (names.size === 0) return false;
          return names.has(selectedName);
        });
      }

      if (filters.rating) {
        combined = combined.filter(
          (i) => (parseFloat(i.avg_rating) || 0) >= parseFloat(filters.rating)
        );
      }

      setResults(combined);
      setHasSearched(true);
    } catch (err) {
      console.error("Search error:", err);
      alert("Arama sırasında bir hata oluştu.");
    }
  };

  const openDetail = async (item) => {
    try {
      if (item._type === "book") {
        await api.post("books/google/import/", {
          google_id: item.external_id,
        });
        navigate(`/book/${item.external_id}`);
      } else {
        await api.post("films/import/", {
          tmdb_id: Number(item.external_id),
        });
        navigate(`/film/${item.external_id}`);
      }
    } catch (err) {
      console.error("Import error:", err);
      alert("İçerik yüklenemedi.");
    }
  };

  const enrichWithLocalFilmStats = async (items) => {
    return Promise.all(
      items.map(async (item) => {
        if (item._type !== "film") return item;

        try {
          const res = await api.get(`films/${item.external_id}/rating-stats/`);
          const data = res.data || {};
          const average = data.average;
          const count = data.count;

          if (average == null && (count == null || count === 0)) {
            return item;
          }

          return {
            ...item,
            avg_rating:
              average != null
                ? average
                : item.avg_rating || item.rating || item.vote_average || 0,
            rating_count:
              typeof count === "number"
                ? count
                : item.rating_count || item.vote_count || 0,
          };
        } catch (err) {
          console.error("film rating-stats error:", err);
          return item;
        }
      })
    );
  };

  return (
    <>
      <Navbar />

      <div className="search-container-netflix">
        <h2 className="netflix-title">Arama &amp; Keşfet</h2>

        <form className="search-box-netflix" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Kitap veya film ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Ara</button>
        </form>

        <div className="filters-netflix">
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value })
            }
          >
            <option value="all">Tümü</option>
            <option value="book">Kitaplar</option>
            <option value="film">Filmler</option>
          </select>

          <select
            value={filters.year}
            onChange={(e) =>
              setFilters({ ...filters, year: e.target.value })
            }
          >
            <option value="">Yıl</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={filters.genre}
            onChange={(e) =>
              setFilters({ ...filters, genre: e.target.value })
            }
          >
            <option value="">Tür</option>
            {genreOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={filters.rating}
            onChange={(e) =>
              setFilters({ ...filters, rating: e.target.value })
            }
          >
            <option value="">Puan</option>
            <option value="5">5+ ⭐</option>
            <option value="7">7+ ⭐</option>
            <option value="8">8+ ⭐</option>
          </select>
        </div>

        {results.length > 0 && (
          <>
            <h3 className="netflix-section">Arama Sonuçları</h3>

            <div className="grid-netflix">
              {results.map((item, i) => {
                const avg = parseFloat(item.avg_rating) || 0;
                const year =
                  item.year ||
                  item.release_year ||
                  item.publish_year ||
                  "";

                return (
                  <div
                    key={i}
                    className="grid-card"
                    onClick={() => openDetail(item)}
                  >
                    <div className="grid-img-wrapper">
                      <img
                        src={item.poster_url || "/no_pic.jpg"}
                        className="grid-img"
                        alt={item.title}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/no_pic.jpg";
                        }}
                      />
                      <div className="grid-badge-type">
                        {item._type === "book" ? "KİTAP" : "FİLM"}
                      </div>
                      {year && (
                        <div className="grid-badge-year">{year}</div>
                      )}
                    </div>

                    <div className="grid-info">
                      <div className="grid-title">
                        {item.title?.length > 50
                          ? item.title.slice(0, 50) + "…"
                          : item.title}
                      </div>

                      <div className="grid-rating-line">
                        <StarRating value={avg} />
                        <span className="grid-rating-count">
                          {item.rating_count || 0} oy
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {hasSearched && results.length === 0 && (
          <p className="no-results-text">
            Seçilen filtrelere uygun sonuç bulunamadı.
          </p>
        )}

        {!hasSearched && (
          <>
            <CarouselRow
              title="En Popüler Filmler"
              items={popularFilms}
              type="film"
            />
            <CarouselRow
              title="En Popüler Kitaplar"
              items={popularBooks}
              type="book"
            />
            <CarouselRow
              title="En Yüksek Puanlı Filmler"
              items={topFilms}
              type="film"
            />
            <CarouselRow
              title="En Yüksek Puanlı Kitaplar"
              items={topBooks}
              type="book"
            />
          </>
        )}
      </div>
    </>
  );
}
