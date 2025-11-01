// src/app/persistor.ts
import type { Recipe } from '../features/recipes/types';

const KEY = 'recipes:v1';

export const loadRecipes = (): Recipe[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Recipe[]) : [];
  } catch {
    return [];
  }
};

export const saveRecipes = (recipes: Recipe[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(recipes));
  } catch {
    // ignore quota errors
  }
};
