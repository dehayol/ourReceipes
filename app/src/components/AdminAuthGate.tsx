"use client";

import { useState, useEffect, type ReactNode } from "react";

const STORAGE_KEY = "mijote_admin_auth";

export default function AdminAuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) setAuthed(true);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwd }),
    });
    if (res.ok) {
      sessionStorage.setItem(STORAGE_KEY, pwd);
      setAuthed(true);
    } else {
      setError(true);
    }
  };

  if (loading) return null;

  if (!authed) {
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{
          background: "var(--bg)", border: "1px solid var(--line)",
          borderRadius: 12, padding: "40px 32px",
          maxWidth: 380, width: "100%",
          boxShadow: "var(--shadow)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ fontSize: 36 }}>🔒</span>
            <h2 style={{
              fontSize: 24, fontWeight: 700,
              marginTop: 12, marginBottom: 8,
            }}>
              Zone admin
            </h2>
            <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>
              Entrez le mot de passe pour accéder au backoffice.
            </p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="password"
              value={pwd}
              onChange={(e) => { setPwd(e.target.value); setError(false); }}
              placeholder="Mot de passe"
              autoFocus
              className="search-input"
              style={{
                width: "100%", padding: "12px 16px",
                border: `1px solid ${error ? "#dc2626" : "var(--line)"}`,
                borderRadius: 10, fontSize: 15,
                fontFamily: "inherit", background: "var(--bg)", color: "var(--ink)",
              }}
            />
            {error && (
              <p style={{ fontSize: 13, color: "#dc2626", marginTop: -6 }}>
                Mot de passe incorrect.
              </p>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: "12px", borderRadius: 100,
                background: "var(--accent)", color: "white",
                border: "none", fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Accéder
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
