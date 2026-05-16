"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/");
    }
  };

  return (
    <header
      className="header-anim"
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(250, 247, 242, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "18px 32px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 32,
      }}>
        <Link href="/" className="logo-wrap" style={{
          fontFamily: "'Fraunces', serif",
          fontWeight: 500, fontSize: 22,
          letterSpacing: "-0.02em",
          display: "flex", alignItems: "center", gap: 8,
          textDecoration: "none", color: "var(--ink)",
        }}>
          <span className="logo-mark" style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "var(--accent)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "var(--bg)", fontSize: 14, fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
          }}>M</span>
          <span>Mijoté<em style={{ fontStyle: "italic", fontWeight: 400 }}>.</em></span>
        </Link>

        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 420, position: "relative" }}>
          <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--ink-muted)" }}
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une recette, un ingrédient..."
            className="search-input"
            style={{
              width: "100%",
              background: "var(--bg-alt)",
              border: "1px solid transparent",
              borderRadius: 100,
              padding: "10px 16px 10px 42px",
              fontFamily: "inherit",
              fontSize: 14,
              color: "var(--ink)",
              outline: "none",
            }}
          />
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/admin"
            className="btn-primary"
            style={{
              background: "var(--ink)",
              color: "var(--bg)",
              border: "none",
              padding: "10px 18px",
              borderRadius: 100,
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5v14" />
            </svg>
            <span>Ajouter</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
