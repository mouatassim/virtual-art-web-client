import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'
import { ExpoProvider } from './modules/Expo/ExpoContext'
import { ExpoScene } from './modules/Expo/ExpoScene'
import { Overlay } from './modules/HUD/Overlay'
import { Spinner } from '@ui/Spinner/Spinner'
import { expoRepository } from '@infrastructure/mock/MockExpoRepository'

const queryClient = new QueryClient()

function ExpoApp() {
  const { data: config, isLoading } = useQuery({
    queryKey: ['expo-config'],
    queryFn: () => expoRepository.getConfig(),
    staleTime: Infinity,
  })

  if (isLoading || !config) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#e9e6e0' }}>
        <Spinner />
      </div>
    )
  }

  return (
    <ExpoProvider config={config}>
      <div className="app">
        <ExpoScene />
        <Overlay />
      </div>
    </ExpoProvider>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ExpoApp />
    </QueryClientProvider>
  )
}
