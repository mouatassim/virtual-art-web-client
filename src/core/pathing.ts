import { PLAYER_RADIUS, type Box2, type Layout } from './layout'

type P = { x: number; z: number }
const CLEAR = PLAYER_RADIUS + 0.12

function segmentHitsBox(a: P, b: P, box: Box2, pad: number) {
  const minX = box.minX - pad; const maxX = box.maxX + pad
  const minZ = box.minZ - pad; const maxZ = box.maxZ + pad
  const dx = b.x - a.x; const dz = b.z - a.z
  let t0 = 0; let t1 = 1
  const clip = (p: number, q: number) => {
    if (p === 0) return q >= 0
    const r = q / p
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r }
    else { if (r < t0) return false; if (r < t1) t1 = r }
    return true
  }
  return clip(-dx, a.x - minX) && clip(dx, maxX - a.x) && clip(-dz, a.z - minZ) && clip(dz, maxZ - a.z) && t0 < t1
}

const clearPath = (a: P, b: P, obstacles: Box2[]) => obstacles.every((o) => !segmentHitsBox(a, b, o, PLAYER_RADIUS))
const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.z - b.z)

export function planPath(from: P, to: P, layout: Layout): P[] {
  const obs = layout.obstacles
  if (clearPath(from, to, obs)) return [to]

  const { bounds } = layout
  const nodes: P[] = [from, to]
  for (const o of obs)
    for (const x of [o.minX - CLEAR - 0.05, o.maxX + CLEAR + 0.05])
      for (const z of [o.minZ - CLEAR - 0.05, o.maxZ + CLEAR + 0.05])
        if (x > bounds.minX && x < bounds.maxX && z > bounds.minZ && z < bounds.maxZ) nodes.push({ x, z })

  const n = nodes.length
  const best = new Array<number>(n).fill(Infinity)
  const prev = new Array<number>(n).fill(-1)
  const done = new Array<boolean>(n).fill(false)
  best[0] = 0
  for (let it = 0; it < n; it++) {
    let u = -1
    for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || best[i] < best[u])) u = i
    if (u < 0 || best[u] === Infinity) break
    if (u === 1) break
    done[u] = true
    for (let v = 0; v < n; v++) {
      if (done[v] || v === u || !clearPath(nodes[u], nodes[v], obs)) continue
      const d = best[u] + dist(nodes[u], nodes[v])
      if (d < best[v]) { best[v] = d; prev[v] = u }
    }
  }
  if (prev[1] < 0) return [to]
  const path: P[] = []
  for (let v = 1; v !== 0; v = prev[v]) path.unshift(nodes[v])
  return path
}
