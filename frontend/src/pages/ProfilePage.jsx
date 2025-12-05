import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import ActivityCard from "../components/ActivityCard";
import CreateListModal from "../components/CreateListModal";
import "../styles/profile.css";

const toArray = (data) =>
  Array.isArray(data) ? data : data?.results || [];

export default function ProfilePage() {
  const { id } = useParams();
  const userId = parseInt(id, 10);
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState(null);

  const [libraryBooks, setLibraryBooks] = useState([]);
  const [libraryFilms, setLibraryFilms] = useState([]);

  const [customLists, setCustomLists] = useState([]);
  const [activities, setActivities] = useState([]);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followId, setFollowId] = useState(null);

  const [activeTab, setActiveTab] = useState("profile");

  const [libraryTab, setLibraryTab] = useState("books");
  const [subTabBook, setSubTabBook] = useState("read");
  const [subTabFilm, setSubTabFilm] = useState("watched");

  const [editModal, setEditModal] = useState(false);
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [editBio, setEditBio] = useState("");

  const [createListModal, setCreateListModal] = useState(false);

  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getMe = () => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const me = getMe();

  useEffect(() => {
    setLoading(true);
    setError("");
    loadAll();
    
  }, [userId]);

  const loadAll = async () => {
    try {
      await Promise.all([
        loadProfile(),
        loadStats(),
        loadLibrary(),
        loadLists(),
        loadActivity(),
        loadFollowData(),
      ]);
    } catch (err) {
      console.error("Profile load error:", err);
      setError("Profil yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await api.get(`users/${userId}/`);
      setProfileUser(res.data);

      const meLocal = getMe();
      setIsOwnProfile(meLocal?.id === res.data.id);

      setEditBio(res.data?.profile?.bio || "");
    } catch (err) {
      console.error("loadProfile error:", err);
      setError((prev) => prev || "Profil bilgileri alınamadı.");
    }
  };

  const loadFollowData = async () => {
    try {
      const res = await api.get("social/");
      const meLocal = getMe();
      if (!meLocal) return;

      const all = toArray(res.data);

      const followers = all.filter((f) => f.following === userId);
      const following = all.filter((f) => f.follower === userId);

      setFollowersCount(followers.length);
      setFollowingCount(following.length);

      const relation = all.find(
        (f) => f.follower === meLocal.id && f.following === userId
      );

      if (relation) {
        setIsFollowing(true);
        setFollowId(relation.id);
      } else {
        setIsFollowing(false);
        setFollowId(null);
      }

      const followerIds = [...new Set(followers.map((f) => f.follower))];
      const followingIds = [...new Set(following.map((f) => f.following))];
      const uniqueIds = [...new Set([...followerIds, ...followingIds])];

      const userMap = {};
      await Promise.all(
        uniqueIds.map(async (uid) => {
          try {
            const uRes = await api.get(`users/${uid}/`);
            userMap[uid] = uRes.data;
          } catch (e) {
            console.error("load user for follow modal error", e);
          }
        })
      );

      setFollowersList(followerIds.map((fid) => userMap[fid]).filter(Boolean));
      setFollowingList(
        followingIds.map((fid) => userMap[fid]).filter(Boolean)
      );
    } catch (err) {
      console.error("loadFollowData error:", err);
    }
  };

  const followUser = async () => {
    const meLocal = getMe();
    if (!meLocal) return;

    try {
      await api.post("social/", {
        follower: meLocal.id,
        following: userId,
      });
      await loadFollowData();
    } catch (err) {
      console.error("followUser error:", err);
    }
  };

  const unfollowUser = async () => {
    if (!followId) return;
    try {
      await api.delete(`social/${followId}/`);
      await loadFollowData();
    } catch (err) {
      console.error("unfollowUser error:", err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get(`library/stats/${userId}/`);
      setStats(res.data);
    } catch (err) {
      console.error("loadStats error:", err);
      setError((prev) => prev || "İstatistikler alınamadı.");
    }
  };

  const loadLibrary = async () => {
    try {
      const [booksRes, filmsRes] = await Promise.all([
        api.get("library/book/"),
        api.get("library/film/"),
      ]);

      const books = toArray(booksRes.data);
      const films = toArray(filmsRes.data);

      const meBooks = books.filter((b) => b.user === userId);
      const meFilms = films.filter((f) => f.user === userId);

      const enrichedBooks = meBooks.map((b) => ({
        id: b.id,
        status: b.status,
        external_id: b.book_external_id,
        title: b.book_title,
        cover: b.book_cover,
      }));

      const enrichedFilms = meFilms.map((f) => ({
        id: f.id,
        status: f.status,
        external_id: f.film_external_id,
        title: f.film_title,
        poster: f.film_poster,
      }));

      setLibraryBooks(enrichedBooks);
      setLibraryFilms(enrichedFilms);
    } catch (err) {
      console.error("loadLibrary error:", err);
    }
  };

  const loadLists = async () => {
    try {
      const res = await api.get("custom-lists/");
      const data = toArray(res.data);

      const mine = data.filter((list) => list.user === userId);
      setCustomLists(mine);
    } catch (err) {
      console.error("loadLists error:", err);
    }
  };

  const loadActivity = async () => {
    try {
      let page = 1;
      let allActivities = [];
      let hasNext = true;

      while (hasNext) {
        const res = await api.get("activity/", {
          params: { page, user: userId },
        });

        const pageResults = toArray(res.data);
        if (!pageResults.length) {
          hasNext = false;
          break;
        }

        const filtered = pageResults.filter(
          (a) => a.user && a.user.id === userId
        );
        allActivities = allActivities.concat(filtered);

        if (res.data && res.data.next) {
          page += 1;
        } else {
          hasNext = false;
        }
      }

      setActivities(allActivities);
    } catch (err) {
      console.error("loadActivity error:", err);
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditAvatarFile(file);
    } else {
      setEditAvatarFile(null);
    }
  };

  const submitEditProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("bio", editBio || "");

      if (editAvatarFile) {
        formData.append("avatar_file", editAvatarFile);
      }

      await api.patch("users/me/update/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const meLocal = getMe();
      if (meLocal) {
        const fresh = await api.get(`users/${meLocal.id}/`);
        localStorage.setItem("user", JSON.stringify(fresh.data));
      }

      setEditModal(false);
      setEditAvatarFile(null);
      loadProfile();
    } catch (err) {
      console.error("submitEditProfile error:", err);
    }
  };

  if (loading || !profileUser || !stats) {
    return (
      <>
        <Navbar />
        <div className="loading">Yükleniyor...</div>
      </>
    );
  }

  const avatarSrc =
    profileUser.profile?.avatar_file ||
    profileUser.profile?.avatar ||
    "/profile.jpg";

  const listCount = customLists.length;

  const currentBookStatus = subTabBook;
  const currentFilmStatus = subTabFilm;

  return (
    <>
      <Navbar />

      <div className="profile-page">
        {error && <div className="error-box">{error}</div>}

        <section className="profile-hero">
          <div className="profile-avatar-wrapper">
            <img
              src={avatarSrc}
              className="profile-avatar"
              alt="avatar"
              onError={(e) => (e.target.src = "/profile.jpg")}
            />
          </div>

          <div className="profile-hero-main">
            <div className="profile-hero-row">
              <h1 className="profile-name">{profileUser.username}</h1>

              <div className="profile-hero-actions">
                {!isOwnProfile && me && (
                  <>
                    {isFollowing ? (
                      <button
                        className="btn-secondary"
                        onClick={unfollowUser}
                      >
                        Takipten Çık
                      </button>
                    ) : (
                      <button className="btn-primary" onClick={followUser}>
                        Takip Et
                      </button>
                    )}
                  </>
                )}

                {isOwnProfile && (
                  <button
                    className="btn-outline"
                    onClick={() => setEditModal(true)}
                  >
                    Profili Düzenle
                  </button>
                )}
              </div>
            </div>

            <p className="profile-sub">
              {profileUser.profile?.bio
                ? profileUser.profile.bio
                : "Henüz biyografi eklenmemiş."}
            </p>

            <div className="profile-meta-row">
              <button
                className="meta-chip"
                onClick={() => setShowFollowersModal(true)}
              >
                <span className="meta-number">{followersCount}</span>
                <span>takipçi</span>
              </button>

              <button
                className="meta-chip"
                onClick={() => setShowFollowingModal(true)}
              >
                <span className="meta-number">{followingCount}</span>
                <span>takip</span>
              </button>
            </div>
          </div>
        </section>

        <div className="tabs">
          <button
            className={activeTab === "profile" ? "tab active" : "tab"}
            onClick={() => setActiveTab("profile")}
          >
            Profil
          </button>
          <button
            className={activeTab === "library" ? "tab active" : "tab"}
            onClick={() => setActiveTab("library")}
          >
            Kütüphane
          </button>
          <button
            className={activeTab === "lists" ? "tab active" : "tab"}
            onClick={() => setActiveTab("lists")}
          >
            Listeler
          </button>
          <button
            className={activeTab === "activity" ? "tab active" : "tab"}
            onClick={() => setActiveTab("activity")}
          >
            Aktiviteler
          </button>
        </div>

        {activeTab === "profile" && (
          <div className="tab-content">
            <h2 className="section-title">İstatistikler</h2>

            <div className="stats-box">
              <div className="stat-item">
                <span className="stat-number">{stats.books_read}</span>
                <span>Kitap Okudu</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.books_to_read}</span>
                <span>Okuyacak Kitap</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.films_watched}</span>
                <span>Film İzledi</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.films_to_watch}</span>
                <span>İzleyecek Film</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.total_ratings}</span>
                <span>Puanlama</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.total_reviews}</span>
                <span>Yorum</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{listCount}</span>
                <span>Özel Liste</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "library" && (
          <div className="tab-content">
            <div className="library-filter-row">
              <div className="library-toggle-group">
                <button
                  className={
                    libraryTab === "books"
                      ? "toggle-pill active"
                      : "toggle-pill"
                  }
                  onClick={() => setLibraryTab("books")}
                >
                  Kitaplar
                </button>
                <button
                  className={
                    libraryTab === "films"
                      ? "toggle-pill active"
                      : "toggle-pill"
                  }
                  onClick={() => setLibraryTab("films")}
                >
                  Filmler
                </button>
              </div>

              <div className="library-status-group">
                {libraryTab === "books" ? (
                  <>
                    <button
                      className={
                        currentBookStatus === "read"
                          ? "switch-chip active"
                          : "switch-chip"
                      }
                      onClick={() => setSubTabBook("read")}
                    >
                      Okudum
                    </button>
                    <button
                      className={
                        currentBookStatus === "to_read"
                          ? "switch-chip active"
                          : "switch-chip"
                      }
                      onClick={() => setSubTabBook("to_read")}
                    >
                      Okuyacağım
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={
                        currentFilmStatus === "watched"
                          ? "switch-chip active"
                          : "switch-chip"
                      }
                      onClick={() => setSubTabFilm("watched")}
                    >
                      İzledim
                    </button>
                    <button
                      className={
                        currentFilmStatus === "to_watch"
                          ? "switch-chip active"
                          : "switch-chip"
                      }
                      onClick={() => setSubTabFilm("to_watch")}
                    >
                      İzleyeceğim
                    </button>
                  </>
                )}
              </div>
            </div>

            {libraryTab === "books" && (
              <div className="grid-lib">
                {libraryBooks
                  .filter((b) => b.status === currentBookStatus)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="lib-card"
                      onClick={() => navigate(`/book/${b.external_id}`)}
                    >
                      <img
                        src={b.cover || "/no_pic.jpg"}
                        className="lib-img"
                        alt={b.title}
                        onError={(e) => (e.target.src = "/no_pic.jpg")}
                      />
                      <div className="lib-title">{b.title}</div>
                    </div>
                  ))}
              </div>
            )}

            {libraryTab === "films" && (
              <div className="grid-lib">
                {libraryFilms
                  .filter((f) => f.status === currentFilmStatus)
                  .map((f) => (
                    <div
                      key={f.id}
                      className="lib-card"
                      onClick={() => navigate(`/film/${f.external_id}`)}
                    >
                      <img
                        src={f.poster || "/no_pic.jpg"}
                        className="lib-img"
                        alt={f.title}
                        onError={(e) => (e.target.src = "/no_pic.jpg")}
                      />
                      <div className="lib-title">{f.title}</div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "lists" && (
          <div className="tab-content">
            {isOwnProfile && (
              <button
                className="btn-primary list-create-btn"
                onClick={() => setCreateListModal(true)}
              >
                Yeni Liste Oluştur
              </button>
            )}

            {customLists.length === 0 && (
              <div className="empty-text">Henüz liste yok.</div>
            )}

            <div className="list-grid">
              {customLists.map((list) => (
                <div key={list.id} className="list-card">
                  <h3 className="list-name">{list.name}</h3>

                  <div className="list-items-preview">
                    {list.items?.slice(0, 4).map((item, i) => (
                      <img
                        key={i}
                        src={
                          item.book_cover ||
                          item.film_poster ||
                          "/no_pic.jpg"
                        }
                        className="list-item-img"
                        alt=""
                        onError={(e) => (e.target.src = "/no_pic.jpg")}
                      />
                    ))}

                    {(!list.items || list.items.length === 0) && (
                      <div className="list-empty-thumb">Boş liste</div>
                    )}
                  </div>

                  <button
                    className="btn-outline full-width list-open-btn"
                    onClick={() => navigate(`/list/${list.id}`)}
                  >
                    Listeyi Aç
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="tab-content">
            <h2 className="section-title">Son Aktiviteler</h2>

            {activities.length === 0 && (
              <div className="empty-text">Henüz aktivite yok.</div>
            )}

            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>

      {editModal && (
        <div
          className="modal-overlay"
          onClick={() => setEditModal(false)}
        >
          <div
            className="modal-content profile-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="profile-edit-title">Profili Düzenle</h2>

            <div className="edit-avatar-preview-row">
              <div className="profile-avatar-wrapper">
                <img
                  src={avatarSrc}
                  alt="avatar preview"
                  className="profile-avatar"
                  onError={(e) => (e.target.src = "/profile.jpg")}
                />
              </div>
            </div>

            <label className="modal-label">Bilgisayardan Görsel Seç</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
            />

            <label className="modal-label">Biyografi</label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
            />

            <div className="modal-actions-row">
              <button className="save-btn" onClick={submitEditProfile}>
                Kaydet
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditModal(false)}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {createListModal && (
        <CreateListModal
          close={() => setCreateListModal(false)}
          onCreated={loadLists}
        />
      )}

      {showFollowersModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFollowersModal(false)}
        >
          <div
            className="modal-content follow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Takipçiler</h2>

            {followersList.length === 0 && <p>Henüz takipçi yok.</p>}

            {followersList.length > 0 && (
              <ul className="follow-list">
                {followersList.map((u) => (
                  <li
                    key={u.id}
                    className="follow-list-item"
                    onClick={() => {
                      setShowFollowersModal(false);
                      navigate(`/profile/${u.id}`);
                    }}
                  >
                    <img
                      src={
                        u.profile?.avatar_file ||
                        u.profile?.avatar ||
                        "/profile.jpg"
                      }
                      alt={u.username}
                      className="follow-avatar"
                      onError={(e) => (e.target.src = "/profile.jpg")}
                    />
                    <span className="follow-username">{u.username}</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="cancel-btn"
              onClick={() => setShowFollowersModal(false)}
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {showFollowingModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFollowingModal(false)}
        >
          <div
            className="modal-content follow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Takip Ettikleri</h2>

            {followingList.length === 0 && <p>Henüz takip edilen yok.</p>}

            {followingList.length > 0 && (
              <ul className="follow-list">
                {followingList.map((u) => (
                  <li
                    key={u.id}
                    className="follow-list-item"
                    onClick={() => {
                      setShowFollowingModal(false);
                      navigate(`/profile/${u.id}`);
                    }}
                  >
                    <img
                      src={
                        u.profile?.avatar_file ||
                        u.profile?.avatar ||
                        "/profile.jpg"
                      }
                      alt={u.username}
                      className="follow-avatar"
                      onError={(e) => (e.target.src = "/profile.jpg")}
                    />
                    <span className="follow-username">{u.username}</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              className="cancel-btn"
              onClick={() => setShowFollowingModal(false)}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
