export interface Ingredient {
  quantity: string;
  item: string;
}

export interface Recipe {
  id: string;
  title: string;
  category: string;
  emoji: string;
  description: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  difficulty: string;
  image: string | null;
  tags: string[];
  ingredients: Ingredient[];
  steps: string[];
  notes?: string;
  createdAt: string;
}
