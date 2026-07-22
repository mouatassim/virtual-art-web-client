import { useRef, useState, type PointerEvent } from 'react'
import { isTouchDevice, useExpoStore } from '../Player/useExpoStore'

const R = 46

export function Joystick() {
  const entered = useExpoStore((s) => s.entered)
  const panelOpen = useExpoStore((s) => !!s.selectedId)
  const base = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const active = useRef<number | null>(null)

  if (!isTouchDevice || !entered || panelOpen) return null

  const update = (e: PointerEvent) => {
    const rect = base.current!.getBoundingClientRect()
    let x = e.clientX - (rect.left + rect.width / 2)
    let y = e.clientY - (rect.top + rect.height / 2)
    const d = Math.hypot(x, y)
    if (d > R) { x = (x / d) * R; y = (y / d) * R }
    setKnob({ x, y })
    const nx = x / R; const ny = -y / R; const mag = Math.hypot(nx, ny)
    const k = mag < 0.12 ? 0 : Math.pow((mag - 0.12) / 0.88, 1.4) / (mag || 1)
    useExpoStore.getState().setJoystick(nx * k, ny * k)
  }
  const end = () => { active.current = null; setKnob({ x: 0, y: 0 }); useExpoStore.getState().setJoystick(0, 0) }

  return (
    <div ref={base} className="joystick" onPointerDown={(e) => { active.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); update(e) }} onPointerMove={(e) => active.current === e.pointerId && update(e)} onPointerUp={end} onPointerCancel={end} aria-label="Walk joystick">
      <div className="joystick__knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  )
}
