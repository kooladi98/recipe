import { Card, CardContent, IconButton, LinearProgress, Typography } from '@mui/material'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../app/store'
import { pause, resume, stopCurrentStep } from '../features/session/sessionSlice'
import { totalDurationSec } from '../features/recipes/selectors'
import { mmss, overallProgressPercent } from '../utils/time'

export default function MiniPlayer({ onClick }: { onClick: () => void }) {
  const dispatch = useDispatch()
  const { activeRecipeId, byRecipeId } = useSelector((s: RootState) => s.session)
  const recipe = useSelector((s: RootState) => s.recipes.items.find(r => r.id === activeRecipeId))
  if (!activeRecipeId || !recipe) return null
  const sess = byRecipeId[activeRecipeId]
  const totalSec = totalDurationSec(recipe)
  const percent = overallProgressPercent(sess.overallRemainingSec, totalSec)

  return (
    <Card
      onClick={onClick}
      sx={{ position: 'fixed', bottom: 12, left: 12, right: 12, cursor: 'pointer' }}
      aria-label={`Mini player ${sess.isRunning ? 'Running' : 'Paused'}`}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {recipe.title} · Step {sess.currentStepIndex + 1} of {recipe.steps.length} · {mmss(sess.stepRemainingSec)}
        </Typography>
        <IconButton
          aria-label={sess.isRunning ? 'Pause' : 'Resume'}
          onClick={e => {
            e.stopPropagation()
            sess.isRunning ? dispatch(pause()) : dispatch(resume())
          }}
        >
          {sess.isRunning ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton
          aria-label="Stop current step"
          onClick={e => {
            e.stopPropagation()
            const last = sess.currentStepIndex === recipe.steps.length - 1
            const nextDur = !last ? recipe.steps[sess.currentStepIndex + 1].durationMinutes * 60 : undefined
            dispatch(stopCurrentStep({ lastStep: last, nextStepDurationSec: nextDur }))
          }}
        >
          <StopIcon />
        </IconButton>
      </CardContent>
      <LinearProgress
        variant="determinate"
        value={percent}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </Card>
  )
}
