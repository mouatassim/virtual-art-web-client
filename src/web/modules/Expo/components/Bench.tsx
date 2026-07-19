import { ContactShadows } from '@react-three/drei'
import type { BenchConfig } from '@core/entities/expo.entity'

export function Bench({ b }: { b: BenchConfig }) {
  const len = b.length ?? 2; const seatH = 0.44
  return (
    <group position={[b.position[0], 0, b.position[1]]} rotation={[0, ((b.rotation ?? 0) * Math.PI) / 180, 0]}>
      <mesh position={[0, seatH - 0.025, 0]}>
        <boxGeometry args={[len, 0.05, 0.44]} />
        <meshStandardMaterial color="#a77b52" roughness={0.6} />
      </mesh>
      {[-len / 2 + 0.18, len / 2 - 0.18].map((x) => (
        <mesh key={x} position={[x, (seatH - 0.05) / 2, 0]}>
          <boxGeometry args={[0.04, seatH - 0.05, 0.38]} />
          <meshStandardMaterial color="#1c1c1c" metalness={0.7} roughness={0.45} />
        </mesh>
      ))}
      <ContactShadows position={[0, 0.004, 0]} scale={[len + 0.8, 1.2]} far={0.6} blur={2} opacity={0.5} resolution={256} frames={1} />
    </group>
  )
}
