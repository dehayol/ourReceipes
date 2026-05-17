import { getAllRecipes } from "@/lib/recipes";

export const dynamic = "force-dynamic";
import Header from "@/components/Header";
import Link from "next/link";
import AdminAuthGate from "@/components/AdminAuthGate";
import ImportRecipeButton from "@/components/ImportRecipeButton";
import RestoreBackupButton from "@/components/RestoreBackupButton";

export default async function AdminPage() {
  const recipes = await getAllRecipes();

  return (
    <>
      <Header />
      <AdminAuthGate>
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>

          {/* Header backoffice */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              display: "flex", alignItems: "flex-start",
              justifyContent: "space-between", gap: 16,
              marginBottom: 24, flexWrap: "wrap",
            }}>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>
                  Backoffice
                </h1>
                <p style={{ color: "var(--ink-muted)", fontSize: 14 }}>
                  {recipes.length} recette{recipes.length !== 1 ? "s" : ""} dans la base
                </p>
              </div>
              <Link
                href="/admin/new"
                className="btn-primary"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "var(--accent)", color: "white",
                  padding: "11px 22px", borderRadius: 100,
                  textDecoration: "none", fontSize: 14, fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="M12 5v14" />
                </svg>
                Nouvelle recette
              </Link>
            </div>

            {/* Import */}
            <div style={{
              padding: "20px 24px",
              background: "var(--bg-alt)",
              borderRadius: 10,
              border: "1px solid var(--line)",
              display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                  Importer depuis un fichier
                </p>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                  PDF ou .txt — Claude analyse et prérempli le formulaire automatiquement.
                </p>
              </div>
              <ImportRecipeButton />
            </div>

            {/* Restaurer depuis un backup ZIP */}
            <div style={{
              padding: "20px 24px",
              background: "var(--bg-alt)",
              borderRadius: 10,
              border: "1px solid var(--line)",
              display: "flex", alignItems: "center", gap: 20,
              flexWrap: "wrap",
              marginTop: 12,
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                  Restaurer depuis une sauvegarde
                </p>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                  Uploade un fichier .zip exporté depuis le footer — toutes les recettes actuelles seront remplacées.
                </p>
              </div>
              <RestoreBackupButton />
            </div>
          </div>

          {/* Recipe list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recipes.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--ink-muted)", padding: "40px 0", fontSize: 14 }}>
                Aucune recette pour l&apos;instant.
              </p>
            )}
            {recipes.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: 12,
                  padding: "14px 18px",
                  background: "var(--bg)",
                  borderRadius: 10, border: "1px solid var(--line)",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 26 }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                      {r.category} · {r.totalTime} · {r.servings}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    href={`/recettes/${r.id}`}
                    style={{
                      padding: "7px 14px", borderRadius: 100,
                      border: "1px solid var(--line)", color: "var(--ink-soft)",
                      textDecoration: "none", fontSize: 13, fontWeight: 500,
                    }}
                  >
                    Voir
                  </Link>
                  <Link
                    href={`/admin/edit/${r.id}`}
                    style={{
                      padding: "7px 14px", borderRadius: 100,
                      background: "var(--ink)", color: "white",
                      textDecoration: "none", fontSize: 13, fontWeight: 500,
                    }}
                  >
                    Modifier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </AdminAuthGate>

      <footer style={{
        borderTop: "1px solid var(--line)",
        padding: "24px 20px", textAlign: "center",
        fontSize: 13, color: "var(--ink-muted)",
      }}>
        Mijoté · Backoffice
      </footer>
    </>
  );
}
