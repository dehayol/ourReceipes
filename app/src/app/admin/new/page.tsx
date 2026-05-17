import Header from "@/components/Header";
import AdminAuthGate from "@/components/AdminAuthGate";
import Link from "next/link";
import NewRecipeClient from "@/components/NewRecipeClient";

interface Props {
  searchParams: Promise<{ import?: string }>;
}

export default async function NewRecipePage({ searchParams }: Props) {
  const params = await searchParams;
  const isImport = params.import === "1";

  return (
    <>
      <Header />
      <AdminAuthGate>
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>
          <nav style={{ marginBottom: 28, fontSize: 13, color: "var(--ink-muted)" }}>
            <Link href="/admin" style={{ color: "var(--ink-muted)", textDecoration: "none" }}>
              Backoffice
            </Link>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "var(--ink)" }}>Nouvelle recette</span>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {isImport ? "Recette importée" : "Nouvelle recette"}
            </h1>
            {isImport && (
              <span style={{
                padding: "4px 12px", borderRadius: 100,
                background: "rgba(227, 63, 7, 0.1)", color: "var(--accent)",
                fontSize: 13, fontWeight: 600,
              }}>
                ✨ Prérempli par Claude
              </span>
            )}
          </div>

          <NewRecipeClient isImport={isImport} />
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
