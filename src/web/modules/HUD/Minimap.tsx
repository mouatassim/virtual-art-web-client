import { useEffect, useRef, type MouseEvent } from 'react'
import { useExpoStore, pose } from '../Player/useExpoStore'
import { useExpoContext } from '../Expo/ExpoContext'
import { planPath } from '@core/pathing'
import { focusArtwork } from '../Expo/focus'

const PAD = 0.6

export function Minimap() {
  const show = useExpoStore((s) => s.showMap)
  const entered = useExpoStore((s) => s.entered)
  const selectedId = useExpoStore((s) => s.selectedId)
  const { config, layout } = useExpoContext()
  const W = config.room.width; const D = config.room.depth
  const me = useRef<SVGGElement>(null)
  const svg = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => { me.current?.setAttribute('transform', `translate(${pose.x} ${pose.z}) rotate(${(-pose.yaw * 180) / Math.PI})`); raf = requestAnimationFrame(tick) }
    tick(); return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.code === 'KeyM' && useExpoStore.getState().toggleMap()
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])

  const onClick = (e: MouseEvent<SVGSVGElement>) => {
    const el = svg.current; if (!el) return
    const pt = el.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY
    const p = pt.matrixTransform(el.getScreenCTM()!.inverse())
    const s = useExpoStore.getState()
    if (s.mode === 'tour') s.setMode('explore')
    s.select(null); s.requestGlide(planPath({ x: pose.x, z: pose.z }, { x: p.x, z: p.y }, layout))
  }

  return (
    <div className={`minimap ${show && entered ? '' : 'minimap--hidden'}`} aria-hidden={!show}>
      <svg ref={svg} viewBox={`${-W / 2 - PAD} ${-D / 2 - PAD} ${W + PAD * 2} ${D + PAD * 2}`} onClick={onClick} role="img" aria-label="Floor plan">
        <rect x={-W / 2} y={-D / 2} width={W} height={D} className="mm-room" />
        {layout.obstacles.map((o, i) => <rect key={i} x={o.minX} y={o.minZ} width={o.maxX - o.minX} height={o.maxZ - o.minZ} className={`mm-obs mm-obs--${o.kind}`} />)}
        {layout.paintings.map((p) => {
          const half = p.config.width / 2 + 0.1; const along = Math.abs(p.normal.z) > 0.5
          return (
            <line key={p.config.id} x1={along ? p.position.x - half : p.position.x} x2={along ? p.position.x + half : p.position.x} y1={along ? p.position.z : p.position.z - half} y2={along ? p.position.z : p.position.z + half} className={`mm-art ${selectedId === p.config.id ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); focusArtwork(p.config.id, layout) }}>
              <title>{p.config.title}</title>
            </line>
          )
        })}
        {layout.sculptures.map((s) => (
          <circle key={s.config.id} cx={s.position.x} cy={s.position.z} r={0.45} className={`mm-sculpt ${selectedId === s.config.id ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); focusArtwork(s.config.id, layout) }}>
            <title>{s.config.title}</title>
          </circle>
        ))}
        <g ref={me} className="mm-me">
          <path d="M0 0 L-1.6 -3.2 A3.6 3.6 0 0 1 1.6 -3.2 Z" className="mm-cone" />
          <circle r={0.42} className="mm-dot" />
        </g>
      </svg>
      <span className="minimap__label">Floor plan · click to walk</span>
    </div>
  )
}
