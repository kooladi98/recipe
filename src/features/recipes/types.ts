export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Ingredient = {
  id: string;
  name: string;
  quantity: number; // > 0
  unit: string; // 'g', 'ml', 'pcs', etc.
};

export type CookSettings = {
  temperature: number; // 40–200
  speed: number; // 1–5
};

export type RecipeStep = {
  id: string;
  description: string;
  type: 'cooking' | 'instruction';
  durationMinutes: number; // integer > 0 (both types)
  cookingSettings?: CookSettings; // REQUIRED if type='cooking'; disallowed if 'instruction'
  ingredientIds?: string[]; // REQUIRED if type='instruction'; disallowed if 'cooking'
};

export type Recipe = {
  id: string;
  title: string;
  cuisine?: string;
  difficulty: Difficulty;
  ingredients: Ingredient[]; // steps reference by ingredientIds
  steps: RecipeStep[];       // linear, ordered sequence for cooking
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
};

export const baseDifficulty: Record<Difficulty, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};
