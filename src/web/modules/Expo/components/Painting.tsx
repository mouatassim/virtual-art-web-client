import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import type { PlacedPainting } from '@core/layout'
import { paintPlaque, paintProcedural } from '@core/proceduralArt'
import { makeSoftShadow } from '@core/surfaces'
import { useExpoStore } from '../../Player/useExpoStore'
import { useExpoContext } from '../ExpoContext'
import { focusArtwork } from '../focus'
import { useFontsReady } from './useFontsReady'
import { TrackSpot } from './TrackSpot'

const softShadow = makeSoftShadow()

function useArtworkTexture(p: PlacedPainting) {
  const gl = useThree((s) => s.gl)
  const { config } = p
  const [tex, setTex] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let disposed = false; let t: THREE.Texture
    const finish = (tx: THREE.Texture) => { tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = gl.capabilities.getMaxAnisotropy(); tx.generateMipmaps = true; tx.minFilter = THREE.LinearMipmapLinearFilter; if (!disposed) setTex(tx) }
    if (config.image) {
      new THREE.TextureLoader().load(config.image, (loaded) => { t = loaded; finish(loaded) })
    } else {
      const proc = config.procedural ?? { style: 'color-field' as const, seed: config.id.length }
      t = new THREE.CanvasTexture(paintProcedural({ ...proc, aspect: config.width / config.height, resolution: 1280 }))
      finish(t)
    }
    return () => { disposed = true; t?.dispose() }
  }, [config, gl])

  return tex
}

export function Painting({ p }: { p: PlacedPainting }) {
  const { config, frame } = p
  const texture = useArtworkTexture(p)
  const fontsReady = useFontsReady()
  const hoveredId = useExpoStore((s) => s.hoveredId)
  const hovered = hoveredId === config.id
  const { layout, config: expoConfig } = useExpoContext()

  const plaque = useMemo(() => {
    const t = new THREE.CanvasTexture(paintPlaque({ title: config.title, artist: config.artist, meta: `${config.year} · ${config.medium}`, extra: config.dimensions }))
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t
  }, [config, fontsReady])

  const w = config.width; const h = config.height
  const matW = w + frame.mat * 2; const matH = h + frame.mat * 2
  const outW = matW + frame.width * 2; const outH = matH + frame.width * 2
  const fd = frame.depth

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: frame.color, metalness: frame.metalness, roughness: frame.roughness }), [frame.color, frame.metalness, frame.roughness])

  const isCenter = config.wall.startsWith('center')
  const spotFrom = useMemo(() => p.position.clone().addScaledVector(p.normal, isCenter ? 1.45 : 1.7).setY(expoConfig.room.height - 0.12), [p, isCenter, expoConfig.room.height])

  const onOver = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); useExpoStore.getState().hover(config.id) }
  const onOut = () => { if (useExpoStore.getState().hoveredId === config.id) useExpoStore.getState().hover(null) }
  const onClick = (e: ThreeEvent<MouseEvent>) => { if (e.delta > 8) return; e.stopPropagation(); focusArtwork(config.id, layout) }

  const plaqueX = outW / 2 + 0.28; const plaqueW = 0.2; const plaqueH = plaqueW * (300 / 640)

  return (
    <>
      <group position={p.position} rotation={[0, p.rotationY, 0]}>
        <mesh position={[0, -0.05, -fd / 2 + 0.001]}>
          <planeGeometry args={[outW + 0.22, outH + 0.26]} />
          <meshBasicMaterial map={softShadow} transparent opacity={0.85} depthWrite={false} />
        </mesh>
        <group onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
          <mesh position={[0, outH / 2 - frame.width / 2, 0]} material={frameMat}><boxGeometry args={[outW, frame.width, fd]} /></mesh>
          <mesh position={[0, -outH / 2 + frame.width / 2, 0]} material={frameMat}><boxGeometry args={[outW, frame.width, fd]} /></mesh>
          <mesh position={[-outW / 2 + frame.width / 2, 0, 0]} material={frameMat}><boxGeometry args={[frame.width, matH, fd]} /></mesh>
          <mesh position={[outW / 2 - frame.width / 2, 0, 0]} material={frameMat}><boxGeometry args={[frame.width, matH, fd]} /></mesh>
          <mesh position={[0, 0, -fd / 2 + 0.006]}><boxGeometry args={[matW, matH, 0.01]} /><meshStandardMaterial color="#f6f3ec" roughness={0.95} /></mesh>
          <mesh position={[0, 0, -fd / 2 + 0.0125]}>
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial key={texture ? texture.uuid : 'blank'} map={texture} color={texture ? '#ffffff' : '#d8d4cc'} roughness={0.62} metalness={0} />
          </mesh>
          <mesh position={[0, 0, -fd / 2 + 0.0015]} visible={hovered}>
            <planeGeometry args={[outW + 0.05, outH + 0.05]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.35} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
        <group position={[plaqueX, 1.32 - p.position.y, -fd / 2 + 0.004]} onClick={onClick}>
          <mesh><boxGeometry args={[plaqueW, plaqueH, 0.006]} /><meshStandardMaterial color="#f7f5f0" roughness={0.9} /></mesh>
          <mesh position={[0, 0, 0.0035]}><planeGeometry args={[plaqueW, plaqueH]} /><meshStandardMaterial map={plaque} roughness={0.85} /></mesh>
        </group>
      </group>
      <TrackSpot from={spotFrom} to={p.position} radius={Math.max(outW, outH) * 0.62} />
    </>
  )
}
