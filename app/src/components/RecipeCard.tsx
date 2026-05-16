import Link from "next/link";
import Image from "next/image";
import type { Recipe } from "@/types/recipe";

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  return (
    <Link
      href={`/recettes/${recipe.id}`}
      className="recipe-card-wrap"
      style={{
        cursor: "pointer",
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
      <div
        className="card-img"
        style={{
          position: "relative",
          aspectRatio: "4 / 3",
          borderRadius: 6,
          background: "var(--bg-alt)",
          marginBottom: 16,
        }}
      >
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            style={{ objectFit: "cover", transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              background: "var(--bg-alt)",
              transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {recipe.emoji}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--accent)",
          fontWeight: 500,
          marginBottom: 6,
          transition: "letter-spacing 0.2s ease",
        }}
      >
        {recipe.category}
      </div>

      <h3
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 22,
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          marginBottom: 10,
        }}
      >
        {recipe.title}
      </h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 13,
          color: "var(--ink-muted)",
        }}
      >
        <span>{recipe.totalTime}</span>
        <span>·</span>
        <span>{recipe.servings}</span>
      </div>
    </Link>
  );
}
