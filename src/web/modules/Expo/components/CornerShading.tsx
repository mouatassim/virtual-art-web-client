import { useMemo } from 'react'
import * as THREE from 'three'
import { makeAOGradient } from '@core/surfaces'
import type { ExpoConfig } from '@core/entities/expo.entity'

const ao = makeAOGradient()
const up = new THREE.Vector3(0, 1, 0)
const down = new THREE.Vector3(0, -1, 0)

interface StripProps {
  corner: THREE.Vector3; out: THREE.Vector3; normal: THREE.Vector3
  length: number; width: number; strength: number
}

function Strip({ corner, out, normal, length, width, strength }: StripProps) {
  const { position, quaternion } = useMemo(() => {
    const u = new THREE.Vector3().crossVectors(out, normal)
    const m = new THREE.Matrix4().makeBasis(u, out, normal)
    return { position: corner.clone().addScaledVector(out, width / 2).addScaledVector(normal, 0.003), quaternion: new THREE.Quaternion().setFromRotationMatrix(m) }
  }, [corner, out, normal, width])
  return (
    <mesh position={position} quaternion={quaternion} renderOrder={1}>
      <planeGeometry args={[length, width]} />
      <meshBasicMaterial color="#2b2218" alphaMap={ao} transparent opacity={strength} depthWrite={false} />
    </mesh>
  )
}

export function CornerShading({ config }: { config: ExpoConfig }) {
  const { width: W, depth: D, height: H, partition } = config.room
  const strips = useMemo(() => {
    const walls = [
      { p: new THREE.Vector3(0, 0, -D / 2), n: new THREE.Vector3(0, 0, 1), len: W },
      { p: new THREE.Vector3(0, 0, D / 2), n: new THREE.Vector3(0, 0, -1), len: W },
      { p: new THREE.Vector3(-W / 2, 0, 0), n: new THREE.Vector3(1, 0, 0), len: D },
      { p: new THREE.Vector3(W / 2, 0, 0), n: new THREE.Vector3(-1, 0, 0), len: D },
    ]
    const list: StripProps[] = []
    for (const w of walls) {
      const top = w.p.clone().setY(H)
      list.push({ corner: w.p, out: w.n, normal: up, length: w.len, width: 1.1, strength: 0.32 })
      list.push({ corner: w.p, out: up, normal: w.n, length: w.len, width: 0.9, strength: 0.22 })
      list.push({ corner: top, out: w.n, normal: down, length: w.len, width: 1.2, strength: 0.28 })
      list.push({ corner: top, out: down, normal: w.n, length: w.len, width: 1.0, strength: 0.18 })
    }
    if (partition) {
      for (const s of [1, -1]) {
        const p = new THREE.Vector3(0, 0, (s * partition.thickness) / 2)
        const n = new THREE.Vector3(0, 0, s)
        list.push({ corner: p, out: n, normal: up, length: partition.length, width: 0.9, strength: 0.3 })
        list.push({ corner: p, out: up, normal: n, length: partition.length, width: 0.6, strength: 0.16 })
      }
    }
    return list
  }, [W, D, H, partition])

  return <group>{strips.map((s, i) => <Strip key={i} {...s} />)}</group>
}
