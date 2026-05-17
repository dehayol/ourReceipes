import { NextRequest, NextResponse } from "next/server";
import { getShoppingList, saveShoppingList } from "@/lib/shoppingList";
import { getRecipeById } from "@/lib/recipes";
import { scaleQuantity, parseServings } from "@/utils/scaleQuantity";

// GET — return the full list
export async function GET() {
  const list = await getShoppingList();
  return NextResponse.json(list);
}

// POST — add a recipe to the list
export async function POST(req: NextRequest) {
  const { recipeId, requestedServings } = await req.json() as {
    recipeId: string;
    requestedServings: number;
  };

  const recipe = await getRecipeById(recipeId);
  if (!recipe) return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });

  const baseServings = parseServings(recipe.servings);
  const multiplier = requestedServings / baseServings;

  const list = await getShoppingList();

  // Replace if already present
  const filtered = list.filter((e) => e.recipeId !== recipeId);

  filtered.unshift({
    recipeId,
    recipeTitle: recipe.title,
    recipeEmoji: recipe.emoji,
    requestedServings,
    baseServings,
    addedAt: new Date().toISOString(),
    ingredients: recipe.ingredients.map((ing) => ({
      quantity: scaleQuantity(ing.quantity, multiplier),
      item: ing.item,
      checked: false,
    })),
  });

  await saveShoppingList(filtered);
  return NextResponse.json({ ok: true, count: filtered.length });
}

// PATCH — toggle an ingredient's checked state
export async function PATCH(req: NextRequest) {
  const { recipeId, index, checked } = await req.json() as {
    recipeId: string;
    index: number;
    checked: boolean;
  };

  const list = await getShoppingList();
  const entry = list.find((e) => e.recipeId === recipeId);
  if (!entry || !entry.ingredients[index]) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  entry.ingredients[index].checked = checked;
  await saveShoppingList(list);
  return NextResponse.json({ ok: true });
}

// DELETE — remove a recipe (?recipeId=xxx) or clear all (?clear=true)
export async function DELETE(req: NextRequest) {
  const recipeId = req.nextUrl.searchParams.get("recipeId");
  const clear = req.nextUrl.searchParams.get("clear");

  if (clear === "true") {
    await saveShoppingList([]);
    return NextResponse.json({ ok: true });
  }

  if (recipeId) {
    const list = await getShoppingList();
    await saveShoppingList(list.filter((e) => e.recipeId !== recipeId));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });
}
