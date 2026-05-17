import { NextRequest, NextResponse } from "next/server";
import { getAllRecipes } from "@/lib/recipes";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim() ?? "";

  if (q.length < 2) return NextResponse.json([]);

  const all = await getAllRecipes();

  const results = all
    .filter((r) =>
      r.title.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.tags?.some((t) => t.toLowerCase().includes(q)) ||
      r.ingredients?.some((i) => i.item.toLowerCase().includes(q))
    )
    .slice(0, 6)
    .map((r) => ({ id: r.id, title: r.title, image: r.image ?? null, emoji: r.emoji }));

  return NextResponse.json(results);
}
