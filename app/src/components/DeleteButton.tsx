"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  recipeId: string;
}

export default function DeleteButton({ recipeId }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    const pwd = sessionStorage.getItem("mijote_admin_auth") ?? "";
    const res = await fetch(`/api/recipes/${recipeId}`, {
      method: "DELETE",
      headers: { "x-admin-password": pwd },
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  };

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Supprimer ?</span>
        <button
          onClick={handleDelete}
          style={{
            padding: "8px 16px", borderRadius: 100,
            background: "#dc2626", color: "white",
            border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Oui, supprimer
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            padding: "8px 14px", borderRadius: 100,
            background: "transparent", color: "var(--ink)",
            border: "1px solid var(--line)", fontSize: 13,
            cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
          }}
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "10px 18px", borderRadius: 100,
        border: "1px solid var(--line)",
        background: "transparent", color: "var(--ink-muted)",
        fontSize: 13, fontWeight: 500, cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
      Supprimer
    </button>
  );
}
