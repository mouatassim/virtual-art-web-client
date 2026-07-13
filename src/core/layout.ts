import * as THREE from 'three'
import type { ExpoConfig } from './entities/expo.entity'
import type { PaintingConfig, SculptureConfig, WallId, FrameStyle } from './entities/artwork.entity'

export interface Box2 {
  minX: number; maxX: number; minZ: number; maxZ: number
  kind: 'partition' | 'plinth' | 'bench'
}

export interface Viewpoint { x: number; z: number; yaw: number; pitch: number }

export interface PlacedPainting {
  config: PaintingConfig
  frame: FrameStyle
  position: THREE.Vector3
  rotationY: number
  normal: THREE.Vector3
  view: Viewpoint
}

export interface PlacedSculpture {
  config: SculptureConfig
  position: THREE.Vector3
  plinthHeight: number
  view: Viewpoint
}

export interface Layout {
  paintings: PlacedPainting[]
  sculptures: PlacedSculpture[]
  stops: { id: string; view: Viewpoint }[]
  obstacles: Box2[]
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
}

export const PLAYER_RADIUS = 0.32

export const yawFor = (dx: number, dz: number) => Math.atan2(-dx, -dz)

function wallFrame(cfg: ExpoConfig, wall: WallId) {
  const { width: W, depth: D, partition } = cfg.room
  const t = partition?.thickness ?? 0
  switch (wall) {
    case 'north': return { point: new THREE.Vector3(0, 0, -D / 2), normal: new THREE.Vector3(0, 0, 1) }
    case 'south': return { point: new THREE.Vector3(0, 0, D / 2), normal: new THREE.Vector3(0, 0, -1) }
    case 'west': return { point: new THREE.Vector3(-W / 2, 0, 0), normal: new THREE.Vector3(1, 0, 0) }
    case 'east': return { point: new THREE.Vector3(W / 2, 0, 0), normal: new THREE.Vector3(-1, 0, 0) }
    case 'center-north': return { point: new THREE.Vector3(0, 0, -t / 2), normal: new THREE.Vector3(0, 0, -1) }
    case 'center-south': return { point: new THREE.Vector3(0, 0, t / 2), normal: new THREE.Vector3(0, 0, 1) }
  }
}

export function buildLayout(cfg: ExpoConfig): Layout {
  const { width: W, depth: D, partition } = cfg.room
  const obstacles: Box2[] = []

  if (partition) obstacles.push({ minX: -partition.length / 2, maxX: partition.length / 2, minZ: -partition.thickness / 2, maxZ: partition.thickness / 2, kind: 'partition' })

  for (const b of cfg.benches) {
    const len = b.length ?? 2
    const rot = ((b.rotation ?? 0) % 180 + 180) % 180
    const along = rot > 45 && rot < 135
    const hx = (along ? 0.46 : len) / 2; const hz = (along ? len : 0.46) / 2
    obstacles.push({ minX: b.position[0] - hx, maxX: b.position[0] + hx, minZ: b.position[1] - hz, maxZ: b.position[1] + hz, kind: 'bench' })
  }

  const paintings: PlacedPainting[] = []
  const sculptures: PlacedSculpture[] = []
  const stops: Layout['stops'] = []

  for (const art of cfg.artworks) {
    if (art.type === 'sculpture') {
      const pw = art.plinth?.width ?? 0.7; const ph = art.plinth?.height ?? 0.9
      const [x, z] = art.position
      obstacles.push({ minX: x - pw / 2, maxX: x + pw / 2, minZ: z - pw / 2, maxZ: z + pw / 2, kind: 'plinth' })
      const toSpawn = new THREE.Vector2(cfg.spawn.position[0] - x, cfg.spawn.position[1] - z).normalize()
      const dist = 2.1
      const vx = x + toSpawn.x * dist; const vz = z + toSpawn.y * dist
      const lookY = ph + 0.35
      const view: Viewpoint = { x: vx, z: vz, yaw: yawFor(x - vx, z - vz), pitch: Math.atan2(lookY - cfg.eyeHeight, dist) }
      sculptures.push({ config: art, position: new THREE.Vector3(x, 0, z), plinthHeight: ph, view })
      stops.push({ id: art.id, view }); continue
    }

    const frame: FrameStyle = { ...cfg.frameDefaults, ...art.frame }
    const { point, normal } = wallFrame(cfg, art.wall)
    const look = normal.clone().negate()
    const right = new THREE.Vector3(-look.z, 0, look.x)
    const centerY = art.centerY ?? 1.58
    const position = point.clone().addScaledVector(right, art.offset).addScaledVector(normal, frame.depth / 2 + 0.002).setY(centerY)
    const outerW = art.width + 2 * (frame.mat + frame.width)
    const dist = THREE.MathUtils.clamp(outerW * 1.25 + 0.7, 2.0, 3.8)
    const vx = position.x + normal.x * dist; const vz = position.z + normal.z * dist
    const view: Viewpoint = { x: vx, z: vz, yaw: yawFor(-normal.x, -normal.z), pitch: Math.atan2(centerY - cfg.eyeHeight, dist) }
    paintings.push({ config: art, frame, position, rotationY: Math.atan2(normal.x, normal.z), normal, view })
    stops.push({ id: art.id, view })
  }

  const r = PLAYER_RADIUS
  return { paintings, sculptures, stops, obstacles, bounds: { minX: -W / 2 + r, maxX: W / 2 - r, minZ: -D / 2 + r, maxZ: D / 2 - r } }
}

export function resolveCollisions(p: THREE.Vector3, layout: Layout) {
  const { bounds } = layout
  for (let pass = 0; pass < 2; pass++) {
    for (const b of layout.obstacles) {
      const cx = THREE.MathUtils.clamp(p.x, b.minX, b.maxX); const cz = THREE.MathUtils.clamp(p.z, b.minZ, b.maxZ)
      const dx = p.x - cx; const dz = p.z - cz; const d2 = dx * dx + dz * dz
      if (d2 < PLAYER_RADIUS * PLAYER_RADIUS) {
        if (d2 > 1e-8) { const d = Math.sqrt(d2); p.x = cx + (dx / d) * PLAYER_RADIUS; p.z = cz + (dz / d) * PLAYER_RADIUS }
        else {
          const pushes = [{ v: b.minX - PLAYER_RADIUS - p.x, axis: 'x' as const }, { v: b.maxX + PLAYER_RADIUS - p.x, axis: 'x' as const }, { v: b.minZ - PLAYER_RADIUS - p.z, axis: 'z' as const }, { v: b.maxZ + PLAYER_RADIUS - p.z, axis: 'z' as const }].sort((a, c) => Math.abs(a.v) - Math.abs(c.v))
          p[pushes[0].axis] += pushes[0].v
        }
      }
    }
    p.x = THREE.MathUtils.clamp(p.x, bounds.minX, bounds.maxX); p.z = THREE.MathUtils.clamp(p.z, bounds.minZ, bounds.maxZ)
  }
  return p
}
