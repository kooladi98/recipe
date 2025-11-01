import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import { addRecipe, updateRecipe } from '../features/recipes/recipesSlice'
import type { Ingredient, RecipeStep, Recipe } from '../features/recipes/types'
import { Box, Button, Chip, MenuItem, Select, Snackbar, Stack, TextField, Typography } from '@mui/material'
import { nanoid } from '@reduxjs/toolkit'
import { RecipeZ } from '../features/recipes/validators'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function CreatePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const recipes = useSelector((s: RootState) => s.recipes.items)
  const [params] = useSearchParams()
  const editId = params.get('id')

  const existing = useMemo(
    () => (editId ? recipes.find(r => r.id === editId) : undefined),
    [editId, recipes]
  )

  // local state
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<'Easy'|'Medium'|'Hard'>('Easy')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [steps, setSteps] = useState<RecipeStep[]>([])
  const [snack, setSnack] = useState<string | null>(null)

  // prefill for edit mode
  useEffect(() => {
    if (!existing) return
    setTitle(existing.title)
    setDifficulty(existing.difficulty)
    setIngredients(existing.ingredients)
    setSteps(existing.steps)
  }, [existing])

  const addIng = () => setIngredients(prev => [...prev, { id: nanoid(), name: '', quantity: 1, unit: 'g' }])
  const addStepUI = () => setSteps(prev => [...prev, { id: nanoid(), description: '', type: 'instruction', durationMinutes: 1, ingredientIds: [] } as RecipeStep])

  const move = (idx: number, dir: 'up'|'down') => {
    const to = dir === 'up' ? idx - 1 : idx + 1
    if (to < 0 || to >= steps.length) return
    const copy = [...steps]; [copy[idx], copy[to]] = [copy[to], copy[idx]]; setSteps(copy)
  }

  const save = () => {
    const now = new Date().toISOString()
    if (editId && existing) {
      // EDIT mode
      const full: Recipe = {
        ...existing,
        title,
        difficulty,
        ingredients,
        steps,
        updatedAt: now,
      }
      const parsed = RecipeZ.safeParse(full)
      if (!parsed.success) { setSnack('Validation failed. Check fields.'); return; }
      dispatch(updateRecipe(full))
      setSnack('Saved changes!')
      navigate('/recipes')
      return
    }

    // CREATE mode
    const fullCreate: Recipe = {
      id: nanoid(),
      title,
      difficulty,
      ingredients,
      steps,
      createdAt: now,
      updatedAt: now,
    }
    const parsed = RecipeZ.safeParse(fullCreate)
    if (!parsed.success) { setSnack('Validation failed. Check fields.'); return; }
    // our slice’s addRecipe has a prepare(), but sending the full object is fine too
    dispatch(addRecipe({ title, difficulty, ingredients, steps } as any))
    setSnack('Saved!')
    navigate('/recipes')
  }

  return (
    <Stack gap={3}>
      <Typography variant="h5">{editId ? 'Edit Recipe' : 'Create Recipe'}</Typography>

      <Stack direction="row" gap={2}>
        <TextField label="Title" value={title} onChange={e=>setTitle(e.target.value)} inputProps={{ minLength: 3 }} fullWidth />
        <Select value={difficulty} onChange={e=>setDifficulty(e.target.value as any)}>
          <MenuItem value="Easy">Easy</MenuItem>
          <MenuItem value="Medium">Medium</MenuItem>
          <MenuItem value="Hard">Hard</MenuItem>
        </Select>
      </Stack>

      <Stack gap={1}>
        <Typography variant="h6">Ingredients</Typography>
        {ingredients.map((ing, i) => (
          <Stack key={ing.id} direction="row" gap={1}>
            <TextField label="Name" value={ing.name} onChange={e=>{
              const v=[...ingredients]; v[i]={...ing,name:e.target.value}; setIngredients(v);
            }}/>
            <TextField type="number" label="Qty" value={ing.quantity} onChange={e=>{
              const v=[...ingredients]; v[i]={...ing,quantity:Number(e.target.value)}; setIngredients(v);
            }}/>
            <TextField label="Unit" value={ing.unit} onChange={e=>{
              const v=[...ingredients]; v[i]={...ing,unit:e.target.value}; setIngredients(v);
            }}/>
            <Button onClick={()=>setIngredients(ingredients.filter((_,idx)=>idx!==i))}>Remove</Button>
          </Stack>
        ))}
        <Button variant="outlined" onClick={addIng}>Add Ingredient</Button>
      </Stack>

      <Stack gap={1}>
        <Typography variant="h6">Steps (linear order)</Typography>
        {steps.map((st, i) => (
          <Box key={st.id} sx={{ p:2, border:'1px solid #ddd', borderRadius:1 }}>
            <Stack gap={1}>
              <Stack direction="row" gap={1}>
                <TextField label="Description" value={st.description} onChange={e=>{
                  const v=[...steps]; v[i]={...st,description:e.target.value}; setSteps(v);
                }} fullWidth/>
                <Select value={st.type} onChange={e=>{
                  const t=e.target.value as 'cooking'|'instruction';
                  const base={ id: st.id, description: st.description, durationMinutes: st.durationMinutes } as any;
                  const next = t==='cooking'
                    ? { ...base, type:'cooking', cookingSettings:{ temperature: 40, speed: 1 } }
                    : { ...base, type:'instruction', ingredientIds: [] };
                  const v=[...steps]; v[i]=next; setSteps(v);
                }}>
                  <MenuItem value="instruction">Instruction</MenuItem>
                  <MenuItem value="cooking">Cooking</MenuItem>
                </Select>
                <TextField type="number" label="Duration (min)" value={st.durationMinutes} onChange={e=>{
                  const v=[...steps]; v[i]={...st,durationMinutes:Math.max(1, parseInt(e.target.value||'1'))}; setSteps(v);
                }}/>
              </Stack>

              {st.type==='cooking' && (
                <Stack direction="row" gap={1}>
                  <TextField type="number" label="Temp (40-200)" value={st.cookingSettings?.temperature ?? 40} onChange={e=>{
                    const v=[...steps]; v[i]={...st, cookingSettings:{ ...(st.cookingSettings||{temperature:40,speed:1}), temperature: Math.min(200, Math.max(40, parseInt(e.target.value||'40'))) }}; setSteps(v);
                  }}/>
                  <TextField type="number" label="Speed (1-5)" value={st.cookingSettings?.speed ?? 1} onChange={e=>{
                    const v=[...steps]; v[i]={...st, cookingSettings:{ ...(st.cookingSettings||{temperature:40,speed:1}), speed: Math.min(5, Math.max(1, parseInt(e.target.value||'1'))) }}; setSteps(v);
                  }}/>
                </Stack>
              )}

              {st.type==='instruction' && (
                <Stack direction="row" gap={1} flexWrap="wrap">
                  {ingredients.map(ing => (
                    <Chip key={ing.id} label={ing.name || '(ingredient)'} color={st.ingredientIds?.includes(ing.id) ? 'primary':'default'} onClick={()=>{
                      const ids = new Set(st.ingredientIds || [])
                      ids.has(ing.id) ? ids.delete(ing.id) : ids.add(ing.id)
                      const v=[...steps]; v[i]={...st, ingredientIds:[...ids]}; setSteps(v);
                    }} />
                  ))}
                </Stack>
              )}

              <Stack direction="row" gap={1}>
                <Button onClick={()=>move(i,'up')}>Up</Button>
                <Button onClick={()=>move(i,'down')}>Down</Button>
                <Button color="error" onClick={()=>setSteps(steps.filter((_,idx)=>idx!==i))}>Remove</Button>
              </Stack>
            </Stack>
          </Box>
        ))}
        <Button variant="outlined" onClick={addStepUI}>Add Step</Button>
      </Stack>

      <Stack direction="row" gap={1}>
        <Button variant="contained" onClick={save}>{editId ? 'Save Changes' : 'Save Recipe'}</Button>
        <Button onClick={()=>navigate('/recipes')}>Cancel</Button>
      </Stack>

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={()=>setSnack(null)} message={snack||''} />
    </Stack>
  )
}
