import { create } from 'zustand'
import { expo } from '../../config/expo.config'
import type { ArtworkConfig } from '../../core/entities/artwork.entity'

interface ArtworkStore {
  artworks: ArtworkConfig[]
  set: (artworks: ArtworkConfig[]) => void
}

export const useArtworkStore = create<ArtworkStore>((set) => ({
  artworks: expo.artworks,
  set: (artworks) => set({ artworks }),
}))
