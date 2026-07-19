import { useEffect, useRef } from 'react'
import { useExpoStore } from '../Player/useExpoStore'
import { useExpoContext } from './ExpoContext'
import { focusArtwork } from './focus'

export function TourDirector() {
  const mode = useExpoStore((s) => s.mode)
  const tourIndex = useExpoStore((s) => s.tourIndex)
  const playing = useExpoStore((s) => s.tourPlaying)
  const arrived = useExpoStore((s) => s.arrivedGlide)
  const { config, layout } = useExpoContext()
  const glideId = useRef(-1)
  const atStop = useRef(false)

  useEffect(() => {
    if (mode !== 'tour') return
    atStop.current = false
    useExpoStore.setState({ dwellStart: null })
    focusArtwork(layout.stops[tourIndex].id, layout)
    glideId.current = useExpoStore.getState().glide?.id ?? -1
  }, [mode, tourIndex, layout])

  useEffect(() => {
    if (mode !== 'tour') return
    if (arrived === glideId.current) atStop.current = true
    if (!atStop.current || !playing) { useExpoStore.setState({ dwellStart: null }); return }
    useExpoStore.setState({ dwellStart: performance.now() })
    const t = window.setTimeout(() => {
      const next = (useExpoStore.getState().tourIndex + 1) % layout.stops.length
      useExpoStore.getState().setTour(next)
    }, config.tourDwell * 1000)
    return () => window.clearTimeout(t)
  }, [mode, playing, arrived, config.tourDwell, layout])

  return null
}
