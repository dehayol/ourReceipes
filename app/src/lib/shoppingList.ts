import type { ShoppingList } from "@/types/shopping";

const KEY = "shopping-list";

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function getShoppingList(): Promise<ShoppingList> {
  const redis = await getRedis();
  return (await redis.get<ShoppingList>(KEY)) ?? [];
}

export async function saveShoppingList(list: ShoppingList): Promise<void> {
  const redis = await getRedis();
  await redis.set(KEY, list);
}
