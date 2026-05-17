import { getAllRecipes, getCategories, CATEGORY_EMOJIS } from "@/lib/recipes";
import Header from "@/components/Header";
import RecipeCard from "@/components/RecipeCard";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q?.toLowerCase() ?? "";
  const categoryFilter = params.category ?? "";

  const allRecipes = await getAllRecipes();
  const categories = getCategories();

  const filtered = allRecipes.filter((r) => {
    const matchQ =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q)) ||
      r.ingredients.some((i) => i.item.toLowerCase().includes(q));
    const matchCat = !categoryFilter || r.category === categoryFilter;
    return matchQ && matchCat;
  });

  const featured = allRecipes[0];

  return (
    <>
      <Header />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* HERO */}
        {!q && !categoryFilter && featured && (
          <section style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: 48,
            alignItems: "center",
            marginBottom: 64,
            padding: "8px 0 24px",
          }}>
            <div className="anim-fade-up">
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 12, fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.12em",
                color: "var(--accent)", marginBottom: 20,
              }}>
                <span style={{ width: 24, height: 1, background: "var(--accent)", display: "inline-block" }} />
                Dernière recette ajoutée
              </div>
              <h1 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "clamp(40px, 5vw, 64px)",
                fontWeight: 400,
                lineHeight: 1.02,
                letterSpacing: "-0.025em",
                marginBottom: 24,
              }}>
                {featured.title}
              </h1>
              <p style={{ color: "var(--ink-soft)", fontSize: 17, maxWidth: 480, marginBottom: 28 }}>
                {featured.description}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 14, color: "var(--ink-soft)" }}>
                <span>⏱ {featured.totalTime}</span>
                <span>👥 {featured.servings}</span>
                <span>📊 {featured.difficulty}</span>
              </div>
              <Link
                href={`/recettes/${featured.id}`}
                className="btn-primary"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  marginTop: 28,
                  background: "var(--accent)", color: "white",
                  padding: "12px 24px", borderRadius: 100,
                  textDecoration: "none", fontSize: 14, fontWeight: 500,
                }}
              >
                Voir la recette
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="hero-img-wrap" style={{
              position: "relative", aspectRatio: "4 / 5",
              borderRadius: 8, overflow: "hidden",
              background: "var(--bg-alt)", boxShadow: "var(--shadow)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 120,
            }}>
              {featured.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.image} alt={featured.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                featured.emoji
              )}
            </div>
          </section>
        )}

        {/* CATEGORIES */}
        {!q && (
          <section style={{ marginBottom: 64 }} className="anim-fade-up anim-delay-2">
            <div style={{
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
              marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid var(--line)",
            }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.015em" }}>
                Catégories
              </h2>
              {categoryFilter && (
                <Link href="/" style={{ fontSize: 13, color: "var(--ink-soft)", textDecoration: "none", fontWeight: 500 }}>
                  Voir tout
                </Link>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
              {categories.map((cat, i) => {
                const count = allRecipes.filter((r) => r.category === cat).length;
                const isActive = categoryFilter === cat;
                return (
                  <Link
                    key={cat}
                    href={isActive ? "/" : `/?category=${encodeURIComponent(cat)}`}
                    className={`cat-card anim-fade-up anim-delay-${i + 1}`}
                    style={{
                      background: isActive ? "var(--accent)" : "var(--bg)",
                      border: `1px solid ${isActive ? "var(--accent)" : "var(--line)"}`,
                      borderRadius: 12,
                      padding: "22px 16px",
                      textAlign: "center",
                      textDecoration: "none",
                      color: isActive ? "white" : "var(--ink)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: isActive ? "rgba(255,255,255,0.2)" : "var(--bg-alt)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22,
                      transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}>
                      {CATEGORY_EMOJIS[cat]}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{cat}</span>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>
                      {count} recette{count !== 1 ? "s" : ""}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* RECIPE GRID */}
        <section className="anim-fade-up anim-delay-3">
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 28, paddingBottom: 16, borderBottom: "1px solid var(--line)",
          }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, letterSpacing: "-0.015em" }}>
              {q ? `Résultats pour "${params.q}"` : categoryFilter ? categoryFilter : "Toutes les recettes"}
            </h2>
            <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>
              {filtered.length} recette{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-muted)" }} className="anim-fade-in">
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 17 }}>Aucune recette trouvée.</p>
              <Link href="/" style={{ color: "var(--accent)", textDecoration: "none", marginTop: 12, display: "inline-block" }}>
                Voir toutes les recettes
              </Link>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "32px 28px",
            }}>
              {filtered.map((recipe, i) => (
                <div
                  key={recipe.id}
                  className={`anim-fade-up anim-delay-${Math.min(i + 1, 9)}`}
                >
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      <footer style={{
        borderTop: "1px solid var(--line)",
        padding: 32, textAlign: "center",
        fontSize: 13, color: "var(--ink-muted)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
      }} className="anim-fade-in">
        <span>Mijoté · Notre livre de recettes maison</span>
        <a
          href="/api/export"
          download
          title="Télécharger une sauvegarde de toutes les recettes"
          className="footer-backup-link"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Sauvegarde
        </a>
      </footer>

      <style>{`
        .footer-backup-link {
          display: inline-flex; align-items: center; gap: 5px;
          color: var(--ink-muted); text-decoration: none; opacity: 0.5;
          transition: opacity 0.15s;
        }
        .footer-backup-link:hover { opacity: 1; }
        @media (max-width: 980px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .recipe-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .cat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .recipe-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
