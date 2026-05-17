export interface ShoppingIngredient {
  quantity: string; // already scaled
  item: string;
  checked: boolean;
}

export interface ShoppingEntry {
  recipeId: string;
  recipeTitle: string;
  recipeEmoji: string;
  requestedServings: number;
  baseServings: number;
  addedAt: string;
  ingredients: ShoppingIngredient[];
}

export type ShoppingList = ShoppingEntry[];
