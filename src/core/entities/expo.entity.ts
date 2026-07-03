import type { ArtworkConfig, FrameStyle } from './artwork.entity'

export interface ArtistProfile {
  name: string
  bio: string
  website?: string
  contact?: string
}

export interface RoomConfig {
  width: number
  depth: number
  height: number
  partition: { length: number; thickness: number; height: number } | null
  wallColor: string
  floorColor: string
  ceilingColor: string
  floorGloss: number
}

export interface BenchConfig {
  position: [number, number]
  rotation?: number
  length?: number
}

export interface ExpoConfig {
  title: string
  subtitle: string
  artist: ArtistProfile
  room: RoomConfig
  spawn: { position: [number, number]; heading: number }
  eyeHeight: number
  frameDefaults: FrameStyle
  artworks: ArtworkConfig[]
  benches: BenchConfig[]
  tourDwell: number
}
