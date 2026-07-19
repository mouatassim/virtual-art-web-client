import { useExpoStore, pose } from '../Player/useExpoStore'
import { planPath } from '@core/pathing'
import type { Layout } from '@core/layout'

export function focusArtwork(id: string, layout: Layout, instant = false) {
  const stop = layout.stops.find((s) => s.id === id)
  if (!stop) return
  const s = useExpoStore.getState()
  s.select(id)
  const index = layout.stops.indexOf(stop)
  if (s.mode === 'tour') s.setTour(index)
  else useExpoStore.setState({ tourIndex: index })
  const path = instant
    ? [{ x: stop.view.x, z: stop.view.z }]
    : planPath({ x: pose.x, z: pose.z }, { x: stop.view.x, z: stop.view.z }, layout)
  s.requestGlide(path, { yaw: stop.view.yaw, pitch: stop.view.pitch }, instant)
  try { history.replaceState(null, '', `#${id}`) } catch { /* sandboxed */ }
}

export function stepArtwork(dir: 1 | -1, layout: Layout) {
  const { selectedId, tourIndex } = useExpoStore.getState()
  const n = layout.stops.length
  const cur = selectedId ? layout.stops.findIndex((s) => s.id === selectedId) : tourIndex
  const next = ((cur < 0 ? 0 : cur) + dir + n) % n
  focusArtwork(layout.stops[next].id, layout)
}

export function applyDeepLink(layout: Layout) {
  const id = decodeURIComponent(location.hash.slice(1))
  if (id && layout.stops.some((s) => s.id === id)) {
    useExpoStore.getState().enter()
    focusArtwork(id, layout, true)
    return true
  }
  return false
}
