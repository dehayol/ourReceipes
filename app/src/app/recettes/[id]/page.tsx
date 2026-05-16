import { getRecipeById, getAllRecipes } from "@/lib/recipes";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import DeleteButton from "@/components/DeleteButton";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    return (await getAllRecipes()).map((r) => ({ id: r.id }));
  } catch {
    return [];
  }
}

export default async function RecipePage({ params }: Props) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  return (
    <>
      <Header />

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* Breadcrumb */}
        <nav
          className="anim-fade-in no-print"
          style={{ marginBottom: 32, fontSize: 14, color: "var(--ink-muted)" }}
        >
          <Link href="/" style={{ color: "var(--ink-muted)", textDecoration: "none", transition: "color 0.15s" }}>Accueil</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <Link href={`/?category=${encodeURIComponent(recipe.category)}`} style={{ color: "var(--ink-muted)", textDecoration: "none", transition: "color 0.15s" }}>
            {recipe.category}
          </Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <span style={{ color: "var(--ink)" }}>{recipe.title}</span>
        </nav>

        {/* Header recette */}
        <header className="anim-fade-up" style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em",
            color: "var(--accent)", fontWeight: 500, marginBottom: 12,
          }}>
            {recipe.category}
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 400, lineHeight: 1.1,
            letterSpacing: "-0.02em", marginBottom: 20,
          }}>
            {recipe.title}
          </h1>
          <p style={{ fontSize: 17, color: "var(--ink-soft)", maxWidth: 620, marginBottom: 28, lineHeight: 1.6 }}>
            {recipe.description}
          </p>

          {/* Meta */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 20,
            padding: "20px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)",
            marginBottom: 16,
          }}>
            {[
              { label: "Préparation", value: recipe.prepTime },
              { label: "Cuisson", value: recipe.cookTime },
              { label: "Total", value: recipe.totalTime },
              { label: "Portions", value: recipe.servings },
              { label: "Difficulté", value: recipe.difficulty },
            ].map(({ label, value }, i) => (
              <div key={label} className={`anim-fade-up anim-delay-${i + 1}`}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-muted)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="anim-fade-up anim-delay-3 no-print" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <PrintButton />
            <Link
              href={`/admin/edit/${recipe.id}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 18px", borderRadius: 100,
                border: "1px solid var(--line)",
                background: "transparent", color: "var(--ink)",
                textDecoration: "none", fontSize: 14, fontWeight: 500,
                transition: "border-color 0.2s, background 0.2s",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              Modifier
            </Link>
            <DeleteButton recipeId={recipe.id} />
          </div>
        </header>

        {/* Image */}
        {recipe.image && (
          <div className="anim-scale-in anim-delay-2" style={{
            borderRadius: 8, overflow: "hidden",
            marginBottom: 48, aspectRatio: "16 / 9",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={recipe.image} alt={recipe.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        {/* Content grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48 }}>

          {/* Ingrédients */}
          <div className="anim-fade-up anim-delay-3">
            <h2 style={{
              fontFamily: "'Fraunces', serif", fontSize: 22,
              fontWeight: 400, letterSpacing: "-0.01em",
              marginBottom: 20, paddingBottom: 12,
              borderBottom: "1px solid var(--line)",
            }}>
              Ingrédients
            </h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className={`ingredient-row anim-delay-${Math.min(i + 3, 9)}`}
                  style={{
                    display: "flex", gap: 12, fontSize: 15,
                    paddingBottom: 10, borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--accent)", minWidth: 60 }}>{ing.quantity}</span>
                  <span style={{ color: "var(--ink-soft)" }}>{ing.item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Étapes */}
          <div className="anim-fade-up anim-delay-4">
            <h2 style={{
              fontFamily: "'Fraunces', serif", fontSize: 22,
              fontWeight: 400, letterSpacing: "-0.01em",
              marginBottom: 20, paddingBottom: 12,
              borderBottom: "1px solid var(--line)",
            }}>
              Préparation
            </h2>
            <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 20 }}>
              {recipe.steps.map((step, i) => (
                <li
                  key={i}
                  className={`step-row anim-delay-${Math.min(i + 4, 9)}`}
                  style={{ display: "flex", gap: 16 }}
                >
                  <span style={{
                    minWidth: 32, height: 32,
                    background: "var(--accent)", color: "white",
                    borderRadius: "50%",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 600, fontSize: 14, flexShrink: 0, marginTop: 2,
                    transition: "transform 0.2s ease",
                  }}>
                    {i + 1}
                  </span>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)", paddingTop: 4 }}>
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            {recipe.notes && (
              <div className="anim-fade-up anim-delay-6" style={{
                marginTop: 32, padding: "20px 24px",
                background: "var(--bg-alt)", borderRadius: 8,
                borderLeft: "3px solid var(--accent)",
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: 8 }}>
                  Notes
                </p>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.7 }}>{recipe.notes}</p>
              </div>
            )}
          </div>

        </div>

      </main>

      <footer className="anim-fade-in no-print" style={{
        borderTop: "1px solid var(--line)",
        padding: 32, textAlign: "center",
        fontSize: 13, color: "var(--ink-muted)",
      }}>
        Mijoté · Notre livre de recettes maison
      </footer>

      <style>{`
        @media (max-width: 700px) {
          main > div:last-of-type {
            grid-template-columns: 1fr !important;
          }
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
