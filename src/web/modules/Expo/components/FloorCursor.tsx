import { useImperativeHandle, useRef, type Ref } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export interface FloorCursorHandle {
  show: (p: THREE.Vector3) => void
  hide: () => void
  pulse: (p: THREE.Vector3) => void
}

export function FloorCursor({ ref }: { ref: Ref<FloorCursorHandle> }) {
  const ring = useRef<THREE.Group>(null)
  const pulseRef = useRef<THREE.Mesh>(null)
  const pulseT = useRef(1)
  const visible = useRef(false)
  const target = useRef(new THREE.Vector3())

  useImperativeHandle(ref, () => ({
    show: (p) => { visible.current = true; target.current.set(p.x, 0.012, p.z) },
    hide: () => { visible.current = false },
    pulse: (p) => { pulseT.current = 0; pulseRef.current?.position.set(p.x, 0.013, p.z) },
  }))

  useFrame((_, dt) => {
    const g = ring.current
    if (g) {
      g.position.lerp(target.current, 1 - Math.exp(-25 * dt))
      const m = g.children[0] as THREE.Mesh
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = THREE.MathUtils.damp(mat.opacity, visible.current ? 0.75 : 0, 12, dt)
      ;(g.children[1] as THREE.Mesh).material = mat
      g.visible = mat.opacity > 0.01
    }
    const pm = pulseRef.current
    if (pm) {
      pulseT.current = Math.min(1, pulseT.current + dt * 1.6)
      const t = pulseT.current
      pm.scale.setScalar(0.4 + t * 1.2)
      ;(pm.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.8
      pm.visible = t < 1
    }
  })

  return (
    <>
      <group ref={ring} rotation={[-Math.PI / 2, 0, 0]} renderOrder={2}>
        <mesh><ringGeometry args={[0.2, 0.235, 48]} /><meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} /></mesh>
        <mesh><circleGeometry args={[0.03, 24]} /><meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} /></mesh>
      </group>
      <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.22, 0.25, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}
