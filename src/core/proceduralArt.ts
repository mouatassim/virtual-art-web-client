import type { ProceduralStyle } from './entities/artwork.entity'

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeNoise(rand: () => number) {
  const size = 256
  const perm = new Uint8Array(size * 2)
  const vals = new Float32Array(size)
  for (let i = 0; i < size; i++) { perm[i] = i; vals[i] = rand() }
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  for (let i = 0; i < size; i++) perm[i + size] = perm[i]
  const fade = (t: number) => t * t * (3 - 2 * t)
  const v = (x: number, y: number) => vals[perm[(perm[x & 255] + y) & 511]]
  return (x: number, y: number) => {
    const xi = Math.floor(x); const yi = Math.floor(y)
    const xf = fade(x - xi); const yf = fade(y - yi)
    const a = v(xi, yi) + (v(xi + 1, yi) - v(xi, yi)) * xf
    const b = v(xi, yi + 1) + (v(xi + 1, yi + 1) - v(xi, yi + 1)) * xf
    return a + (b - a) * yf
  }
}

const DEFAULT_PALETTES: Record<ProceduralStyle, string[]> = {
  'color-field': ['#8c2f1f', '#d98c3f', '#2c3e50', '#efe2cc'],
  bauhaus: ['#efe9dc', '#c8372d', '#1f4e79', '#f2b134', '#1b1b1b'],
  flow: ['#f2eee6', '#1d2b3a', '#4c7a8f', '#c79a4a'],
  orbits: ['#f1ebe0', '#d4532b', '#1a3a4a', '#e8b04b', '#6d8b74'],
  horizon: ['#e9dcc8', '#c9b6a0', '#8fa3ad', '#3b4a44', '#f4d7a8'],
  grid: ['#f3efe7', '#e9e1d4', '#b8b0a4', '#d9cbb6'],
  strata: ['#e8dcc7', '#b0603a', '#6e4a33', '#3c3a36', '#d6a35c', '#8a8577'],
}

export interface PaintOptions {
  style: ProceduralStyle
  seed: number
  palette?: string[]
  aspect: number
  resolution?: number
}

