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
      style={{ display: "block", textDecoration: "none" }}
    >
      <div
        className="card-img"
        style={{
          position: "relative",
          borderRadius: 10,
          border: "1px solid var(--accent)",
          overflow: "hidden",
          aspectRatio: "3 / 4",
          background: "var(--bg-alt)",
        }}
      >
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 64, background: "var(--bg-alt)",
          }}>
            {recipe.emoji}
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, transparent 45%, rgba(255,255,255,0.6) 100%)",
          pointerEvents: "none",
        }} />

        {/* Text info at bottom */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 12px",
          display: "flex", flexDirection: "column", gap: 3,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 300, color: "var(--accent)",
            lineHeight: 1.3,
          }}>
            {recipe.category}
          </span>
          <span style={{
            fontSize: 13, fontWeight: 600, color: "var(--ink)",
            lineHeight: 1.3,
          }}>
            {recipe.title}
          </span>
          <div style={{
            display: "flex", gap: 16,
            fontSize: 11, fontWeight: 500, color: "var(--accent)",
          }}>
            <span>{recipe.totalTime}</span>
            <span>{recipe.servings}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
