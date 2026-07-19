import * as THREE from 'three'

function grain(ctx: CanvasRenderingContext2D, size: number, amount: number, seed = 1) {
  let s = seed
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const img = ctx.getImageData(0, 0, size, size); const d = img.data
  for (let i = 0; i < d.length; i += 4) { const n = (rand() - 0.5) * amount; d[i] += n; d[i + 1] += n; d[i + 2] += n }
  ctx.putImageData(img, 0, 0)
}

function blotches(ctx: CanvasRenderingContext2D, size: number, count: number, light: string, dark: string, alpha: number) {
  let s = 7
  const rand = () => ((s = (s * 48271) % 2147483647) / 2147483647)
  for (let i = 0; i < count; i++) {
    const x = rand() * size; const y = rand() * size; const r = size * (0.03 + rand() * 0.18)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const c = rand() < 0.5 ? light : dark
    g.addColorStop(0, c); g.addColorStop(1, c.replace(/[\d.]+\)$/, '0)'))
    ctx.globalAlpha = alpha; ctx.fillStyle = g
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) ctx.fillRect(x - r + ox, y - r + oy, r * 2, r * 2)
  }
  ctx.globalAlpha = 1
}

export function makeFloorTextures(baseColor: string) {
  const size = 1024
  const c = document.createElement('canvas'); c.width = c.height = size
  const ctx = c.getContext('2d')!
  ctx.fillStyle = baseColor; ctx.fillRect(0, 0, size, size)
  blotches(ctx, size, 140, 'rgba(255,255,255,0.5)', 'rgba(30,25,20,0.5)', 0.08)
  let s = 3
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 9000; i++) { ctx.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)'; ctx.fillRect(rand() * size, rand() * size, 1 + rand() * 2, 1 + rand() * 2) }
  grain(ctx, size, 10)
  ctx.fillStyle = 'rgba(20,18,16,0.55)'; ctx.fillRect(0, 0, size, 3); ctx.fillRect(0, 0, 3, size)

  const r = document.createElement('canvas'); r.width = r.height = size
  const rctx = r.getContext('2d')!
  rctx.fillStyle = 'rgb(70,70,70)'; rctx.fillRect(0, 0, size, size)
  blotches(rctx, size, 90, 'rgba(150,150,150,0.8)', 'rgba(40,40,40,0.8)', 0.2)
  rctx.fillStyle = 'rgb(255,255,255)'; rctx.fillRect(0, 0, size, 4); rctx.fillRect(0, 0, 4, size)

  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace
  const roughnessMap = new THREE.CanvasTexture(r)
  for (const t of [map, roughnessMap]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8 }
  return { map, roughnessMap }
}

export function makePlasterBump() {
  const size = 512; const c = document.createElement('canvas'); c.width = c.height = size
  const ctx = c.getContext('2d')!; ctx.fillStyle = 'rgb(128,128,128)'; ctx.fillRect(0, 0, size, size)
  blotches(ctx, size, 200, 'rgba(160,160,160,0.6)', 'rgba(100,100,100,0.6)', 0.25)
  grain(ctx, size, 26, 11)
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

export function makeSoftShadow() {
  const w = 256; const c = document.createElement('canvas'); c.width = c.height = w
  const ctx = c.getContext('2d')!
  for (let i = 0; i < 18; i++) { const inset = (i / 18) * w * 0.22; ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(inset, inset, w - inset * 2, w - inset * 2) }
  return new THREE.CanvasTexture(c)
}

export function makeAOGradient() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 256, 0, 0)
  g.addColorStop(0, 'rgb(255,255,255)'); g.addColorStop(0.18, 'rgb(120,120,120)'); g.addColorStop(0.5, 'rgb(30,30,30)'); g.addColorStop(1, 'rgb(0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256)
  return new THREE.CanvasTexture(c)
}
