import fs from "fs";
import path from "path";
import type { ShoppingList } from "@/types/shopping";

const KEY = "shopping-list";
const LOCAL_FILE = path.join(process.cwd(), "src", "data", "shopping-list.json");

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

function localGet(): ShoppingList {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf-8")) as ShoppingList;
  } catch {
    return [];
  }
}

function localSet(list: ShoppingList): void {
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(list, null, 2), "utf-8");
}

export async function getShoppingList(): Promise<ShoppingList> {
  if (useRedis()) {
    const redis = await getRedis();
    return (await redis.get<ShoppingList>(KEY)) ?? [];
  }
  return localGet();
}

export async function saveShoppingList(list: ShoppingList): Promise<void> {
  if (useRedis()) {
    const redis = await getRedis();
    await redis.set(KEY, list);
    return;
  }
  localSet(list);
}
