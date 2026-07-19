import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox, useGLTF, ContactShadows } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { PlacedSculpture } from '@core/layout'
import { useExpoStore } from '../../Player/useExpoStore'
import { useExpoContext } from '../ExpoContext'
import { focusArtwork } from '../focus'
import { TrackSpot } from './TrackSpot'

function Model({ url, scale }: { url: string; scale: number }) {
  const { scene } = useGLTF(url)
  const clone = useMemo(() => scene.clone(true), [scene])
  return <primitive object={clone} scale={scale} />
}

function Placeholder({ s }: { s: PlacedSculpture }) {
  const m = s.config.material ?? { color: '#b7885a', metalness: 1, roughness: 0.25 }
  const mat = <meshStandardMaterial color={m.color} metalness={m.metalness} roughness={m.roughness} envMapIntensity={1.2} />
  switch (s.config.shape) {
    case 'monolith':
      return <RoundedBox args={[0.32, 1.15, 0.2]} radius={0.03} smoothness={4} position={[0, 0.575, 0]}>{mat}</RoundedBox>
    case 'spheres':
      return (
        <group>
          {[0.18, 0.13, 0.09].map((r, i, a) => (
            <mesh key={r} position={[0, a.slice(0, i).reduce((acc, v) => acc + v * 2, 0) + r, 0]}>
              <sphereGeometry args={[r, 48, 32]} />{mat}
            </mesh>
          ))}
        </group>
      )
    default:
      return <mesh position={[0, 0.34, 0]} rotation={[0.35, 0.6, 0]}><torusKnotGeometry args={[0.2, 0.055, 320, 40, 2, 3]} />{mat}</mesh>
  }
}

export function Sculpture({ s }: { s: PlacedSculpture }) {
  const pw = s.config.plinth?.width ?? 0.7; const ph = s.plinthHeight
  const hovered = useExpoStore((st) => st.hoveredId === s.config.id)
  const { layout, config } = useExpoContext()
  const spotFrom = useMemo(() => s.position.clone().add(new THREE.Vector3(0.9, config.room.height - 0.12, 0.9)), [s.position, config.room.height])
  const spotTo = useMemo(() => s.position.clone().setY(ph + 0.35), [s.position, ph])

  const onClick = (e: ThreeEvent<MouseEvent>) => { if (e.delta > 8) return; e.stopPropagation(); focusArtwork(s.config.id, layout) }

  return (
    <>
      <group position={s.position} onClick={onClick} onPointerOver={(e) => { e.stopPropagation(); useExpoStore.getState().hover(s.config.id) }} onPointerOut={() => { if (useExpoStore.getState().hoveredId === s.config.id) useExpoStore.getState().hover(null) }}>
        <mesh position={[0, ph / 2, 0]}>
          <boxGeometry args={[pw, ph, pw]} />
          <meshStandardMaterial color={hovered ? '#ffffff' : '#f4f2ee'} roughness={0.9} />
        </mesh>
        <group position={[0, ph, 0]}>
          {s.config.model ? (
            <Suspense fallback={null}><Model url={s.config.model} scale={s.config.scale ?? 1} /></Suspense>
          ) : (
            <Placeholder s={s} />
          )}
        </group>
        <ContactShadows position={[0, 0.004, 0]} scale={pw * 2.6} far={ph + 0.2} blur={2.4} opacity={0.55} resolution={256} frames={1} color="#1a1612" />
      </group>
      <TrackSpot from={spotFrom} to={spotTo} radius={0.75} intensity={0.75} />
    </>
  )
}
