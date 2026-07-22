import { useEffect, useRef } from 'react'
import { useExpoStore } from '../Player/useExpoStore'
import { useExpoContext } from '../Expo/ExpoContext'
import * as Icons from '@ui/Icons'

export function TourBar() {
  const mode = useExpoStore((s) => s.mode)
  const index = useExpoStore((s) => s.tourIndex)
  const playing = useExpoStore((s) => s.tourPlaying)
  const dwellStart = useExpoStore((s) => s.dwellStart)
  const { config, layout } = useExpoContext()
  const bar = useRef<HTMLDivElement>(null)
  const n = layout.stops.length
  const go = (d: number) => useExpoStore.getState().setTour((index + d + n) % n)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = bar.current
      if (el) { const p = dwellStart ? Math.min(1, (performance.now() - dwellStart) / (config.tourDwell * 1000)) : 0; el.style.transform = `scaleX(${p})` }
      raf = requestAnimationFrame(tick)
    }
    tick(); return () => cancelAnimationFrame(raf)
  }, [dwellStart, config.tourDwell])

  if (mode !== 'tour') return null
  const stop = config.artworks.find((a) => a.id === layout.stops[index]?.id)

  return (
    <div className="tourbar" role="region" aria-label="Guided tour">
      <div className="tourbar__row">
        <button className="icon-btn icon-btn--bare" onClick={() => go(-1)} aria-label="Previous stop"><Icons.ChevronLeft size={18} /></button>
        <button className="icon-btn icon-btn--round" onClick={() => useExpoStore.getState().toggleTourPlaying()} aria-label={playing ? 'Pause tour' : 'Resume tour'}>
          {playing ? <Icons.Pause size={18} /> : <Icons.Play size={18} />}
        </button>
        <button className="icon-btn icon-btn--bare" onClick={() => go(1)} aria-label="Next stop"><Icons.ChevronRight size={18} /></button>
        <div className="tourbar__label">
          <span className="eyebrow">Stop {index + 1} of {n}</span>
          <span className="tourbar__title">{stop?.title}</span>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={() => useExpoStore.getState().setMode('explore')}>Exit tour</button>
      </div>
      <div className="tourbar__dots">
        {layout.stops.map((s, i) => <button key={s.id} className={i === index ? 'on' : i < index ? 'done' : ''} onClick={() => useExpoStore.getState().setTour(i)} aria-label={`Go to stop ${i + 1}`} />)}
      </div>
      <div className="tourbar__progress"><div ref={bar} /></div>
    </div>
  )
}
