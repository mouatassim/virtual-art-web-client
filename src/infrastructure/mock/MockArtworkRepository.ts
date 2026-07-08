import { expo } from '../../config/expo.config'
import type { IArtworkRepository } from '../../core/repositories/artwork.repository'
import type { ArtworkConfig } from '../../core/entities/artwork.entity'

export class MockArtworkRepository implements IArtworkRepository {
  async getAll(): Promise<ArtworkConfig[]> {
    return expo.artworks
  }

  async getById(id: string): Promise<ArtworkConfig | null> {
    return expo.artworks.find((a) => a.id === id) ?? null
  }
}

export const artworkRepository: IArtworkRepository = new MockArtworkRepository()