export function paintProcedural(opts: PaintOptions): HTMLCanvasElement {
  const res = opts.resolution ?? 1024
  const w = opts.aspect >= 1 ? res : Math.round(res * opts.aspect)
  const h = opts.aspect >= 1 ? Math.round(res / opts.aspect) : res
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')!
  const rand = mulberry32(opts.seed * 9973 + 17)
  const noise = makeNoise(rand)
  const pal = opts.palette ?? DEFAULT_PALETTES[opts.style]
  const pick = () => pal[Math.floor(rand() * pal.length)]
  const m = Math.min(w, h)

  switch (opts.style) {
    case 'color-field': {
      ctx.fillStyle = pal[0]; ctx.fillRect(0, 0, w, h)
      for (const b of [{ y0: 0.07, y1: 0.46, c: pal[1] }, { y0: 0.52, y1: 0.93, c: pal[2] }]) {
        for (let i = 0; i < 26; i++) {
          const inset = i * m * 0.0022; ctx.globalAlpha = 0.09; ctx.fillStyle = b.c
          ctx.fillRect(w * 0.08 + inset, h * b.y0 + inset, w * 0.84 - inset * 2, h * (b.y1 - b.y0) - inset * 2)
        }
        ctx.globalAlpha = 0.05
        for (let i = 0; i < 900; i++) {
          ctx.fillStyle = rand() < 0.5 ? pal[3] : b.c
          ctx.fillRect(w * (0.1 + rand() * 0.8), h * (b.y0 + 0.02 + rand() * (b.y1 - b.y0 - 0.04)), m * (0.04 + rand() * 0.12), m * 0.004 + rand() * m * 0.01)
        }
      }
      ctx.globalAlpha = 1; break
    }
    case 'bauhaus': {
      ctx.fillStyle = pal[0]; ctx.fillRect(0, 0, w, h)
      const cols = 3; const rows = Math.max(2, Math.round(3 / opts.aspect))
      const cw = w / cols; const ch = h / rows
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = c * cw; const y = r * ch; const s = Math.min(cw, ch)
        const kind = Math.floor(rand() * 5)
        ctx.fillStyle = pal[1 + Math.floor(rand() * (pal.length - 1))]; ctx.beginPath()
        if (kind === 0) ctx.arc(x + cw / 2, y + ch / 2, s * 0.4, 0, Math.PI * 2)
        else if (kind === 1) { const a = Math.floor(rand() * 4) * (Math.PI / 2); ctx.moveTo(x + cw / 2, y + ch / 2); ctx.arc(x + cw / 2, y + ch / 2, s * 0.45, a, a + Math.PI) }
        else if (kind === 2) ctx.rect(x + cw * 0.12, y + ch * 0.12, cw * 0.76, ch * 0.76)
        else if (kind === 3) { ctx.moveTo(x + cw * 0.1, y + ch * 0.9); ctx.lineTo(x + cw * 0.9, y + ch * 0.9); ctx.lineTo(x + cw * (0.1 + rand() * 0.8), y + ch * 0.1) }
        else { ctx.moveTo(x, y); ctx.arc(x, y, s * 0.95, 0, Math.PI / 2) }
        ctx.fill()
        if (rand() < 0.35) { ctx.fillStyle = pal[pal.length - 1]; ctx.beginPath(); ctx.arc(x + cw * (0.25 + rand() * 0.5), y + ch * (0.25 + rand() * 0.5), s * 0.07, 0, Math.PI * 2); ctx.fill() }
      }
      ctx.strokeStyle = pal[pal.length - 1]; ctx.lineWidth = m * 0.008; ctx.beginPath()
      ctx.moveTo(0, h * (0.3 + rand() * 0.4)); ctx.lineTo(w, h * (0.3 + rand() * 0.4)); ctx.stroke(); break
    }
    case 'flow': {
      ctx.fillStyle = pal[0]; ctx.fillRect(0, 0, w, h); ctx.lineCap = 'round'
      const scale = 2.6 / m
      for (let i = 0; i < 3600; i++) {
        let x = rand() * w; let y = rand() * h
        ctx.strokeStyle = pal[1 + Math.floor(Math.pow(rand(), 1.6) * (pal.length - 1))]
        ctx.globalAlpha = 0.3 + rand() * 0.5; ctx.lineWidth = m * (0.0016 + rand() * 0.0034)
        ctx.beginPath(); ctx.moveTo(x, y)
        for (let s = 0; s < 20 + Math.floor(rand() * 40); s++) {
          const a = noise(x * scale, y * scale) * Math.PI * 4
          x += Math.cos(a) * m * 0.006; y += Math.sin(a) * m * 0.006; ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1; break
    }
    case 'orbits': {
      ctx.fillStyle = pal[0]; ctx.fillRect(0, 0, w, h)
      for (let g = 0; g < 3; g++) {
        const cx = w * (0.25 + rand() * 0.5); const cy = h * (0.2 + rand() * 0.6)
        const rings = 6 + Math.floor(rand() * 8); const color = pal[1 + (g % (pal.length - 1))]
        for (let r = rings; r > 0; r--) {
          ctx.beginPath(); ctx.arc(cx + Math.sin(r) * m * 0.01, cy, (r / rings) * m * (0.18 + rand() * 0.1), 0, Math.PI * 2)
          ctx.strokeStyle = color; ctx.globalAlpha = 0.85; ctx.lineWidth = m * 0.006; ctx.stroke()
        }
        ctx.globalAlpha = 0.9; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx, cy, m * 0.025, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1; break
    }
    case 'horizon': {
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, pal[2]); sky.addColorStop(0.55, pal[1]); sky.addColorStop(0.7, pal[0]); sky.addColorStop(1, pal[0])
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h)
      const sun = ctx.createRadialGradient(w * 0.68, h * 0.56, 0, w * 0.68, h * 0.56, m * 0.35)
      sun.addColorStop(0, pal[4]); sun.addColorStop(0.15, pal[4] + 'cc'); sun.addColorStop(1, pal[4] + '00')
      ctx.fillStyle = sun; ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 1400; i++) { ctx.globalAlpha = 0.03; ctx.fillStyle = rand() < 0.5 ? '#ffffff' : pal[2]; ctx.fillRect(rand() * w, h * (0.1 + Math.pow(rand(), 1.4) * 0.5), m * (0.1 + rand() * 0.3), m * 0.006) }
      ctx.globalAlpha = 1; ctx.fillStyle = pal[3]; ctx.beginPath()
      const base = h * 0.7; ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 4) ctx.lineTo(x, base - noise(x * 0.004, 1) * h * 0.04 - noise(x * 0.02, 5) * h * 0.008)
      ctx.lineTo(w, h); ctx.fill()
      const water = ctx.createLinearGradient(0, base + h * 0.02, 0, h)
      water.addColorStop(0, pal[1] + '99'); water.addColorStop(1, pal[0] + 'ff')
      ctx.fillStyle = water; ctx.fillRect(0, base + h * 0.03, w, h); break
    }
    case 'grid': {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 9; i++) { ctx.globalAlpha = 0.08; ctx.fillStyle = pal[3]; ctx.fillRect(0, h * (i / 9), w, (h / 9) * 0.5) }
      ctx.globalAlpha = 0.55; ctx.strokeStyle = pal[2]; ctx.lineWidth = Math.max(1, m * 0.0012)
      const step = m / 34
      for (let y = step; y < h; y += step) { ctx.beginPath(); for (let x = 0; x <= w; x += 8) ctx.lineTo(x, y + (noise(x * 0.01, y) - 0.5) * 1.8); ctx.stroke() }
      ctx.globalAlpha = 0.35
      for (let x = step; x < w; x += step) { ctx.beginPath(); for (let y = 0; y <= h; y += 8) ctx.lineTo(x + (noise(x, y * 0.01) - 0.5) * 1.8, y); ctx.stroke() }
      ctx.globalAlpha = 1; break
    }
    case 'strata': {
      let y = 0
      while (y < h) {
        const band = m * (0.02 + rand() * 0.09); ctx.fillStyle = pick(); ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 6) ctx.lineTo(x, y + (noise(x * 0.006, y * 0.01) - 0.5) * m * 0.06)
        ctx.lineTo(w, h); ctx.fill(); y += band
      }
      ctx.globalAlpha = 0.08; ctx.strokeStyle = '#ffffff'
      for (let i = 0; i < 600; i++) {
        ctx.lineWidth = rand() * 1.5; ctx.beginPath()
        const sx = rand() * w; const sy = rand() * h
        ctx.moveTo(sx, sy); ctx.lineTo(sx + m * (0.05 + rand() * 0.15), sy + (rand() - 0.5) * m * 0.01); ctx.stroke()
      }
      ctx.globalAlpha = 1; break
    }
  }
  addSurface(ctx, w, h, rand)
  return canvas
}

