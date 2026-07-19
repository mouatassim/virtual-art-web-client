import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ToneMapping, SMAA } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
import { useExpoStore } from '../Player/useExpoStore'
import { useExpoContext } from './ExpoContext'
import { Room } from './components/Room'
import { Painting } from './components/Painting'
import { Sculpture } from './components/Sculpture'
import { Bench } from './components/Bench'
import { Player } from '../Player/Player'
import { TourDirector } from './TourDirector'

function ExpoEnvironment() {
  const { config } = useExpoContext()
  const { width: W, depth: D, height: H } = config.room
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.7}>
      <color attach="background" args={['#d9d4cc']} />
      {[-D / 4, D / 4].map((z) => (
        <Lightformer key={z} form="rect" intensity={3} position={[0, H, z]} rotation-x={Math.PI / 2} scale={[W - 3, 1.1, 1]} color="#fff4e6" />
      ))}
      <Lightformer form="rect" intensity={0.6} position={[0, 1.5, -D / 2]} scale={[W, 3, 1]} color="#f1eee8" />
      <Lightformer form="rect" intensity={0.6} position={[0, 1.5, D / 2]} rotation-y={Math.PI} scale={[W, 3, 1]} color="#f1eee8" />
      <Lightformer form="rect" intensity={0.5} position={[-W / 2, 1.5, 0]} rotation-y={Math.PI / 2} scale={[D, 3, 1]} color="#f1eee8" />
      <Lightformer form="rect" intensity={0.5} position={[W / 2, 1.5, 0]} rotation-y={-Math.PI / 2} scale={[D, 3, 1]} color="#f1eee8" />
    </Environment>
  )
}

function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={1.1} intensity={0.35} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.32} darkness={0.42} />
      <SMAA />
    </EffectComposer>
  )
}

function SceneContents() {
  const quality = useExpoStore((s) => s.quality)
  const { config, layout } = useExpoContext()
  const high = quality === 'high'

  return (
    <>
      <PerformanceMonitor onDecline={() => useExpoStore.getState().setQuality('low')} />
      <AdaptiveDpr pixelated={false} />
      <hemisphereLight args={['#fffaf2', '#c9c1b5', 1.1]} />
      <ExpoEnvironment />
      <Room />
      {layout.paintings.map((p) => <Painting key={p.config.id} p={p} />)}
      {layout.sculptures.map((s) => <Sculpture key={s.config.id} s={s} />)}
      {config.benches.map((b, i) => <Bench key={i} b={b} />)}
      <Player spawnX={config.spawn.position[0]} spawnZ={config.spawn.position[1]} spawnHeading={config.spawn.heading} eyeHeight={config.eyeHeight} layout={layout} />
      <TourDirector />
      {high && <Effects />}
    </>
  )
}

export function ExpoScene() {
  const quality = useExpoStore((s) => s.quality)
  const { config } = useExpoContext()
  const high = quality === 'high'

  return (
    <Canvas
      className="expo-canvas"
      dpr={high ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: !high, powerPreference: 'high-performance', toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 0.95 }}
      camera={{ fov: 62, near: 0.05, far: 80, position: [config.spawn.position[0], config.eyeHeight, config.spawn.position[1]] }}
      onCreated={(state) => { state.gl.toneMapping = THREE.NeutralToneMapping }}
    >
      <color attach="background" args={[config.room.ceilingColor]} />
      <SceneContents />
    </Canvas>
  )
}
