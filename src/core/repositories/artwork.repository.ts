import type { ArtworkConfig } from '../entities/artwork.entity'

export interface IArtworkRepository {
  getAll(): Promise<ArtworkConfig[]>
  getById(id: string): Promise<ArtworkConfig | null>
}
