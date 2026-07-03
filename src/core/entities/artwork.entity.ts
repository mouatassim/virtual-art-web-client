export type WallId = 'north' | 'south' | 'east' | 'west' | 'center-north' | 'center-south'

export type ProceduralStyle =
  | 'color-field'
  | 'bauhaus'
  | 'flow'
  | 'orbits'
  | 'horizon'
  | 'grid'
  | 'strata'

export interface FrameStyle {
  color: string
  width: number
  depth: number
  mat: number
  metalness: number
  roughness: number
}

interface ArtworkBase {
  id: string
  title: string
  artist: string
  year: string
  medium: string
  dimensions?: string
  description: string
  price?: string
  link?: string
}

export interface PaintingConfig extends ArtworkBase {
  type?: 'painting'
  wall: WallId
  offset: number
  centerY?: number
  width: number
  height: number
  image?: string
  procedural?: { style: ProceduralStyle; seed: number; palette?: string[] }
  frame?: Partial<FrameStyle>
}

export interface SculptureConfig extends ArtworkBase {
  type: 'sculpture'
  position: [number, number]
  model?: string
  shape?: 'knot' | 'monolith' | 'spheres'
  scale?: number
  material?: { color: string; metalness: number; roughness: number }
  plinth?: { width: number; height: number }
}

export type ArtworkConfig = PaintingConfig | SculptureConfig
