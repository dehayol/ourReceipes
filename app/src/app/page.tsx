import { getAllRecipes, getCategories, CATEGORY_EMOJIS } from "@/lib/recipes";
import Header from "@/components/Header";
import RecipeCard from "@/components/RecipeCard";
import HeroCarousel from "@/components/HeroCarousel";
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

  const suggestions = allRecipes.slice(0, 6);

  // Bento grid : 5 colonnes × 2 recettes = 10 max
  const bentoRecipes = allRecipes.slice(0, 10);
  const bentoColumns = Array.from({ length: 5 }, (_, colIdx) =>
    [bentoRecipes[colIdx * 2], bentoRecipes[colIdx * 2 + 1]].filter(Boolean)
  ).filter((col) => col.length > 0);

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

  const isDefault = !q && !categoryFilter;

  return (
    <>
      <Header />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 80px" }}>

        {/* Category tags — toujours visibles */}
        <div
          className="scroll-x anim-fade-in"
          style={{ display: "flex", gap: 10, marginBottom: 32, paddingBottom: 4 }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10, flexShrink: 0,
              textDecoration: "none", fontSize: 13, fontWeight: 600,
              background: isDefault ? "var(--accent)" : "transparent",
              color: isDefault ? "white" : "var(--ink)",
              border: "1px solid var(--accent)",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            Tout voir
          </Link>
          {categories.map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <Link
                key={cat}
                href={isActive ? "/" : `/?category=${encodeURIComponent(cat)}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 10, flexShrink: 0,
                  textDecoration: "none", fontSize: 13, fontWeight: 600,
                  background: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "white" : "var(--ink)",
                  border: "1px solid var(--accent)",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span>{CATEGORY_EMOJIS[cat]}</span>
                {cat}
              </Link>
            );
          })}
        </div>

        {/* === SEARCH RESULTS === */}
        {q && (
          <section className="anim-fade-up">
            <div style={{ marginBottom: 24, display: "flex", alignItems: "baseline", gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>
                Résultats pour « {params.q} »
              </h2>
              <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                {filtered.length} recette{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p style={{ fontSize: 16, marginBottom: 16 }}>Aucune recette trouvée.</p>
                <Link href="/" style={{
                  color: "var(--accent)", textDecoration: "none",
                  fontWeight: 600, fontSize: 14,
                }}>
                  Voir toutes les recettes
                </Link>
              </div>
            ) : (
              <div className="recipe-grid">
                {filtered.map((recipe, i) => (
                  <div key={recipe.id} className={`anim-fade-up anim-delay-${Math.min(i + 1, 9)}`}>
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* === CATEGORY FILTER === */}
        {!q && categoryFilter && (
          <section className="anim-fade-up">
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>
                {CATEGORY_EMOJIS[categoryFilter]} {categoryFilter}
              </h2>
              <p style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
                {filtered.length} recette{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--ink-muted)" }}>
                <p>Aucune recette dans cette catégorie.</p>
              </div>
            ) : (
              <div className="recipe-grid">
                {filtered.map((recipe, i) => (
                  <div key={recipe.id} className={`anim-fade-up anim-delay-${Math.min(i + 1, 9)}`}>
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* === DEFAULT HOMEPAGE === */}
        {isDefault && (
          <>
            {/* Hero carousel */}
            {suggestions.length > 0 && (
              <div className="anim-fade-up" style={{ marginBottom: 48 }}>
                <HeroCarousel recipes={suggestions} />
              </div>
            )}

            {/* Catégories */}
            <section style={{ marginBottom: 48 }} className="anim-fade-up anim-delay-2">
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 16,
              }}>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Catégories</h2>
                <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                  {allRecipes.length} recette{allRecipes.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="categories-grid">
                {categories.map((cat, i) => {
                  const count = allRecipes.filter((r) => r.category === cat).length;
                  return (
                    <Link
                      key={cat}
                      href={`/?category=${encodeURIComponent(cat)}`}
                      className={`cat-card anim-fade-up anim-delay-${i + 1}`}
                      style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        gap: 8, padding: "16px 10px",
                        border: "1px solid var(--accent)", borderRadius: 10,
                        textDecoration: "none", color: "var(--ink)",
                        textAlign: "center", background: "var(--bg)",
                      }}
                    >
                      <span style={{ fontSize: 36 }}>{CATEGORY_EMOJIS[cat]}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{cat}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                        {count} recette{count !== 1 ? "s" : ""}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Toutes les recettes — bento grid */}
            {bentoRecipes.length > 0 && (
              <section className="anim-fade-up anim-delay-3">
                <div style={{
                  display: "flex", alignItems: "baseline",
                  justifyContent: "space-between",
                  marginBottom: 20, paddingBottom: 14,
                  borderBottom: "1px solid var(--line)",
                }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>Toutes les recettes</h2>
                  <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                    {allRecipes.length} recette{allRecipes.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="bento-wrapper">
                  {bentoColumns.map((col, colIdx) => {
                    // Colonnes paires : court en haut / tall en bas
                    // Colonnes impaires : tall en haut / court en bas
                    const shortFirst = colIdx % 2 === 0;
                    return (
                      <div key={colIdx} className="bento-col">
                        {col.map((recipe, itemIdx) => {
                          const isShort = itemIdx === 0 ? shortFirst : !shortFirst;
                          return (
                            <Link
                              key={recipe.id}
                              href={`/recettes/${recipe.id}`}
                              className="bento-item"
                              style={{ flex: isShort ? "140 140 0" : "244 244 0" }}
                            >
                              {recipe.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={recipe.image}
                                  alt={recipe.title}
                                  style={{
                                    position: "absolute", inset: 0,
                                    width: "100%", height: "100%", objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div style={{
                                  position: "absolute", inset: 0,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: 52, background: "var(--bg-alt)",
                                }}>
                                  {recipe.emoji}
                                </div>
                              )}
                              {/* Gradient sombre depuis le bas */}
                              <div style={{
                                position: "absolute", inset: 0,
                                background: "linear-gradient(to top, rgba(35,40,42,0.85) 0%, transparent 50%)",
                                pointerEvents: "none",
                              }} />
                              {/* Titre */}
                              <div style={{
                                position: "absolute", bottom: 14, left: 14, right: 14,
                              }}>
                                <p style={{
                                  color: "white", fontWeight: 700,
                                  fontSize: 13, lineHeight: 1.3,
                                }}>
                                  {recipe.title}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Voir toutes sur mobile si plus de 10 */}
                {allRecipes.length > 10 && (
                  <p style={{ marginTop: 16, fontSize: 13, color: "var(--ink-muted)", textAlign: "center" }}>
                    + {allRecipes.length - 10} autres — utilisez la recherche ou les catégories
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <footer style={{
        borderTop: "1px solid var(--line)",
        padding: "24px 20px", textAlign: "center",
        fontSize: 13, color: "var(--ink-muted)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
      }}>
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
        /* Grilles */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .recipe-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (min-width: 768px) {
          .categories-grid {
            grid-template-columns: repeat(6, 1fr);
          }
          .recipe-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }

        /* Bento grid — mobile : 2-col CSS grid */
        .bento-wrapper {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .bento-col {
          display: contents;
        }
        .bento-item {
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          aspect-ratio: 1;
          background: var(--bg-alt);
          display: block;
          text-decoration: none;
          transition: transform 0.3s;
        }
        .bento-item:hover { transform: scale(1.02); }

        @media (min-width: 768px) {
          /* Desktop : flex bento à 5 colonnes, hauteur fixe */
          .bento-wrapper {
            display: flex;
            height: 400px;
            gap: 16px;
          }
          .bento-col {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 16px;
          }
          .bento-item {
            aspect-ratio: auto;
            border-radius: 8px;
          }
        }

        .footer-backup-link {
          display: inline-flex; align-items: center; gap: 5px;
          color: var(--ink-muted); text-decoration: none; opacity: 0.5;
          transition: opacity 0.15s;
        }
        .footer-backup-link:hover { opacity: 1; }

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
