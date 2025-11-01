import { type Recipe } from './types';

export const totalTimeMinutes = (r: Recipe) =>
  r.steps.reduce((acc, s) => acc + s.durationMinutes, 0);

export const totalIngredients = (r: Recipe) => r.ingredients.length;

export const complexityScore = (r: Recipe) => {
  const base = { Easy: 1, Medium: 2, Hard: 3 } as const;
  return base[r.difficulty] * r.steps.length;
};

export const totalDurationSec = (r: Recipe) => totalTimeMinutes(r) * 60;
