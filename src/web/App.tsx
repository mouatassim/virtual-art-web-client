import { useState, useEffect, useCallback } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ExpoProvider } from './modules/Expo/ExpoContext'
import { ExpoScene } from './modules/Expo/ExpoScene'
import { Overlay } from './modules/HUD/Overlay'
import { Sidebar } from './common/Layout/Sidebar'
import { Spinner } from '@ui/Spinner/Spinner'
import { httpExpoRepository } from '@infrastructure/http/HttpExpoRepository'
import { AdminPage } from './modules/Admin/AdminPage'
import './common/Layout/sidebar.css'

const queryClient = new QueryClient()

function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to: string) => {
    window.history.pushState(null, '', to)
    setPath(to)
  }, [])

  return { path, navigate }
}

function ExpoApp() {
  const [collapsed, setCollapsed] = useState(true)
  const { data: config, isLoading, isError } = useQuery({
    queryKey: ['expo-config'],
    queryFn: () => httpExpoRepository.getConfig(),
    staleTime: Infinity,
    retry: false,
  })

  if (isLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#e9e6e0' }}>
        <Spinner />
      </div>
    )
  }

  if (isError || !config) {
    return (
      <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#e9e6e0', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 28, fontStyle: 'italic', color: '#57534d' }}>
          No exhibition available yet.
        </p>
      </div>
    )
  }

  return (
    <ExpoProvider config={config}>
      <div className="app-shell" data-collapsed={String(collapsed)}>
        <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <div className="scene-area">
          <ExpoScene />
          <Overlay />
        </div>
      </div>
    </ExpoProvider>
  )
}

function AppRouter() {
  const { path } = useRoute()
  if (path.startsWith('/admin')) return <AdminPage />
  return <ExpoApp />
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}
