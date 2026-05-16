import { getRecipeById } from "@/lib/recipes";
import Header from "@/components/Header";
import AdminAuthGate from "@/components/AdminAuthGate";
import RecipeForm from "@/components/RecipeForm";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: Props) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  return (
    <>
      <Header />
      <AdminAuthGate>
        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 32px 80px" }}>
          <nav style={{ marginBottom: 32, fontSize: 14, color: "var(--ink-muted)" }}>
            <Link href="/admin" style={{ color: "var(--ink-muted)", textDecoration: "none" }}>Backoffice</Link>
            <span style={{ margin: "0 8px" }}>›</span>
            <Link href={`/recettes/${id}`} style={{ color: "var(--ink-muted)", textDecoration: "none" }}>{recipe.title}</Link>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "var(--ink)" }}>Modifier</span>
          </nav>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 40 }}>
            Modifier la recette
          </h1>
          <RecipeForm recipe={recipe} mode="edit" />
        </main>
      </AdminAuthGate>
      <footer style={{ borderTop: "1px solid var(--line)", padding: 32, textAlign: "center", fontSize: 13, color: "var(--ink-muted)" }}>
        Mijoté · Backoffice
      </footer>
    </>
  );
}
