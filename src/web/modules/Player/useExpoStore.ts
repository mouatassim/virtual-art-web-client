import { create } from 'zustand'
import type { Viewpoint } from '@core/layout'

export type Mode = 'explore' | 'tour'
export type Quality = 'high' | 'low'

export interface GlideRequest {
  id: number
  path: { x: number; z: number }[]
  final?: { yaw: number; pitch: number }
  instant?: boolean
}

interface State {
  entered: boolean
  mode: Mode
  quality: Quality
  selectedId: string | null
  hoveredId: string | null
  tourIndex: number
  tourPlaying: boolean
  showMap: boolean
  glide: GlideRequest | null
  arrivedGlide: number
  dwellStart: number | null
  joystick: { x: number; y: number }

  enter: () => void
  setMode: (m: Mode) => void
  setQuality: (q: Quality) => void
  select: (id: string | null) => void
  hover: (id: string | null) => void
  setTour: (i: number, playing?: boolean) => void
  toggleTourPlaying: () => void
  toggleMap: () => void
  requestGlide: (path: GlideRequest['path'], final?: GlideRequest['final'], instant?: boolean) => void
  setJoystick: (x: number, y: number) => void
}

let glideId = 0

const qParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('quality') : null
const isTouch = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches
const initialQuality: Quality = qParam === 'low' || qParam === 'high' ? qParam : isTouch ? 'low' : 'high'

export const useExpoStore = create<State>((set) => ({
  entered: false,
  mode: 'explore',
  quality: initialQuality,
  selectedId: null,
  hoveredId: null,
  tourIndex: 0,
  tourPlaying: false,
  showMap: !isTouch,
  glide: null,
  arrivedGlide: 0,
  dwellStart: null,
  joystick: { x: 0, y: 0 },

  enter: () => set({ entered: true }),
  setMode: (mode) => set(mode === 'tour' ? { mode, tourPlaying: true } : { mode, tourPlaying: false }),
  setQuality: (quality) => set({ quality }),
  select: (selectedId) => {
    if (!selectedId && typeof location !== 'undefined' && location.hash) {
      try { history.replaceState(null, '', location.pathname + location.search) } catch { /* sandboxed */ }
    }
    set({ selectedId })
  },
  hover: (hoveredId) => set({ hoveredId }),
  setTour: (tourIndex, playing) => set((s) => ({ tourIndex, tourPlaying: playing ?? s.tourPlaying })),
  toggleTourPlaying: () => set((s) => ({ tourPlaying: !s.tourPlaying })),
  toggleMap: () => set((s) => ({ showMap: !s.showMap })),
  requestGlide: (path, final, instant) => set({ glide: { id: ++glideId, path, final, instant } }),
  setJoystick: (x, y) => set({ joystick: { x, y } }),
}))

/** Camera pose written every frame by Player — kept outside React state to avoid 60fps re-renders. */
export const pose = { x: 0, z: 0, yaw: 0, moving: false }

export const isTouchDevice = isTouch

export type { Viewpoint }