function addSurface(ctx: CanvasRenderingContext2D, w: number, h: number, rand: () => number) {
  const img = ctx.getImageData(0, 0, w, h); const d = img.data
  for (let y = 0; y < h; y++) {
    const weaveY = ((y >> 1) & 1) * 3
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4; const n = (rand() - 0.5) * 14 + ((x >> 1) & 1) * 3 - weaveY
      d[i] = Math.max(0, Math.min(255, d[i] + n)); d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n)); d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n))
    }
  }
  ctx.putImageData(img, 0, 0)
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75)
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,25,10,0.12)')
  ctx.fillStyle = v; ctx.fillRect(0, 0, w, h)
}

export function paintPlaque(lines: { title: string; artist: string; meta: string; extra?: string }) {
  const W = 640; const H = 300
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#fbfaf7'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#1c1b19'; ctx.textBaseline = 'top'
  ctx.font = 'italic 500 50px "Cormorant Garamond", Georgia, serif'; ctx.fillText(lines.title, 36, 36, W - 72)
  ctx.font = '500 26px "Instrument Sans", system-ui, sans-serif'; ctx.fillText(lines.artist, 36, 112, W - 72)
  ctx.fillStyle = '#5d5a55'; ctx.font = '400 22px "Instrument Sans", system-ui, sans-serif'; ctx.fillText(lines.meta, 36, 156, W - 72)
  if (lines.extra) ctx.fillText(lines.extra, 36, 192, W - 72)
  ctx.fillStyle = '#b9b3a8'; ctx.fillRect(36, H - 44, 40, 3)
  return c
}
