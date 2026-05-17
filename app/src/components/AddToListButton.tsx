"use client";

import { useState } from "react";
import { parseServings } from "@/utils/scaleQuantity";

interface Props {
  recipeId: string;
  recipeServings: string; // e.g. "4 personnes"
}

type Status = "idle" | "open" | "done" | "error";

export default function AddToListButton({ recipeId, recipeServings }: Props) {
  const base = parseServings(recipeServings);
  const [status, setStatus] = useState<Status>("idle");
  const [loading, setLoading] = useState(false);
  const [servings, setServings] = useState(base);

  const open = () => { setServings(base); setStatus("open"); };
  const close = () => setStatus("idle");

  const confirm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, requestedServings: servings }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      window.dispatchEvent(new Event("shopping-list-updated"));
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    } finally {
      setLoading(false);
    }
  };

  if (status === "done") {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "12px 20px", borderRadius: 100,
        background: "#f0fdf4", border: "1px solid #bbf7d0",
        color: "#16a34a", fontSize: 14, fontWeight: 600,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Ajouté à la liste !
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "12px 20px", borderRadius: 100,
        background: "#fef2f2", border: "1px solid #fecaca",
        color: "#dc2626", fontSize: 14, fontWeight: 600,
      }}>
        Erreur, réessaie
      </div>
    );
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={open}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 20px", borderRadius: 100,
          background: "transparent", color: "var(--ink)",
          border: "1px solid var(--line)",
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Liste de courses
      </button>

      {/* Modal */}
      {status === "open" && (
        <div
          onClick={close}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg)", borderRadius: 16,
              padding: 28, width: "100%", maxWidth: 340,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              animation: "slideUp 0.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
              Ajouter à la liste
            </h3>
            <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 24 }}>
              Pour combien de personnes ?
            </p>

            {/* Servings stepper */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 20, marginBottom: 28,
            }}>
              <button
                onClick={() => setServings(Math.max(1, servings - 1))}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "1px solid var(--line)", background: "var(--bg-alt)",
                  cursor: "pointer", fontSize: 20, fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ink)",
                }}
              >−</button>
              <span style={{ fontSize: 28, fontWeight: 700, minWidth: 48, textAlign: "center" }}>
                {servings}
              </span>
              <button
                onClick={() => setServings(servings + 1)}
                style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "1px solid var(--line)", background: "var(--bg-alt)",
                  cursor: "pointer", fontSize: 20, fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--ink)",
                }}
              >+</button>
            </div>

            <p style={{ fontSize: 12, color: "var(--ink-muted)", textAlign: "center", marginBottom: 24 }}>
              Recette de base : {recipeServings}
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={close}
                style={{
                  flex: 1, padding: "12px", borderRadius: 100,
                  border: "1px solid var(--line)", background: "transparent",
                  cursor: "pointer", fontSize: 14, fontWeight: 500,
                  fontFamily: "inherit", color: "var(--ink)",
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirm}
                disabled={loading}
                style={{
                  flex: 2, padding: "12px", borderRadius: 100,
                  background: "var(--accent)", color: "white",
                  border: "none", cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Ajout…" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </>
  );
}
