import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MeshReflectorMaterial } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { makeFloorTextures, makePlasterBump } from '@core/surfaces'
import { planPath } from '@core/pathing'
import { useExpoStore, pose } from '../../Player/useExpoStore'
import { useExpoContext } from '../ExpoContext'
import { FloorCursor, type FloorCursorHandle } from './FloorCursor'
import { CornerShading } from './CornerShading'

const T = 0.3

function Wall({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  const bump = useMemo(() => {
    const t = makePlasterBump(); t.repeat.set(Math.max(size[0], size[2]) / 3, size[1] / 3); return t
  }, [size])
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.93} bumpMap={bump} bumpScale={0.6} />
    </mesh>
  )
}

function Skirting({ W, D }: { W: number; D: number }) {
  const h = 0.06
  const mat = <meshStandardMaterial color="#2a2826" roughness={0.8} />
  return (
    <group position={[0, h / 2, 0]}>
      <mesh position={[0, 0, -D / 2 + 0.006]}><boxGeometry args={[W, h, 0.012]} />{mat}</mesh>
      <mesh position={[0, 0, D / 2 - 0.006]}><boxGeometry args={[W, h, 0.012]} />{mat}</mesh>
      <mesh position={[-W / 2 + 0.006, 0, 0]}><boxGeometry args={[0.012, h, D]} />{mat}</mesh>
      <mesh position={[W / 2 - 0.006, 0, 0]}><boxGeometry args={[0.012, h, D]} />{mat}</mesh>
    </group>
  )
}

function Ceiling({ W, D, H, ceilingColor }: { W: number; D: number; H: number; ceilingColor: string }) {
  const coves = [-D / 4, D / 4]
  const tracks = [-D / 2 + 1.7, -1.6, 1.6, D / 2 - 1.7]
  return (
    <group>
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.95} />
      </mesh>
      {coves.map((z) => (
        <group key={z} position={[0, H - 0.005, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[W - 3, 1.1]} />
            <meshStandardMaterial color="#ffffff" emissive="#fff6e8" emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
          {[-0.6, 0.6].map((dz) => (
            <mesh key={dz} position={[0, -0.09, dz]}>
              <boxGeometry args={[W - 2.8, 0.18, 0.04]} />
              <meshStandardMaterial color={ceilingColor} roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
      {tracks.map((z) => (
        <mesh key={z} position={[0, H - 0.03, z]}>
          <boxGeometry args={[W - 1.4, 0.035, 0.035]} />
          <meshStandardMaterial color="#1c1c1c" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      {[-W / 2 + 1.6, W / 2 - 1.6].map((x) => (
        <mesh key={x} position={[x, H - 0.03, 0]}>
          <boxGeometry args={[0.035, 0.035, D - 1.4]} />
          <meshStandardMaterial color="#1c1c1c" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function Floor({ W, D, floorColor, floorGloss }: { W: number; D: number; floorColor: string; floorGloss: number }) {
  const quality = useExpoStore((s) => s.quality)
  const mode = useExpoStore((s) => s.mode)
  const requestGlide = useExpoStore((s) => s.requestGlide)
  const { layout } = useExpoContext()
  const cursor = useRef<FloorCursorHandle>(null)

  const { map, roughnessMap } = useMemo(() => {
    const t = makeFloorTextures(floorColor); t.map.repeat.set(W / 4, D / 4); t.roughnessMap.repeat.set(W / 4, D / 4); return t
  }, [floorColor, W, D])

  const onMove = (e: ThreeEvent<PointerEvent>) => { if (e.pointerType === 'touch') return; cursor.current?.show(e.point) }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return; e.stopPropagation()
    const target = { x: e.point.x, z: e.point.z }
    if (Math.hypot(target.x - pose.x, target.z - pose.z) < 0.25) return
    if (mode === 'tour') useExpoStore.getState().setMode('explore')
    useExpoStore.getState().select(null)
    cursor.current?.pulse(e.point)
    requestGlide(planPath({ x: pose.x, z: pose.z }, target, layout))
  }

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerMove={onMove} onPointerOut={() => cursor.current?.hide()} onClick={onClick} name="floor">
        <planeGeometry args={[W, D]} />
        {quality === 'high' ? (
          <MeshReflectorMaterial map={map} roughnessMap={roughnessMap} color="#ffffff" roughness={0.75} metalness={0.05} blur={[700, 260]} resolution={1024} mixBlur={2.2} mixStrength={0.9 * floorGloss} mixContrast={1} depthScale={0.9} minDepthThreshold={0.4} maxDepthThreshold={1.3} mirror={0} />
        ) : (
          <meshStandardMaterial map={map} roughnessMap={roughnessMap} roughness={1 - floorGloss * 0.6} metalness={0.05} />
        )}
      </mesh>
      <FloorCursor ref={cursor} />
    </>
  )
}

export function Room() {
  const { config } = useExpoContext()
  const { room } = config
  const { width: W, depth: D, height: H, partition: p, wallColor, ceilingColor, floorColor, floorGloss } = room
  return (
    <group>
      <Floor W={W} D={D} floorColor={floorColor} floorGloss={floorGloss} />
      <Ceiling W={W} D={D} H={H} ceilingColor={ceilingColor} />
      <Skirting W={W} D={D} />
      <CornerShading config={config} />
      <Wall position={[0, H / 2, -D / 2 - T / 2]} size={[W + 2 * T, H, T]} color={wallColor} />
      <Wall position={[0, H / 2, D / 2 + T / 2]} size={[W + 2 * T, H, T]} color={wallColor} />
      <Wall position={[-W / 2 - T / 2, H / 2, 0]} size={[T, H, D]} color={wallColor} />
      <Wall position={[W / 2 + T / 2, H / 2, 0]} size={[T, H, D]} color={wallColor} />
      {p && (
        <group>
          <Wall position={[0, p.height / 2, 0]} size={[p.length, p.height, p.thickness]} color={wallColor} />
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[p.length - 0.02, 0.06, p.thickness + 0.004]} />
            <meshStandardMaterial color="#2a2826" roughness={0.8} />
          </mesh>
        </group>
      )}
    </group>
  )
}
