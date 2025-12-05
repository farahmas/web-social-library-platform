import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !password2) {
      setError("Lütfen her iki şifre alanını da doldurun.");
      return;
    }

    if (password !== password2) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("auth/password-reset-confirm/", {
        uid,
        token,
        password,
        password2,
      });

      setSuccess(res.data.detail || "Şifre başarıyla güncellendi.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err.response?.data);
      const data = err.response?.data || {};
      const msg =
        data.detail ||
        "Bağlantı geçersiz veya süresi dolmuş olabilir. Lütfen yeniden talep edin.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-title">Yeni Şifre Oluştur</div>

        {success && <div className="auth-success">{success}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="password"
            placeholder="Yeni şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Yeni şifre (tekrar)"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>

        <div className="auth-link">
          <Link to="/login">Giriş ekranına dön</Link>
        </div>
      </div>
    </div>
  );
}
