import { getRecipeById, getAllRecipes } from "@/lib/recipes";
import Header from "@/components/Header";
import Link from "next/link";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import DeleteButton from "@/components/DeleteButton";
import AddToListButton from "@/components/AddToListButton";
import RecipeContent from "@/components/RecipeContent";

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

  const meta = [
    { label: "Préparation", value: recipe.prepTime },
    { label: "Cuisson", value: recipe.cookTime },
    { label: "Total", value: recipe.totalTime },
    { label: "Portions", value: recipe.servings },
    { label: "Difficulté", value: recipe.difficulty },
  ];

  return (
    <>
      <Header />

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Breadcrumb */}
        <nav className="anim-fade-in no-print" style={{ marginBottom: 28, fontSize: 13, color: "var(--ink-muted)" }}>
          <Link href="/" style={{ color: "var(--ink-muted)", textDecoration: "none" }}>Accueil</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <Link
            href={`/?category=${encodeURIComponent(recipe.category)}`}
            style={{ color: "var(--ink-muted)", textDecoration: "none" }}
          >
            {recipe.category}
          </Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <span style={{ color: "var(--ink)" }}>{recipe.title}</span>
        </nav>

        {/* Header recette */}
        <header className="anim-fade-up" style={{ marginBottom: 32 }}>
          <div style={{
            display: "inline-block",
            padding: "4px 12px", borderRadius: 100,
            border: "1px solid var(--accent)",
            fontSize: 12, fontWeight: 600, color: "var(--accent)",
            marginBottom: 14,
          }}>
            {recipe.category}
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 700, lineHeight: 1.1,
            letterSpacing: "-0.02em", marginBottom: 16,
          }}>
            {recipe.title}
          </h1>

          <p style={{
            fontSize: 16, color: "var(--ink-soft)",
            maxWidth: 600, marginBottom: 28, lineHeight: 1.65,
          }}>
            {recipe.description}
          </p>

          {/* Meta strip */}
          <div
            className="scroll-x"
            style={{
              display: "flex",
              borderTop: "1px solid var(--line)",
              borderBottom: "1px solid var(--line)",
              marginBottom: 28,
            }}
          >
            {meta.map(({ label, value }, i) => (
              <div
                key={label}
                style={{
                  display: "flex", flexDirection: "column", gap: 4,
                  padding: "14px 24px",
                  borderRight: i < meta.length - 1 ? "1px solid var(--line)" : "none",
                  flexShrink: 0,
                }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", color: "var(--ink-muted)",
                  whiteSpace: "nowrap",
                }}>
                  {label}
                </span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", whiteSpace: "nowrap" }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="no-print" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <AddToListButton recipeId={recipe.id} recipeServings={recipe.servings} />
            <PrintButton />
            <Link
              href={`/admin/edit/${recipe.id}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 18px", borderRadius: 100,
                border: "1px solid var(--line)",
                background: "transparent", color: "var(--ink)",
                textDecoration: "none", fontSize: 13, fontWeight: 600,
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
            borderRadius: 10,
            border: "1px solid var(--accent)",
            overflow: "hidden",
            marginBottom: 40, aspectRatio: "16 / 9",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recipe.image}
              alt={recipe.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Content : ingrédients + étapes */}
        <RecipeContent
          ingredients={recipe.ingredients}
          steps={recipe.steps}
          notes={recipe.notes}
        />
      </main>

      <footer className="anim-fade-in no-print" style={{
        borderTop: "1px solid var(--line)",
        padding: "24px 20px", textAlign: "center",
        fontSize: 13, color: "var(--ink-muted)",
      }}>
        Mijoté · Notre livre de recettes maison
      </footer>

      <style>{`
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
