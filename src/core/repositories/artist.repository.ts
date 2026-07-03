import type { ArtistProfile } from '../entities/expo.entity'

export interface IArtistRepository {
  getProfile(): Promise<ArtistProfile>
}
