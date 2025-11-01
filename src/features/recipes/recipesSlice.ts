import { createSlice, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Recipe, Ingredient, RecipeStep } from './types';
import { RecipeZ } from './validators';
import { loadRecipes, saveRecipes } from '../../app/persistor';


export type RecipesState = { items: Recipe[] }

const initialState: RecipesState = {
  items: loadRecipes().filter(r => RecipeZ.safeParse(r).success),
}

const slice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    addRecipe: {
      // we accept recipe WITHOUT id/createdAt/updatedAt, fill them in prepare()
      prepare: (data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => ({
        payload: {
          ...data,
          id: nanoid(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Recipe,
      }),
      reducer: (state, action: PayloadAction<Recipe>) => {
        state.items.push(action.payload)
        saveRecipes(state.items)
      },
    },
    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const i = state.items.findIndex(r => r.id === action.payload.id)
      if (i >= 0) {
        state.items[i] = { ...action.payload, updatedAt: new Date().toISOString() }
        saveRecipes(state.items)
      }
    },
    deleteRecipe: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(r => r.id !== action.payload)
      saveRecipes(state.items)
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const r = state.items.find(r => r.id === action.payload)
      if (r) {
        r.isFavorite = !r.isFavorite
        saveRecipes(state.items)
      }
    },
    reorderStep: (state, action: PayloadAction<{ id: string; stepId: string; dir: 'up' | 'down' }>) => {
      const r = state.items.find(x => x.id === action.payload.id)
      if (!r) return
      const idx = r.steps.findIndex(s => s.id === action.payload.stepId)
      const swapWith = action.payload.dir === 'up' ? idx - 1 : idx + 1
      if (idx < 0 || swapWith < 0 || swapWith >= r.steps.length) return
      ;[r.steps[idx], r.steps[swapWith]] = [r.steps[swapWith], r.steps[idx]]
      r.updatedAt = new Date().toISOString()
      saveRecipes(state.items)
    },
    addIngredient: (state, action: PayloadAction<{ id: string; ingredient: Ingredient }>) => {
      const r = state.items.find(x => x.id === action.payload.id)
      if (!r) return
      r.ingredients.push(action.payload.ingredient)
      saveRecipes(state.items)
    },
    addStep: (state, action: PayloadAction<{ id: string; step: RecipeStep }>) => {
      const r = state.items.find(x => x.id === action.payload.id)
      if (!r) return
      r.steps.push(action.payload.step)
      saveRecipes(state.items)
    },
  },
})

export const {
  addRecipe,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  reorderStep,
  addIngredient,
  addStep,
} = slice.actions

export default slice.reducer
