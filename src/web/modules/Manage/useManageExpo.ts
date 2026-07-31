import { useQueryClient } from '@tanstack/react-query'
import { useExpoContext } from '../Expo/ExpoContext'
import { artworkRepository } from '@infrastructure/mock/MockArtworkRepository'
import type { ArtworkConfig } from '@core/entities/artwork.entity'

export function useManageExpo() {
  const { setArtworks } = useExpoContext()
  const qc = useQueryClient()

  const refresh = async () => {
    const all = await artworkRepository.getAll()
    setArtworks(all)
    qc.invalidateQueries({ queryKey: ['expo-config'] })
  }

  const addArtwork = async (artwork: ArtworkConfig) => {
    await artworkRepository.create(artwork)
    await refresh()
  }

  const updateArtwork = async (id: string, patch: Partial<ArtworkConfig>) => {
    await artworkRepository.update(id, patch)
    await refresh()
  }

  const removeArtwork = async (id: string) => {
    await artworkRepository.remove(id)
    await refresh()
  }

  return { addArtwork, updateArtwork, removeArtwork }
}
