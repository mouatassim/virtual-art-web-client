import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useExpoStore, pose } from './useExpoStore'
import { resolveCollisions } from '@core/layout'

const WALK = 1.9
const RUN = 3.8
const GLIDE_MAX = 2.6
const LOOK_SENS = 0.0034
const PITCH_LIMIT = 1.1
const FOV_MIN = 30
const FOV_MAX = 72
const FOV_DEFAULT = 62

function dampAngle(a: number, b: number, lambda: number, dt: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * (1 - Math.exp(-lambda * dt))
}

function useKeys() {
  const keys = useRef(new Set<string>())
  useEffect(() => {
    const down = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.closest?.('input,textarea,[contenteditable]')) return; keys.current.add(e.code) }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const blur = () => keys.current.clear()
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur) }
  }, [])
  return keys
}

interface PlayerProps {
  spawnX: number
  spawnZ: number
  spawnHeading: number
  eyeHeight: number
  layout: import('@core/layout').Layout
}

export function Player({ spawnX, spawnZ, spawnHeading, eyeHeight, layout }: PlayerProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const gl = useThree((s) => s.gl)
  const size = useThree((s) => s.size)
  const keys = useKeys()

  const pos = useRef(new THREE.Vector3(spawnX, 0, spawnZ))
  const vel = useRef(new THREE.Vector3())
  const yaw = useRef((spawnHeading * Math.PI) / 180)
  const pitch = useRef(0)
  const yawT = useRef(yaw.current)
  const pitchT = useRef(0)
  const fovT = useRef(FOV_DEFAULT)
  const bob = useRef(0)
  const offset = useRef({ x: 0, y: 0, w: 0, h: 0 })
  const glide = useRef<{ id: number; path: { x: number; z: number }[]; i: number; final?: { yaw: number; pitch: number } } | null>(null)
  const lastGlideId = useRef(0)

  useEffect(() => {
    const el = gl.domElement
    const pointers = new Map<number, { x: number; y: number }>()
    let pinchStart = 0; let fovStart = FOV_DEFAULT

    const down = (e: PointerEvent) => { pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); el.classList.add('dragging'); if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinchStart = Math.hypot(a.x - b.x, a.y - b.y); fovStart = fovT.current } }
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId); if (!prev) return
      const dx = e.clientX - prev.x; const dy = e.clientY - prev.y
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (pinchStart > 0) fovT.current = THREE.MathUtils.clamp(fovStart * (pinchStart / d), FOV_MIN, FOV_MAX); return }
      const k = LOOK_SENS * (fovT.current / FOV_DEFAULT) * (e.pointerType === 'touch' ? 1.25 : 1)
      yawT.current += dx * k; pitchT.current = THREE.MathUtils.clamp(pitchT.current + dy * k, -PITCH_LIMIT, PITCH_LIMIT)
      if (glide.current) glide.current.final = undefined
    }
    const up = (e: PointerEvent) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchStart = 0; if (pointers.size === 0) el.classList.remove('dragging') }
    const wheel = (e: WheelEvent) => { e.preventDefault(); fovT.current = THREE.MathUtils.clamp(fovT.current + e.deltaY * 0.03, FOV_MIN, FOV_MAX) }
    el.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up); el.addEventListener('wheel', wheel, { passive: false })
    return () => { el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); el.removeEventListener('wheel', wheel) }
  }, [gl])

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.code === 'Digit0') fovT.current = FOV_DEFAULT }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const s = useExpoStore.getState()
    const k = keys.current

    if (s.glide && s.glide.id !== lastGlideId.current) {
      lastGlideId.current = s.glide.id
      if (s.glide.instant) {
        const end = s.glide.path[s.glide.path.length - 1]
        pos.current.set(end.x, 0, end.z); vel.current.set(0, 0, 0)
        if (s.glide.final) { yaw.current = yawT.current = s.glide.final.yaw; pitch.current = pitchT.current = s.glide.final.pitch }
        glide.current = null; useExpoStore.setState({ arrivedGlide: s.glide.id })
      } else glide.current = { id: s.glide.id, path: s.glide.path, i: 0, final: s.glide.final }
    }

    let fwd = 0; let strafe = 0; let turn = 0
    if (s.entered) {
      if (k.has('KeyW') || k.has('ArrowUp')) fwd += 1
      if (k.has('KeyS') || k.has('ArrowDown')) fwd -= 1
      if (k.has('KeyD')) strafe += 1
      if (k.has('KeyA')) strafe -= 1
      if (k.has('ArrowLeft') || k.has('KeyQ')) turn += 1
      if (k.has('ArrowRight') || k.has('KeyE')) turn -= 1
      fwd += s.joystick.y; strafe += s.joystick.x
    }
    const manual = Math.abs(fwd) + Math.abs(strafe) > 0.05
    if (turn) yawT.current += turn * 1.6 * dt
    if (manual) { if (glide.current) glide.current = null; if (s.mode === 'tour') s.setMode('explore'); if (s.selectedId) s.select(null) }

    const desired = new THREE.Vector3()
    if (manual) {
      const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? RUN : WALK
      const sin = Math.sin(yaw.current); const cos = Math.cos(yaw.current)
      desired.set(-sin * fwd + cos * strafe, 0, -cos * fwd - sin * strafe)
      if (desired.lengthSq() > 1) desired.normalize()
      desired.multiplyScalar(speed)
    } else if (glide.current) {
      const g = glide.current; const tgt = g.path[g.i]
      const dx = tgt.x - pos.current.x; const dz = tgt.z - pos.current.z; const d = Math.hypot(dx, dz)
      const last = g.i === g.path.length - 1
      if (d < (last ? 0.02 : 0.25)) { if (last) { glide.current = null; useExpoStore.setState({ arrivedGlide: g.id }) } else g.i++ }
      else { const v = last ? Math.min(GLIDE_MAX, d * 2.2 + 0.05) : GLIDE_MAX; desired.set((dx / d) * v, 0, (dz / d) * v) }
      if (g.final) { yawT.current = g.final.yaw; pitchT.current = g.final.pitch }
    }

    vel.current.lerp(desired, 1 - Math.exp(-(manual ? 9 : 5) * dt))
    pos.current.addScaledVector(vel.current, dt)
    resolveCollisions(pos.current, layout)

    const lookLambda = glide.current?.final ? 3.2 : 14
    yaw.current = dampAngle(yaw.current, yawT.current, lookLambda, dt)
    pitch.current = THREE.MathUtils.damp(pitch.current, pitchT.current, lookLambda, dt)
    yawT.current = yaw.current + (((yawT.current - yaw.current + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI

    const fov = THREE.MathUtils.damp(camera.fov, fovT.current, 10, dt)
    let projDirty = Math.abs(fov - camera.fov) > 0.01
    camera.fov = fov

    const { width: vw, height: vh } = size
    const wide = vw > 720; const open = !!s.selectedId
    const tx = open && wide ? Math.min(220, vw * 0.16) : 0
    const ty = open && !wide ? vh * 0.2 : 0
    const ox = THREE.MathUtils.damp(offset.current.x, tx, 5, dt); const oy = THREE.MathUtils.damp(offset.current.y, ty, 5, dt)
    if (Math.abs(ox - offset.current.x) > 0.05 || Math.abs(oy - offset.current.y) > 0.05 || offset.current.w !== vw || offset.current.h !== vh) {
      offset.current = { x: ox, y: oy, w: vw, h: vh }
      if (ox < 0.5 && oy < 0.5) camera.clearViewOffset()
      else camera.setViewOffset(vw + 2 * ox, vh + 2 * oy, 2 * ox, 2 * oy, vw, vh)
      projDirty = true
    }
    if (projDirty) camera.updateProjectionMatrix()

    const speed = vel.current.length()
    bob.current += dt * speed * 5.2
    const bobAmt = Math.min(1, speed / WALK) * 0.018
    camera.position.set(pos.current.x, eyeHeight + Math.sin(bob.current) * bobAmt, pos.current.z)
    camera.rotation.set(pitch.current, yaw.current, Math.sin(bob.current * 0.5) * bobAmt * 0.15, 'YXZ')

    pose.x = pos.current.x; pose.z = pos.current.z; pose.yaw = yaw.current; pose.moving = speed > 0.05
  })

  return null
}
