"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "mijote_admin_auth";
const IMPORT_KEY = "mijote_import_recipe";

type Status = "idle" | "reading" | "parsing" | "done" | "error";

export default function ImportRecipeButton() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const extractText = async (file: File): Promise<string> => {
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      return file.text();
    }

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // Lire le PDF comme ArrayBuffer et extraire le texte brut
      // On utilise une approche simple : extraire les chaînes lisibles du PDF
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let text = "";

      // Décoder le PDF en cherchant les blocs de texte BT...ET
      const decoder = new TextDecoder("latin1");
      const raw = decoder.decode(bytes);

      // Extraire le contenu entre parenthèses (strings PDF) et les TJ/Tj operators
      const tjMatches = raw.matchAll(/\(([^)]{1,500})\)\s*(?:Tj|TJ)/g);
      for (const match of tjMatches) {
        const chunk = match[1]
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "")
          .replace(/\\t/g, " ")
          .replace(/\\\(/g, "(")
          .replace(/\\\)/g, ")")
          .replace(/\\\\/g, "\\");
        text += chunk + " ";
      }

      // Fallback : extraire tous les printable strings de plus de 4 chars
      if (text.trim().length < 100) {
        const printable = raw.match(/[\x20-\x7E\xC0-\xFF]{4,}/g) ?? [];
        text = printable
          .filter((s) => !/^[\x00-\x1F]*$/.test(s))
          .filter((s) => !s.startsWith("%PDF") && !s.startsWith("stream"))
          .join(" ");
      }

      return text.trim();
    }

    throw new Error("Format non supporté. Utilisez un fichier .pdf ou .txt");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("reading");
    setErrorMsg("");

    let text: string;
    try {
      text = await extractText(file);
      if (!text || text.trim().length < 20) {
        throw new Error("Impossible d'extraire le texte de ce fichier. Essayez un fichier .txt à la place.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur de lecture");
      return;
    }

    setStatus("parsing");

    const pwd = sessionStorage.getItem(STORAGE_KEY) ?? "";
    let result;
    try {
      const res = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pwd,
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? `Erreur ${res.status}`);
      }

      result = await res.json() as { recipe: Record<string, unknown> };
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur API");
      return;
    }

    // Stocker la recette parsée et rediriger vers le formulaire
    sessionStorage.setItem(IMPORT_KEY, JSON.stringify(result.recipe));
    setStatus("done");
    router.push("/admin/new?import=1");
  };

  const label: Record<Status, string> = {
    idle: "Importer un fichier",
    reading: "Lecture du fichier...",
    parsing: "Analyse par Claude...",
    done: "Recette importée !",
    error: "Réessayer",
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.txt,text/plain,application/pdf"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <button
        onClick={() => {
          setStatus("idle");
          setErrorMsg("");
          fileRef.current?.click();
        }}
        disabled={status === "reading" || status === "parsing"}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "12px 24px", borderRadius: 100,
          border: "1px solid var(--line)",
          background: "var(--bg)", color: "var(--ink)",
          fontSize: 14, fontWeight: 500, cursor: status === "reading" || status === "parsing" ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          opacity: status === "reading" || status === "parsing" ? 0.7 : 1,
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        {status === "reading" || status === "parsing" ? (
          <svg style={{ animation: "spin 1s linear infinite" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M12 18v-6" /><path d="m9 15 3-3 3 3" />
          </svg>
        )}
        {label[status]}
      </button>

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
