import { NextRequest, NextResponse } from "next/server";
import { saveAllRecipes } from "@/lib/recipes";
import JSZip from "jszip";
import type { Recipe } from "@/types/recipe";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password") ?? "";
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const zip = await JSZip.loadAsync(buffer);

  const jsonFile = zip.file("recettes.json");
  if (!jsonFile) {
    return NextResponse.json(
      { error: "Le ZIP ne contient pas de fichier recettes.json" },
      { status: 400 }
    );
  }

  const content = await jsonFile.async("string");
  let recipes: Recipe[];
  try {
    recipes = JSON.parse(content) as Recipe[];
    if (!Array.isArray(recipes)) throw new Error("Format invalide");
  } catch {
    return NextResponse.json({ error: "Le fichier recettes.json est invalide" }, { status: 400 });
  }

  await saveAllRecipes(recipes);

  return NextResponse.json({ count: recipes.length });
}
