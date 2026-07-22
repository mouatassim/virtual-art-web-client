import { useEffect, useRef } from 'react'
import { isTouchDevice, useExpoStore } from '../Player/useExpoStore'
import { useExpoContext } from '../Expo/ExpoContext'

export function HoverLabel() {
  const hoveredId = useExpoStore((s) => s.hoveredId)
  const selectedId = useExpoStore((s) => s.selectedId)
  const { config } = useExpoContext()
  const titles = new Map(config.artworks.map((a) => [a.id, a.title]))
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const m = (e: PointerEvent) => { if (el.current) el.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)` }
    window.addEventListener('pointermove', m)
    return () => window.removeEventListener('pointermove', m)
  }, [])

  useEffect(() => { document.body.classList.toggle('hovering-art', !!hoveredId) }, [hoveredId])

  const show = !isTouchDevice && hoveredId && hoveredId !== selectedId
  return (
    <div ref={el} className={`hover-label ${show ? 'on' : ''}`} aria-hidden>
      <span className="eyebrow">View</span> {hoveredId ? titles.get(hoveredId) : ''}
    </div>
  )
}
