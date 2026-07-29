import type { IArtworkRepository } from '../../core/repositories/artwork.repository'
import type { ArtworkConfig } from '../../core/entities/artwork.entity'
import { useArtworkStore } from './artworkStore'

export class MockArtworkRepository implements IArtworkRepository {
  private get list() { return useArtworkStore.getState().artworks }
  private save(a: ArtworkConfig[]) { useArtworkStore.getState().set(a) }

  async getAll(): Promise<ArtworkConfig[]> { return this.list }
  async getById(id: string): Promise<ArtworkConfig | null> { return this.list.find((a) => a.id === id) ?? null }

  async create(artwork: ArtworkConfig): Promise<ArtworkConfig> { this.save([...this.list, artwork]); return artwork }

  async update(id: string, patch: Partial<ArtworkConfig>): Promise<ArtworkConfig> {
    const next = this.list.map((a) => (a.id === id ? ({ ...a, ...patch } as ArtworkConfig) : a))
    this.save(next)
    return next.find((a) => a.id === id)!
  }

  async remove(id: string): Promise<void> { this.save(this.list.filter((a) => a.id !== id)) }

  async reorder(artworks: ArtworkConfig[]): Promise<ArtworkConfig[]> { this.save(artworks); return artworks }
}

export const artworkRepository: IArtworkRepository = new MockArtworkRepository()
