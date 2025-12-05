// src/components/CreateListModal.jsx
import { useState } from "react";
import api from "../api/axios";
import "../styles/modal.css";

export default function CreateListModal({ close, onCreated }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const createList = async () => {
    if (!name.trim()) {
      setError("Liste adı boş olamaz.");
      return;
    }

    try {
      await api.post("custom-lists/", { name });

      if (onCreated) onCreated();
      close();
    } catch (err) {
      console.log("List create error:", err);
      setError("Liste oluşturulamadı.");
    }
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Yeni Liste Oluştur</h2>

        <input
          type="text"
          placeholder="Liste adı..."
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />

        {error && <p className="modal-error">{error}</p>}

        <button className="save-btn" onClick={createList}>
          Oluştur
        </button>

        <button className="cancel-btn" onClick={close}>
          İptal
        </button>
      </div>
    </div>
  );
}
