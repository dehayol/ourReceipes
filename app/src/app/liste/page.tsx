import Header from "@/components/Header";
import ShoppingListView from "@/components/ShoppingListView";
import { getShoppingList } from "@/lib/shoppingList";

export const dynamic = "force-dynamic";

export default async function ListePage() {
  const list = await getShoppingList();

  return (
    <>
      <Header />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}>
        <ShoppingListView initialList={list} />
      </main>
    </>
  );
}
