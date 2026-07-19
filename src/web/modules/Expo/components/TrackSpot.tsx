import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

interface Props {
  from: THREE.Vector3
  to: THREE.Vector3
  radius: number
  intensity?: number
  color?: string
}

export function TrackSpot({ from, to, radius, intensity = 1, color = '#fff5e8' }: Props) {
  const light = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])
  const can = useRef<THREE.Group>(null)
  const distance = from.distanceTo(to)
  const angle = Math.min(0.9, Math.atan((radius * 1.25) / distance))

  useLayoutEffect(() => {
    target.position.copy(to); target.updateMatrixWorld()
    if (light.current) light.current.target = target
    can.current?.lookAt(to)
  }, [to, target])

  return (
    <>
      <primitive object={target} />
      <spotLight ref={light} position={from} color={color} intensity={intensity * 4.6 * distance * distance} angle={angle} penumbra={0.75} decay={2} distance={0} />
      <mesh position={[from.x, from.y + 0.05, from.z]}>
        <cylinderGeometry args={[0.008, 0.008, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} />
      </mesh>
      <group ref={can} position={from}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.038, 0.17, 20]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.086]}>
          <circleGeometry args={[0.034, 20]} />
          <meshBasicMaterial color="#fff7ea" toneMapped={false} />
        </mesh>
      </group>
    </>
  )
}
