import { expo } from '../../config/expo.config'
import type { IArtistRepository } from '../../core/repositories/artist.repository'
import type { ArtistProfile } from '../../core/entities/expo.entity'

export class MockArtistRepository implements IArtistRepository {
  async getProfile(): Promise<ArtistProfile> {
    return expo.artist
  }
}

export const artistRepository: IArtistRepository = new MockArtistRepository()
