import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Lütfen kullanıcı adı/e-posta ve şifre girin.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("auth/login/", {
        username: identifier,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      const meRes = await api.get("auth/me/");
      localStorage.setItem("user", JSON.stringify(meRes.data));

      navigate("/");
    } catch (err) {
      console.log(err.response?.data);
      const data = err.response?.data || {};

      if (data.detail) {
        setError("Kullanıcı adı/e-posta veya şifre hatalı.");
      } else if (data.non_field_errors) {
        setError("Kullanıcı adı/e-posta veya şifre hatalı.");
      } else {
        setError("Giriş yapılırken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-title">Giriş Yap</div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="text"
            placeholder="Kullanıcı adı veya e-posta"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="auth-link">
          <Link to="/forgot-password">Şifremi Unuttum?</Link>
        </div>

        <div className="auth-link">
          Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
