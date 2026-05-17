"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";

interface Suggestion {
  id: string;
  title: string;
  image: string | null;
  emoji: string;
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SmallSearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function useSearch(query: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => setSuggestions([]), []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await res.json() as Suggestion[];
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 180);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  return { suggestions, clear };
}

interface SearchBoxProps {
  onSubmit: (q: string) => void;
  autoFocus?: boolean;
  inputStyle?: React.CSSProperties;
  wrapperStyle?: React.CSSProperties;
}

function SearchBox({ onSubmit, autoFocus, inputStyle, wrapperStyle }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { suggestions, clear } = useSearch(query);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showDropdown = open && suggestions.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    clear();
    onSubmit(query);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const handleSuggestionClick = (id: string) => {
    setOpen(false);
    clear();
    setQuery("");
    router.push(`/recettes/${id}`);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", ...wrapperStyle }}>
      <form onSubmit={handleSubmit} style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          color: "var(--ink-muted)", pointerEvents: "none",
          display: "flex", alignItems: "center",
        }}>
          <SmallSearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher une recette..."
          autoFocus={autoFocus}
          className="search-input"
          autoComplete="off"
          style={{
            width: "100%",
            border: "1px solid var(--line)", borderRadius: showDropdown ? "10px 10px 0 0" : 10,
            fontFamily: "inherit", fontSize: 14,
            background: "var(--bg-alt)", color: "var(--ink)",
            ...inputStyle,
          }}
        />
      </form>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div className="suggestions-dropdown" style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "var(--bg)",
          border: "1px solid var(--line)", borderTop: "none",
          borderRadius: "0 0 10px 10px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          zIndex: 100,
        }}>
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s.id); }}
              className="suggestion-row"
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", padding: "10px 14px",
                background: "none", border: "none", cursor: "pointer",
                borderTop: i > 0 ? "1px solid var(--line)" : "none",
                textAlign: "left", fontFamily: "inherit",
                animationDelay: `${i * 40}ms`,
              }}
            >
              {/* Thumbnail */}
              <div style={{
                width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                overflow: "hidden", background: "var(--bg-alt)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  s.emoji
                )}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
                {s.title}
              </span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        .suggestion-row:hover { background: var(--bg-alt) !important; }

        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes suggestion-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .suggestions-dropdown {
          animation: dropdown-in 0.18s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .suggestion-row {
          animation: suggestion-in 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = (q: string) => {
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : "/");
    setSearchOpen(false);
  };

  return (
    <header
      className="header-anim"
      style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(251, 251, 249, 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "0 20px",
        height: 60,
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 16,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Mijoté" style={{ height: 28, width: "auto", display: "block" }} />
        </Link>

        {/* Desktop search */}
        <div className="header-search-desktop" style={{ flex: 1, maxWidth: 380 }}>
          <SearchBox
            onSubmit={handleSubmit}
            inputStyle={{ padding: "9px 16px 9px 38px" }}
          />
        </div>

        {/* Right icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Search icon – mobile only */}
          <button
            className="header-icon-btn header-search-mobile-btn"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Rechercher"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--ink)", padding: "6px",
              display: "flex", alignItems: "center", borderRadius: 8,
            }}
          >
            <SearchIcon />
          </button>

          {/* Add recipe */}
          <Link
            href="/admin/new"
            className="header-icon-btn"
            aria-label="Ajouter une recette"
            style={{
              display: "flex", alignItems: "center",
              color: "var(--ink)", textDecoration: "none",
              padding: "6px", borderRadius: 8,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8" /><path d="M8 12h8" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Mobile search panel */}
      {searchOpen && (
        <div style={{ borderTop: "1px solid var(--line)", padding: "12px 20px" }} className="header-search-panel">
          <SearchBox
            onSubmit={(q) => { handleSubmit(q); setSearchOpen(false); }}
            autoFocus
            inputStyle={{ padding: "11px 16px 11px 38px", fontSize: 15 }}
          />
        </div>
      )}

      <style>{`
        .header-search-desktop { display: none !important; }
        .header-search-mobile-btn { display: flex !important; }
        .header-search-panel { display: block; }
        @media (min-width: 768px) {
          .header-search-desktop { display: block !important; }
          .header-search-mobile-btn { display: none !important; }
          .header-search-panel { display: none !important; }
        }
      `}</style>
    </header>
  );
}
