import { NextResponse } from "next/server";
import { getAllRecipes } from "@/lib/recipes";
import JSZip from "jszip";

export async function GET() {
  const recipes = await getAllRecipes();
  const zip = new JSZip();

  zip.file("recettes.json", JSON.stringify(recipes, null, 2));

  const folder = zip.folder("recettes");
  if (folder) {
    for (const recipe of recipes) {
      folder.file(`${recipe.id}.json`, JSON.stringify(recipe, null, 2));
    }
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="mijote-backup-${new Date().toISOString().slice(0, 10)}.zip"`,
    },
  });
}
