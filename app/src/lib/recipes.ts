import fs from "fs";
import path from "path";
import type { Recipe } from "@/types/recipe";

const DATA_FILE = path.join(process.cwd(), "src", "data", "recipes.json");
const RECIPES_KEY = "recipes";

function useRedis() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

async function redisGet(): Promise<Recipe[]> {
  const redis = await getRedis();
  const recipes = await redis.get<Recipe[]>(RECIPES_KEY);
  if (!recipes) {
    const seed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Recipe[];
    await redis.set(RECIPES_KEY, seed);
    return seed;
  }
  return recipes;
}

async function redisSet(recipes: Recipe[]): Promise<void> {
  const redis = await getRedis();
  await redis.set(RECIPES_KEY, recipes);
}

export async function getAllRecipes(): Promise<Recipe[]> {
  if (useRedis()) return redisGet();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Recipe[];
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  return (await getAllRecipes()).find((r) => r.id === id);
}

export async function saveAllRecipes(recipes: Recipe[]): Promise<void> {
  if (useRedis()) return redisSet(recipes);
  fs.writeFileSync(DATA_FILE, JSON.stringify(recipes, null, 2), "utf-8");
}

export async function addRecipe(recipe: Recipe): Promise<void> {
  const recipes = await getAllRecipes();
  recipes.unshift(recipe);
  await saveAllRecipes(recipes);
}

export async function updateRecipe(id: string, data: Recipe): Promise<void> {
  const recipes = await getAllRecipes();
  const idx = recipes.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Recipe not found");
  recipes[idx] = data;
  await saveAllRecipes(recipes);
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = (await getAllRecipes()).filter((r) => r.id !== id);
  await saveAllRecipes(recipes);
}

export function getCategories(): string[] {
  return ["Apéro", "Entrées", "Plats", "Desserts", "Boulange", "Bases"];
}

export const CATEGORY_EMOJIS: Record<string, string> = {
  Apéro: "🍷",
  Entrées: "🥗",
  Plats: "🍝",
  Desserts: "🍰",
  Boulange: "🥖",
  Bases: "🥄",
};