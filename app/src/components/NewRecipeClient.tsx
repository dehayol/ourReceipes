"use client";

import { useEffect, useState } from "react";
import RecipeForm from "@/components/RecipeForm";
import type { Recipe } from "@/types/recipe";

const IMPORT_KEY = "mijote_import_recipe";

interface Props {
  isImport: boolean;
}

export default function NewRecipeClient({ isImport }: Props) {
  const [importedRecipe, setImportedRecipe] = useState<Partial<Recipe> | null>(null);
  const [ready, setReady] = useState(!isImport);

  useEffect(() => {
    if (!isImport) return;

    const raw = sessionStorage.getItem(IMPORT_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw) as Partial<Recipe>;
        setImportedRecipe(data);
        // Nettoyer après lecture
        sessionStorage.removeItem(IMPORT_KEY);
      } catch {
        // Rien à faire, formulaire vide
      }
    }
    setReady(true);
  }, [isImport]);

  if (!ready) return null;

  // Fusionner les données importées avec les valeurs par défaut
  const initialRecipe: Recipe | undefined = importedRecipe
    ? {
        id: "",
        title: importedRecipe.title ?? "",
        category: importedRecipe.category ?? "Plats",
        emoji: importedRecipe.emoji ?? "🍽️",
        description: importedRecipe.description ?? "",
        prepTime: importedRecipe.prepTime ?? "",
        cookTime: importedRecipe.cookTime ?? "",
        totalTime: importedRecipe.totalTime ?? "",
        servings: importedRecipe.servings ?? "",
        difficulty: importedRecipe.difficulty ?? "Facile",
        image: importedRecipe.image ?? null,
        tags: importedRecipe.tags ?? [],
        ingredients: importedRecipe.ingredients ?? [{ quantity: "", item: "" }],
        steps: importedRecipe.steps ?? [""],
        notes: importedRecipe.notes ?? "",
        createdAt: new Date().toISOString().split("T")[0],
      }
    : undefined;

  return <RecipeForm mode="create" recipe={initialRecipe} />;
}
