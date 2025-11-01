import { z } from 'zod';

export const DifficultyZ = z.enum(['Easy', 'Medium', 'Hard']);

export const IngredientZ = z.object({
  id: z.string(),
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
});

export const CookSettingsZ = z.object({
  temperature: z.number().int().min(40).max(200),
  speed: z.number().int().min(1).max(5),
});

export const RecipeStepZ = z.discriminatedUnion('type', [
  // cooking step
  z.object({
    id: z.string(),
    description: z.string().min(1),
    type: z.literal('cooking'),
    durationMinutes: z.number().int().positive(),
    cookingSettings: CookSettingsZ,
    // explicitly disallow ingredientIds on cooking
    ingredientIds: z.never().optional(),
  }),
  // instruction step
  z.object({
    id: z.string(),
    description: z.string().min(1),
    type: z.literal('instruction'),
    durationMinutes: z.number().int().positive(),
    ingredientIds: z.array(z.string()).min(1),
    // explicitly disallow cookingSettings on instruction
    cookingSettings: z.never().optional(),
  }),
]);

export const RecipeZ = z.object({
  id: z.string(),
  title: z.string().min(3),
  cuisine: z.string().optional(),
  difficulty: DifficultyZ,
  ingredients: z.array(IngredientZ).min(1),
  steps: z.array(RecipeStepZ).min(1),
  isFavorite: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
