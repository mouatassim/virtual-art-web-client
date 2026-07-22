import { useEffect, useState } from 'react'
import { pose, useExpoStore } from '../Player/useExpoStore'
import { useExpoContext } from '../Expo/ExpoContext'
import * as Icons from '@ui/Icons'

export function Hud() {
  const mode = useExpoStore((s) => s.mode)
  const quality = useExpoStore((s) => s.quality)
  const showMap = useExpoStore((s) => s.showMap)
  const { config } = useExpoContext()
  const [fs, setFs] = useState(false)

  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])

  const toggleFs = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => undefined) }

  return (
    <header className="hud">
      <div className="hud__title">
        <span className="hud__name">{config.title}</span>
        <span className="hud__artist">{config.artist.name}</span>
      </div>
      <nav className="hud__actions" aria-label="Expo controls">
        <div className="seg" role="tablist" aria-label="Navigation mode">
          <button role="tab" aria-selected={mode === 'explore'} className={mode === 'explore' ? 'on' : ''} onClick={() => useExpoStore.getState().setMode('explore')}>Explore</button>
          <button role="tab" aria-selected={mode === 'tour'} className={mode === 'tour' ? 'on' : ''} onClick={() => useExpoStore.getState().setMode('tour')}>Guided tour</button>
        </div>
        <button className={`icon-btn ${showMap ? 'on' : ''}`} onClick={() => useExpoStore.getState().toggleMap()} aria-label="Toggle floor plan" title="Floor plan (M)"><Icons.Map size={18} /></button>
        <button className="icon-btn icon-btn--text" onClick={() => useExpoStore.getState().setQuality(quality === 'high' ? 'low' : 'high')} aria-label={`Rendering quality: ${quality}`} title="Rendering quality">{quality === 'high' ? 'HD' : 'SD'}</button>
        <button className="icon-btn" onClick={toggleFs} aria-label={fs ? 'Exit full screen' : 'Full screen'} title="Full screen"><Icons.Compass size={18} /></button>
      </nav>
    </header>
  )
}

export function Hint() {
  const entered = useExpoStore((s) => s.entered)
  const mode = useExpoStore((s) => s.mode)
  const selected = useExpoStore((s) => !!s.selectedId)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!entered || gone) return
    const start = { x: pose.x, z: pose.z, yaw: pose.yaw }
    const id = window.setInterval(() => { if (Math.hypot(pose.x - start.x, pose.z - start.z) > 1.2 || Math.abs(pose.yaw - start.yaw) > 0.8) setGone(true) }, 300)
    const t = window.setTimeout(() => setGone(true), 14000)
    return () => { window.clearInterval(id); window.clearTimeout(t) }
  }, [entered, gone])

  if (!entered || mode === 'tour') return null
  return (
    <div className={`hint ${gone || selected ? 'hint--gone' : ''}`}>
      Drag to look around · click the floor to walk · click a work to view it
    </div>
  )
}
