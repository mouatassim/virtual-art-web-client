import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildLayout } from '@core/layout'
import type { ExpoConfig } from '@core/entities/expo.entity'
import type { ArtworkConfig } from '@core/entities/artwork.entity'
import type { Layout } from '@core/layout'

interface ExpoContextValue {
  config: ExpoConfig
  layout: Layout
  setArtworks: (artworks: ArtworkConfig[]) => void
}

const ExpoContext = createContext<ExpoContextValue | null>(null)

export function useExpoContext(): ExpoContextValue {
  const ctx = useContext(ExpoContext)
  if (!ctx) throw new Error('useExpoContext must be used inside ExpoProvider')
  return ctx
}

export function ExpoProvider({ config: initial, children }: { config: ExpoConfig; children: React.ReactNode }) {
  const [artworks, setArtworks] = useState(initial.artworks)

  // Sync when the parent passes a new artworks array (admin live preview)
  useEffect(() => { setArtworks(initial.artworks) }, [initial.artworks])

  const config = useMemo(() => ({ ...initial, artworks }), [initial, artworks])
  const layout = useMemo(() => buildLayout(config), [config])
  return <ExpoContext.Provider value={{ config, layout, setArtworks }}>{children}</ExpoContext.Provider>
}
