import { NextRequest, NextResponse } from "next/server";
import { getAllRecipes, addRecipe } from "@/lib/recipes";
import type { Recipe } from "@/types/recipe";

export async function GET() {
  const recipes = await getAllRecipes();
  return NextResponse.json(recipes);
}

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = (await req.json()) as Recipe;
  await addRecipe(data);
  return NextResponse.json({ ok: true }, { status: 201 });
}
