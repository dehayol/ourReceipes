"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "mijote_admin_auth";

type Status = "idle" | "uploading" | "done" | "error";

export default function RestoreBackupButton() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [count, setCount] = useState<number | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      setStatus("error");
      setErrorMsg("Sélectionne un fichier .zip généré par la sauvegarde.");
      return;
    }

    const confirmed = window.confirm(
      `Restaurer depuis "${file.name}" ?\n\nCela remplacera TOUTES les recettes actuelles. Cette action est irréversible.`
    );
    if (!confirmed) {
      e.target.value = "";
      return;
    }

    setStatus("uploading");
    setErrorMsg("");

    const pwd = sessionStorage.getItem(STORAGE_KEY) ?? "";
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "x-admin-password": pwd },
        body: formData,
      });

      const data = await res.json() as { error?: string; count?: number };
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);

      setCount(data.count ?? null);
      setStatus("done");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      e.target.value = "";
    }
  };

  const isLoading = status === "uploading";

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".zip"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <button
        onClick={() => {
          setStatus("idle");
          setErrorMsg("");
          setCount(null);
          fileRef.current?.click();
        }}
        disabled={isLoading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 24px", borderRadius: 100,
          border: "1px solid var(--line)",
          background: "var(--bg)", color: "var(--ink)",
          fontSize: 14, fontWeight: 500,
          cursor: isLoading ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? (
          <svg style={{ animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 15 12 10 17 15"/>
            <line x1="12" y1="10" x2="12" y2="22"/>
          </svg>
        )}
        {isLoading ? "Restauration…" : "Restaurer un backup"}
      </button>

      {status === "done" && count !== null && (
        <p style={{
          marginTop: 10, fontSize: 13, color: "#16a34a",
          padding: "10px 14px", background: "#f0fdf4",
          borderRadius: 8, border: "1px solid #bbf7d0",
        }}>
          {count} recette{count !== 1 ? "s" : ""} restaurée{count !== 1 ? "s" : ""} avec succès.
        </p>
      )}

      {errorMsg && (
        <p style={{
          marginTop: 10, fontSize: 13, color: "#dc2626",
          padding: "10px 14px", background: "#fef2f2",
          borderRadius: 8, border: "1px solid #fecaca",
          maxWidth: 400,
        }}>
          {errorMsg}
        </p>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
