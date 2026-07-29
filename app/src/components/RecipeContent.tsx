"use client";

import { useState } from "react";
import { Ingredient } from "@/types/recipe";
import RecipeSteps from "./RecipeSteps";

interface Props {
  ingredients: Ingredient[];
  steps: string[];
  notes?: string;
}

export default function RecipeContent({ ingredients, steps, notes }: Props) {
  const [view, setView] = useState<"list" | "table">("list");

  return (
    <div className={`recipe-content-grid anim-fade-up anim-delay-3 ${view === "table" ? "table-mode" : ""}`}>
      {/* Ingrédients : masqués en vue tableau, déjà listés dans la première colonne du tableau */}
      {view === "list" && (
        <div>
          <h2 style={{
            fontSize: 18, fontWeight: 700,
            marginBottom: 16, paddingBottom: 12,
            borderBottom: "1px solid var(--line)",
          }}>
            Ingrédients
          </h2>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {ingredients.map((ing, i) => (
              <li
                key={i}
                className={`ingredient-row anim-delay-${Math.min(i + 3, 9)}`}
                style={{
                  display: "flex", gap: 12, fontSize: 14,
                  paddingBottom: 10, borderBottom: "1px solid var(--line)",
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--accent)", minWidth: 56, flexShrink: 0 }}>
                  {ing.quantity}
                </span>
                <span style={{ color: "var(--ink-soft)" }}>{ing.item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RecipeSteps
        ingredients={ingredients}
        steps={steps}
        notes={notes}
        view={view}
        onViewChange={setView}
      />

      <style>{`
        .recipe-content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
        }
        @media (min-width: 640px) {
          .recipe-content-grid {
            grid-template-columns: 1fr 2fr;
            gap: 48px;
          }
          .recipe-content-grid.table-mode {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
