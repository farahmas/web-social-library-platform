import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "../styles/auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    if (!email.trim()) {
      setError("Lütfen e-posta adresinizi girin.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("auth/password-reset/", { email });
      setStatus(
        res.data.detail ||
          "Eğer bu e-pposta kayıtlıysa, şifre sıfırlama bağlantısı gönderildi."
      );
    } catch (err) {
      console.error(err.response?.data);
      setError(
        "İstek gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-title">Şifremi Unuttum</div>

        {status && <div className="auth-success">{status}</div>}
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            type="email"
            placeholder="Kayıtlı e-posta adresin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>

        <div className="auth-link">
          <Link to="/login">Giriş ekranına dön</Link>
        </div>
      </div>
    </div>
  );
}
