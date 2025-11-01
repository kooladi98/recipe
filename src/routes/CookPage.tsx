import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import { Box, Button, Chip, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material'
import { startSession, pause, resume, stopCurrentStep } from '../features/session/sessionSlice'
import { totalDurationSec } from '../features/recipes/selectors'
import { mmss, overallProgressPercent, stepProgressPercent } from '../utils/time'

export default function CookPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const recipe = useSelector((s: RootState) => s.recipes.items.find(r => r.id === id))
  const session = useSelector((s: RootState) => (id ? s.session.byRecipeId[id] : undefined))
  if (!recipe) return <Typography>Recipe not found.</Typography>

  const totalSec = totalDurationSec(recipe)
  const currentStep = session ? recipe.steps[session.currentStepIndex] : undefined
  const stepDur = currentStep ? currentStep.durationMinutes * 60 : 0
  const stepPercent = session && currentStep ? stepProgressPercent(session.stepRemainingSec, stepDur) : 0
  const overallPercent = session ? overallProgressPercent(session.overallRemainingSec, totalSec) : 0

  const canStart = !session
  const isRunning = !!session?.isRunning

  const onStart = () => {
    const firstDur = recipe.steps[0].durationMinutes * 60
    dispatch(startSession({ recipeId: recipe.id, stepDurationSec: firstDur, overallRemainingSec: totalSec }))
  }

  const onStop = () => {
    if (!session || !currentStep) return
    const last = session.currentStepIndex === recipe.steps.length - 1
    const nextDur = !last ? recipe.steps[session.currentStepIndex + 1].durationMinutes * 60 : undefined
    dispatch(stopCurrentStep({ lastStep: last, nextStepDurationSec: nextDur }))
  }

  // Auto-advance when step hits 0
  useEffect(() => {
    if (!session || !recipe) return
    if (session.stepRemainingSec > 0) return
    const last = session.currentStepIndex === recipe.steps.length - 1
    const nextDur = !last ? recipe.steps[session.currentStepIndex + 1].durationMinutes * 60 : undefined
    dispatch(stopCurrentStep({ lastStep: last, nextStepDurationSec: nextDur }))
  }, [session?.stepRemainingSec])

  return (
    <Stack gap={3}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>{recipe.title}</Typography>
        <Chip label={recipe.difficulty} />
        <Chip label={`Total: ${Math.round(totalSec/60)} min`} />
      </Stack>

      <Box sx={{ p:2, border:'1px solid #ddd', borderRadius:1 }}>
        <Typography variant="subtitle1">{session ? `Step ${session.currentStepIndex+1} of ${recipe.steps.length}` : 'Ready to start'}</Typography>
        <Stack direction="row" alignItems="center" gap={3}>
          <Box aria-label="Per-step progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stepPercent}>
            <CircularProgress variant="determinate" value={stepPercent} size={72} />
          </Box>
          <Stack>
            <Typography variant="h6">{currentStep?.description || recipe.steps[0].description}</Typography>
            <Typography color="text.secondary">{mmss(session?.stepRemainingSec ?? (recipe.steps[0].durationMinutes*60))}</Typography>
            {currentStep?.type==='cooking' && (
              <Stack direction="row" gap={1}>
                <Chip label={`Temp ${currentStep.cookingSettings!.temperature}°C`} />
                <Chip label={`Speed ${currentStep.cookingSettings!.speed}`} />
              </Stack>
            )}
            {currentStep?.type==='instruction' && (
              <Stack direction="row" gap={1} flexWrap="wrap">
                {currentStep.ingredientIds!.map(id => {
                  const ing = recipe.ingredients.find(i=>i.id===id); return <Chip key={id} label={ing?.name || id} />;
                })}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Box>

      <Stack direction="row" gap={2}>
        {canStart ? (
          <Button variant="contained" onClick={onStart}>Start Session</Button>
        ) : isRunning ? (
          <Button variant="outlined" onClick={()=>dispatch(pause())}>Pause</Button>
        ) : (
          <Button variant="contained" onClick={()=>dispatch(resume())}>Resume</Button>
        )}
        <Button color="error" variant="outlined" onClick={onStop}>STOP (end step)</Button>
      </Stack>

      <Stack>
        <Typography variant="subtitle2">Timeline</Typography>
        <Stack>
          {recipe.steps.map((s, i) => {
            const status = !session ? (i===0?'Current':'Upcoming') : (i < session.currentStepIndex ? 'Completed' : i===session.currentStepIndex ? 'Current' : 'Upcoming')
            return (
              <Stack key={s.id} direction="row" gap={2} sx={{ opacity: status==='Completed'?0.6:1 }}>
                <Chip label={status} size="small" />
                <Typography sx={{ flexGrow: 1 }}>{s.description}</Typography>
                <Chip label={`${s.durationMinutes} min`} size="small" />
              </Stack>
            )
          })}
        </Stack>
      </Stack>

      <Stack gap={1} aria-label="Overall progress">
        <LinearProgress variant="determinate" value={overallPercent} aria-valuenow={overallPercent} aria-valuemin={0} aria-valuemax={100} />
        <Typography>Overall remaining: {mmss(session?.overallRemainingSec ?? totalSec)}</Typography>
        <Typography>{overallPercent}%</Typography>
      </Stack>
    </Stack>
  )
}
