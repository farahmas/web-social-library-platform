import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.email || !form.password || !form.password2) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (form.password !== form.password2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    try {
      setLoading(true);

      await api.post("auth/register/", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/login");
    } catch (err) {
      console.log(err.response?.data);
      const data = err.response?.data || {};

      if (data.email) {
        setError("Bu e-posta zaten kullanımda.");
      } else if (data.username) {
        setError("Bu kullanıcı adı zaten mevcut.");
      } else if (data.password) {
        setError("Şifre çok zayıf veya geçersiz.");
      } else if (typeof data.detail === "string") {
        setError(data.detail);
      } else {
        setError("Kayıt işlemi başarısız oldu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-title">Hesap Oluştur</div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            name="username"
            placeholder="Kullanıcı adı"
            value={form.username}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="E-posta"
            value={form.email}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Şifre"
            value={form.password}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="password"
            name="password2"
            placeholder="Şifre (tekrar)"
            value={form.password2}
            onChange={handleChange}
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="auth-link">
          Zaten hesabın var mı? <a href="/login">Giriş Yap</a>
        </div>
      </div>
    </div>
  );
}
