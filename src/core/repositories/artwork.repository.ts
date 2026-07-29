import type { ArtworkConfig } from '../entities/artwork.entity'

export interface IArtworkRepository {
  getAll(): Promise<ArtworkConfig[]>
  getById(id: string): Promise<ArtworkConfig | null>
  create(artwork: ArtworkConfig): Promise<ArtworkConfig>
  update(id: string, patch: Partial<ArtworkConfig>): Promise<ArtworkConfig>
  remove(id: string): Promise<void>
  reorder(artworks: ArtworkConfig[]): Promise<ArtworkConfig[]>
}
