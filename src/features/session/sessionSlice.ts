import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';


export type SessionPerRecipe = {
  currentStepIndex: number
  isRunning: boolean
  stepRemainingSec: number
  overallRemainingSec: number
  lastTickTs?: number
}

export type SessionState = {
  activeRecipeId: string | null
  byRecipeId: Record<string, SessionPerRecipe>
}

const initialState: SessionState = { activeRecipeId: null, byRecipeId: {} }

const slice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (
      state,
      action: PayloadAction<{ recipeId: string; stepDurationSec: number; overallRemainingSec: number }>
    ) => {
      if (state.activeRecipeId && state.activeRecipeId !== action.payload.recipeId) {
        // disallow starting a second, per spec; no-op
        return
      }
      const id = action.payload.recipeId
      state.activeRecipeId = id
      state.byRecipeId[id] = {
        currentStepIndex: 0,
        isRunning: true,
        stepRemainingSec: action.payload.stepDurationSec,
        overallRemainingSec: action.payload.overallRemainingSec,
        lastTickTs: Date.now(),
      }
    },
    pause: state => {
      const id = state.activeRecipeId
      if (!id) return
      const s = state.byRecipeId[id]
      if (!s) return
      s.isRunning = false
      s.lastTickTs = undefined
    },
    resume: state => {
      const id = state.activeRecipeId
      if (!id) return
      const s = state.byRecipeId[id]
      if (!s) return
      s.isRunning = true
      s.lastTickTs = Date.now()
    },
    stopCurrentStep: (
      state,
      action: PayloadAction<{ lastStep: boolean; nextStepDurationSec?: number }>
    ) => {
      const id = state.activeRecipeId
      if (!id) return
      const s = state.byRecipeId[id]
      if (!s) return

      if (action.payload.lastStep) {
        delete state.byRecipeId[id]
        state.activeRecipeId = null
        return
      }

      s.currentStepIndex += 1
      s.stepRemainingSec = action.payload.nextStepDurationSec ?? 0
      s.isRunning = true
      s.lastTickTs = Date.now()
    },
    tickSecond: state => {
      const id = state.activeRecipeId
      if (!id) return
      const s = state.byRecipeId[id]
      if (!s || !s.isRunning) return
      const now = Date.now()
      const delta = s.lastTickTs ? Math.floor((now - s.lastTickTs) / 1000) : 1
      if (delta <= 0) {
        s.lastTickTs = now
        return
      }
      s.lastTickTs = now
      s.stepRemainingSec = Math.max(0, s.stepRemainingSec - delta)
      s.overallRemainingSec = Math.max(0, s.overallRemainingSec - delta)
    },
    endSession: state => {
      const id = state.activeRecipeId
      if (!id) return
      delete state.byRecipeId[id]
      state.activeRecipeId = null
    },
  },
})

export const { startSession, pause, resume, stopCurrentStep, tickSecond, endSession } = slice.actions
export default slice.reducer

// Selectors (optional helpers)
export const selectSession = (s: RootState) => s.session
export const selectActive = (s: RootState) => {
  const id = s.session.activeRecipeId
  if (!id) return null
  return s.session.byRecipeId[id] ?? null
}
