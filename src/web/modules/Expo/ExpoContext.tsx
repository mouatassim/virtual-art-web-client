import { createContext, useContext, useMemo } from 'react'
import { buildLayout } from '@core/layout'
import type { ExpoConfig } from '@core/entities/expo.entity'
import type { Layout } from '@core/layout'

interface ExpoContextValue {
  config: ExpoConfig
  layout: Layout
}

const ExpoContext = createContext<ExpoContextValue | null>(null)

export function useExpoContext(): ExpoContextValue {
  const ctx = useContext(ExpoContext)
  if (!ctx) throw new Error('useExpoContext must be used inside ExpoProvider')
  return ctx
}

export function ExpoProvider({ config, children }: { config: ExpoConfig; children: React.ReactNode }) {
  const layout = useMemo(() => buildLayout(config), [config])
  return <ExpoContext.Provider value={{ config, layout }}>{children}</ExpoContext.Provider>
}
