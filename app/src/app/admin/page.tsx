import { getAllRecipes } from "@/lib/recipes";
import Header from "@/components/Header";
import Link from "next/link";
import AdminAuthGate from "@/components/AdminAuthGate";
import ImportRecipeButton from "@/components/ImportRecipeButton";

export default async function AdminPage() {
  const recipes = await getAllRecipes();

  return (
    <>
      <Header />
      <AdminAuthGate>
        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 32px 80px" }}>

          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 8 }}>
                  Backoffice
                </h1>
                <p style={{ color: "var(--ink-muted)", fontSize: 15 }}>
                  {recipes.length} recette{recipes.length !== 1 ? "s" : ""} dans la base
                </p>
              </div>
              <Link
                href="/admin/new"
                style={{
                  background: "var(--accent)", color: "white",
                  padding: "12px 24px", borderRadius: 100,
                  textDecoration: "none", fontSize: 14, fontWeight: 500,
                  display: "inline-flex", alignItems: "center", gap: 8,
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="M12 5v14" />
                </svg>
                Nouvelle recette
              </Link>
            </div>

            {/* Import depuis fichier */}
            <div style={{
              padding: "20px 24px",
              background: "var(--bg-alt)",
              borderRadius: 10,
              border: "1px solid var(--line)",
              display: "flex", alignItems: "center", gap: 20,
              flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>
                  Importer depuis un fichier
                </p>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                  Uploade un PDF ou un fichier .txt — Claude analyse le contenu et prérempli le formulaire automatiquement.
                </p>
              </div>
              <ImportRecipeButton />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recipes.map((r) => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px",
                background: "var(--bg)",
                borderRadius: 8, border: "1px solid var(--line)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 28 }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 2 }}>{r.title}</div>
                    <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
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
                      textDecoration: "none", fontSize: 13,
                    }}
                  >
                    Voir
                  </Link>
                  <Link
                    href={`/admin/edit/${r.id}`}
                    style={{
                      padding: "7px 14px", borderRadius: 100,
                      background: "var(--ink)", color: "white",
                      textDecoration: "none", fontSize: 13,
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
      <footer style={{ borderTop: "1px solid var(--line)", padding: 32, textAlign: "center", fontSize: 13, color: "var(--ink-muted)" }}>
        Mijoté · Backoffice
      </footer>
    </>
  );
}
