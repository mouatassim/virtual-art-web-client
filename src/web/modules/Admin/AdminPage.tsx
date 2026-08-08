import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ExpoProvider } from '../Expo/ExpoContext'
import { ExpoScene } from '../Expo/ExpoScene'
import { ArtworkForm } from '../Manage/ArtworkForm'
import { http } from '@infrastructure/http/HttpClient'
import type { ExpoConfig } from '@core/entities/expo.entity'
import type { ArtworkConfig } from '@core/entities/artwork.entity'
import * as Icons from '@ui/Icons'
import './admin.css'

// ── Admin QueryClient (isolated from public viewer) ───────────────────────────
const adminQueryClient = new QueryClient()

// ── API types ─────────────────────────────────────────────────────────────────
interface ApiUser { id: string; email: string; firstName: string | null; lastName: string | null }
interface ApiExpo { id: string; title: string; subtitle: string | null; isPublished: boolean }
interface ApiArtwork {
  id: string; slug: string; type: 'PAINTING' | 'SCULPTURE'
  title: string; artist: string; year: string | null; medium: string | null
  dimensions: string | null; description: string | null; price: string | null; link: string | null
  wall: string | null; offset: number | null; centerY: number | null
  width: number | null; height: number | null; imageUrl: string | null
  proceduralStyle: string | null; proceduralSeed: number | null; proceduralPalette: string[]
  frameOverrides: { color?: string; width?: number; depth?: number; mat?: number; metalness?: number; roughness?: number } | null
  positionX: number | null; positionZ: number | null
  shape: string | null; scale: number | null
  materialColor: string | null; materialMetalness: number | null; materialRoughness: number | null
  plinthWidth: number | null; plinthHeight: number | null
}
interface ApiBench { id: string; positionX: number; positionZ: number; rotation: number | null; length: number | null }

// ── Converters ────────────────────────────────────────────────────────────────
const WALL_MAP: Record<string, string> = { NORTH: 'north', SOUTH: 'south', EAST: 'east', WEST: 'west', CENTER_NORTH: 'center-north', CENTER_SOUTH: 'center-south' }
const STYLE_MAP: Record<string, string> = { COLOR_FIELD: 'color-field', BAUHAUS: 'bauhaus', FLOW: 'flow', ORBITS: 'orbits', HORIZON: 'horizon', GRID: 'grid', STRATA: 'strata' }

function apiArtworkToConfig(a: ApiArtwork): ArtworkConfig {
  if (a.type === 'SCULPTURE') {
    return {
      id: a.id, type: 'sculpture',
      title: a.title, artist: a.artist,
      year: a.year ?? '', medium: a.medium ?? '',
      dimensions: a.dimensions ?? undefined, description: a.description ?? '',
      price: a.price ?? undefined, link: a.link ?? undefined,
      position: [a.positionX ?? 0, a.positionZ ?? 0] as [number, number],
      shape: (a.shape?.toLowerCase() as 'knot' | 'monolith' | 'spheres') ?? 'knot',
      scale: a.scale ?? undefined,
      material: a.materialColor ? { color: a.materialColor, metalness: a.materialMetalness ?? 0, roughness: a.materialRoughness ?? 1 } : undefined,
      plinth: a.plinthWidth ? { width: a.plinthWidth, height: a.plinthHeight ?? 1 } : undefined,
    }
  }
  return {
    id: a.id, title: a.title, artist: a.artist,
    year: a.year ?? '', medium: a.medium ?? '',
    dimensions: a.dimensions ?? undefined, description: a.description ?? '',
    price: a.price ?? undefined, link: a.link ?? undefined,
    wall: (WALL_MAP[a.wall ?? 'NORTH'] ?? 'north') as ArtworkConfig extends { wall: infer W } ? W : never,
    offset: a.offset ?? 0,
    centerY: a.centerY ?? undefined,
    width: a.width ?? 1, height: a.height ?? 1,
    image: a.imageUrl ?? undefined,
    procedural: a.proceduralStyle ? { style: STYLE_MAP[a.proceduralStyle] as never, seed: a.proceduralSeed ?? 1, palette: a.proceduralPalette.length ? a.proceduralPalette : undefined } : undefined,
    frame: a.frameOverrides ?? undefined,
  } as ArtworkConfig
}

function artworkConfigToApi(a: ArtworkConfig): Record<string, unknown> {
  const wallToApi = (w: string) => w.toUpperCase().replace('-', '_')
  const styleToApi = (s: string) => s.toUpperCase().replace('-', '_')

  if (a.type === 'sculpture') {
    return {
      slug: a.id.slice(0, 100),
      type: 'SCULPTURE',
      title: a.title, artist: a.artist, year: a.year, medium: a.medium,
      dimensions: a.dimensions, description: a.description, price: a.price,
      positionX: a.position[0], positionZ: a.position[1],
      shape: a.shape?.toUpperCase(),
      scale: a.scale,
      materialColor: a.material?.color,
      materialMetalness: a.material?.metalness,
      materialRoughness: a.material?.roughness,
      plinthWidth: a.plinth?.width,
      plinthHeight: a.plinth?.height,
    }
  }
  const p = a as Extract<ArtworkConfig, { wall: unknown }>
  return {
    slug: a.id.slice(0, 100),
    type: 'PAINTING',
    title: a.title, artist: a.artist, year: a.year, medium: a.medium,
    dimensions: a.dimensions, description: a.description, price: a.price,
    wall: wallToApi(p.wall ?? 'north'),
    offset: p.offset, centerY: p.centerY,
    width: p.width, height: p.height,
    imageUrl: p.image,
    proceduralStyle: p.procedural?.style ? styleToApi(p.procedural.style) : undefined,
    proceduralSeed: p.procedural?.seed,
    proceduralPalette: p.procedural?.palette,
    frameOverrides: p.frame,
  }
}

// ── Login form ────────────────────────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: (user: ApiUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await http.post('/auth/login', { email, password })
      const { user } = await http.get<{ user: ApiUser }>('/auth/me')
      onSuccess(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-root">
      <div className="admin-login-card">
        <h1 className="admin-login-title">Admin Office</h1>
        <p className="admin-login-subtitle">Virtual Art — artist dashboard</p>
        <form className="admin-login-form" onSubmit={submit}>
          {error && <div className="admin-login-error">{error}</div>}
          <div className="admin-field">
            <label className="admin-label">Email</label>
            <input className="admin-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="admin-field">
            <label className="admin-label">Password</label>
            <input className="admin-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="admin-save-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Create expo form ──────────────────────────────────────────────────────────
function CreateExpo({ onCreated }: { onCreated: (expo: ApiExpo) => void }) {
  const [title, setTitle] = useState('Open Walls')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { expo } = await http.post<{ expo: ApiExpo }>('/expos', { title })
      onCreated(expo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-create-card">
      <div className="admin-create-inner">
        <h2 className="admin-login-title">Create your first expo</h2>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {error && <div className="admin-login-error">{error}</div>}
          <div className="admin-field">
            <label className="admin-label">Exhibition title</label>
            <input className="admin-input" value={title} onChange={e => setTitle(e.target.value)} required autoFocus />
          </div>
          <button className="admin-save-btn" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create expo'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Expo settings tab ─────────────────────────────────────────────────────────
function ExpoTab({
  expoId, draft, onDraftChange,
}: {
  expoId: string
  draft: ExpoConfig
  onDraftChange: (d: ExpoConfig) => void
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const r = draft.room

  const field = (label: string, el: React.ReactNode) => (
    <div className="admin-field"><label className="admin-label">{label}</label>{el}</div>
  )

  const numInput = (val: number, onChange: (v: number) => void) => (
    <input className="admin-input" type="number" step="0.01" value={val}
      onChange={e => onChange(parseFloat(e.target.value) || 0)} />
  )

  const colorInput = (val: string, onChange: (v: string) => void) => (
    <input className="admin-input admin-color" type="color" value={val} onChange={e => onChange(e.target.value)} />
  )

  const setRoom = (patch: Partial<typeof r>) => onDraftChange({ ...draft, room: { ...r, ...patch } })

  const save = async () => {
    setSaving(true)
    try {
      await http.patch(`/expos/${expoId}`, {
        title: draft.title,
        subtitle: draft.subtitle,
        isPublished: (draft as ExpoConfig & { isPublished?: boolean }).isPublished,
        room: draft.room,
        spawn: draft.spawn,
        eyeHeight: draft.eyeHeight,
        tourDwell: draft.tourDwell,
        frameDefaults: draft.frameDefaults,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      // keep going
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-scroll">
      <p className="admin-section-title">General</p>
      {field('Title', <input className="admin-input" value={draft.title} onChange={e => onDraftChange({ ...draft, title: e.target.value })} />)}
      {field('Subtitle', <input className="admin-input" value={draft.subtitle} onChange={e => onDraftChange({ ...draft, subtitle: e.target.value })} />)}

      <div className="admin-divider" />
      <p className="admin-section-title">Room</p>
      <div className="admin-row-3">
        {field('Width (m)', numInput(r.width, v => setRoom({ width: v })))}
        {field('Depth (m)', numInput(r.depth, v => setRoom({ depth: v })))}
        {field('Height (m)', numInput(r.height, v => setRoom({ height: v })))}
      </div>
      <div className="admin-row-3">
        {field('Wall', colorInput(r.wallColor, v => setRoom({ wallColor: v })))}
        {field('Floor', colorInput(r.floorColor, v => setRoom({ floorColor: v })))}
        {field('Ceiling', colorInput(r.ceilingColor, v => setRoom({ ceilingColor: v })))}
      </div>

      <div className="admin-divider" />
      <p className="admin-section-title">Publish</p>
      <div className="admin-toggle">
        <div>
          <div className="admin-toggle-label">Published</div>
          <div className="admin-toggle-desc">Visible to everyone when on</div>
        </div>
        <label className="admin-switch">
          <input type="checkbox"
            checked={(draft as ExpoConfig & { isPublished?: boolean }).isPublished ?? false}
            onChange={e => onDraftChange({ ...draft, isPublished: e.target.checked } as ExpoConfig & { isPublished?: boolean })} />
          <span className="admin-switch-track" />
          <span className="admin-switch-thumb" />
        </label>
      </div>

      <button className="admin-save-btn" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
      {saved && <p className="admin-save-success">Saved ✓</p>}
    </div>
  )
}

// ── Artworks tab ──────────────────────────────────────────────────────────────
function ArtworksTab({
  expoId, draft, onDraftChange,
}: {
  expoId: string
  draft: ExpoConfig
  onDraftChange: (d: ExpoConfig) => void
}) {
  const [view, setView] = useState<'list' | 'add' | { edit: ArtworkConfig }>('list')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const artworks = draft.artworks

  const handleSave = async (artwork: ArtworkConfig) => {
    setBusy(true)
    try {
      if (typeof view === 'object' && 'edit' in view) {
        const { artwork: updated } = await http.patch<{ artwork: ApiArtwork }>(
          `/expos/${expoId}/artworks/${view.edit.id}`,
          artworkConfigToApi(artwork),
        )
        onDraftChange({ ...draft, artworks: artworks.map(a => a.id === view.edit.id ? apiArtworkToConfig(updated) : a) })
      } else {
        const payload = artworkConfigToApi(artwork)
        const { artwork: created } = await http.post<{ artwork: ApiArtwork }>(
          `/expos/${expoId}/artworks`, payload,
        )
        onDraftChange({ ...draft, artworks: [...artworks, apiArtworkToConfig(created)] })
      }
      setView('list')
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  const handleDelete = async (id: string) => {
    if (confirmId !== id) { setConfirmId(id); return }
    setBusy(true)
    try {
      await http.delete(`/expos/${expoId}/artworks/${id}`)
      onDraftChange({ ...draft, artworks: artworks.filter(a => a.id !== id) })
      setConfirmId(null)
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  if (view === 'add' || (typeof view === 'object' && 'edit' in view)) {
    const initial = typeof view === 'object' && 'edit' in view ? view.edit : undefined
    return (
      <div className="admin-scroll">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button className="admin-icon-btn" onClick={() => setView('list')}><Icons.ChevronLeft size={16} /></button>
          <span className="admin-section-title" style={{ margin: 0 }}>{initial ? 'Edit artwork' : 'Add artwork'}</span>
        </div>
        <ArtworkForm
          initial={initial}
          onSave={handleSave}
          onCancel={() => setView('list')}
        />
        {busy && <p style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>Saving…</p>}
      </div>
    )
  }

  return (
    <div className="admin-scroll">
      <p className="admin-section-title">Artworks ({artworks.length})</p>
      {artworks.map(art => (
        <div key={art.id} className="admin-artwork-item">
          <div className="admin-artwork-info">
            <span className="admin-artwork-type">{art.type === 'sculpture' ? '🗿' : '🖼'}</span>
            <div>
              <div className="admin-artwork-title">{art.title}</div>
              <div className="admin-artwork-meta">{art.year} · {art.medium}</div>
            </div>
          </div>
          <div className="admin-artwork-actions">
            <button className="admin-icon-btn" onClick={() => setView({ edit: art })} title="Edit">
              <Icons.ExternalLink size={14} />
            </button>
            <button
              className={`admin-icon-btn admin-icon-btn--delete ${confirmId === art.id ? 'admin-icon-btn--confirm' : ''}`}
              onClick={() => handleDelete(art.id)}
              onBlur={() => setConfirmId(null)}
              disabled={busy}
              title={confirmId === art.id ? 'Click again to confirm' : 'Delete'}
            >
              <Icons.Close size={14} />
            </button>
          </div>
        </div>
      ))}
      <button className="admin-add-btn" onClick={() => setView('add')}>
        + Add artwork
      </button>
    </div>
  )
}

// ── Benches tab ───────────────────────────────────────────────────────────────
function BenchesTab({
  expoId, draft, onDraftChange,
}: {
  expoId: string
  draft: ExpoConfig
  onDraftChange: (d: ExpoConfig) => void
}) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ posX: '0', posZ: '0', rotation: '90', length: '2' })
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const benches = (draft as ExpoConfig & { _benches?: ApiBench[] })._benches ?? []

  const addBench = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { bench } = await http.post<{ bench: ApiBench }>(`/expos/${expoId}/benches`, {
        positionX: parseFloat(form.posX) || 0,
        positionZ: parseFloat(form.posZ) || 0,
        rotation: parseFloat(form.rotation) || undefined,
        length: parseFloat(form.length) || undefined,
      })
      const newBenchConfig = { position: [bench.positionX, bench.positionZ] as [number, number], rotation: bench.rotation ?? undefined, length: bench.length ?? undefined }
      onDraftChange({
        ...draft,
        benches: [...draft.benches, newBenchConfig],
        _benches: [...benches, bench],
      } as ExpoConfig & { _benches: ApiBench[] })
      setAdding(false)
      setForm({ posX: '0', posZ: '0', rotation: '90', length: '2' })
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  const deleteBench = async (bench: ApiBench) => {
    if (confirmId !== bench.id) { setConfirmId(bench.id); return }
    setBusy(true)
    try {
      await http.delete(`/expos/${expoId}/benches/${bench.id}`)
      const remaining = benches.filter(b => b.id !== bench.id)
      onDraftChange({
        ...draft,
        benches: remaining.map(b => ({ position: [b.positionX, b.positionZ] as [number, number], rotation: b.rotation ?? undefined, length: b.length ?? undefined })),
        _benches: remaining,
      } as ExpoConfig & { _benches: ApiBench[] })
      setConfirmId(null)
    } catch { /* ignore */ } finally { setBusy(false) }
  }

  const f = (label: string, key: keyof typeof form) => (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      <input className="admin-input" type="number" step="0.1" value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} />
    </div>
  )

  return (
    <div className="admin-scroll">
      <p className="admin-section-title">Benches ({benches.length})</p>
      {benches.map((b, i) => (
        <div key={b.id} className="admin-bench-item">
          <span>Bench {i + 1} — ({b.positionX}, {b.positionZ}){b.rotation != null ? ` · ${b.rotation}°` : ''}{b.length != null ? ` · ${b.length}m` : ''}</span>
          <button
            className={`admin-icon-btn admin-icon-btn--delete ${confirmId === b.id ? 'admin-icon-btn--confirm' : ''}`}
            onClick={() => deleteBench(b)}
            onBlur={() => setConfirmId(null)}
            disabled={busy}
            title={confirmId === b.id ? 'Click again to confirm' : 'Delete'}
          >
            <Icons.Close size={14} />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={addBench} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px', border: '1px solid var(--line)', borderRadius: 8, background: 'rgba(255,255,255,.6)' }}>
          <div className="admin-row-2">{f('X', 'posX')}{f('Z', 'posZ')}</div>
          <div className="admin-row-2">{f('Rotation (°)', 'rotation')}{f('Length (m)', 'length')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-cancel" onClick={() => setAdding(false)}>Cancel</button>
            <button type="submit" className="btn-save" disabled={busy}>Add bench</button>
          </div>
        </form>
      ) : (
        <button className="admin-add-btn" onClick={() => setAdding(true)}>+ Add bench</button>
      )}
    </div>
  )
}

// ── Main admin component ──────────────────────────────────────────────────────
type AuthState = 'loading' | 'login' | 'ready'
type Tab = 'expo' | 'artworks' | 'benches'

export function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const [user, setUser] = useState<ApiUser | null>(null)
  const [expoId, setExpoId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ExpoConfig | null>(null)
  const [tab, setTab] = useState<Tab>('expo')

  // Check auth on mount
  useEffect(() => {
    http.get<{ user: ApiUser }>('/auth/me')
      .then(({ user: u }) => { setUser(u); loadExpo() })
      .catch(() => setAuthState('login'))
  }, [])

  const loadExpo = async () => {
    try {
      const { expos } = await http.get<{ expos: ApiExpo[] }>('/expos')
      if (!expos.length) { setAuthState('ready'); return }

      const first = expos[0]
      setExpoId(first.id)

      const { config } = await http.get<{ config: ExpoConfig }>(`/expos/${first.id}/full`)

      // Load benches with IDs for management
      const { benches } = await http.get<{ benches: ApiBench[] }>(`/expos/${first.id}/benches`)

      setDraft({
        ...config,
        isPublished: first.isPublished,
        _benches: benches,
      } as ExpoConfig & { isPublished: boolean; _benches: ApiBench[] })
      setAuthState('ready')
    } catch {
      setAuthState('ready')
    }
  }

  const handleLogout = async () => {
    await http.post('/auth/logout').catch(() => {})
    setUser(null)
    setDraft(null)
    setExpoId(null)
    setAuthState('login')
  }

  if (authState === 'loading') return (
    <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#e9e6e0' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  if (authState === 'login') return <AdminLogin onSuccess={u => { setUser(u); loadExpo() }} />

  if (!expoId || !draft) return (
    <CreateExpo onCreated={expo => {
      setExpoId(expo.id)
      setDraft({
        title: expo.title, subtitle: expo.subtitle ?? '',
        artist: { name: '', bio: '' },
        room: { width: 24, depth: 16, height: 4.4, partition: { length: 8, thickness: 0.3, height: 3.4 }, wallColor: '#f1eee8', floorColor: '#8f8a83', ceilingColor: '#e9e6e0', floorGloss: 0.55 },
        spawn: { position: [0, 6.4], heading: 0 },
        eyeHeight: 1.62, tourDwell: 9,
        frameDefaults: { color: '#1b1a19', width: 0.045, depth: 0.05, mat: 0.08, metalness: 0.1, roughness: 0.55 },
        artworks: [], benches: [],
        isPublished: false, _benches: [],
      } as ExpoConfig & { isPublished: boolean; _benches: ApiBench[] })
    }} />
  )

  return (
    <QueryClientProvider client={adminQueryClient}>
      <div className="admin-root">
        <header className="admin-topbar">
          <span className="admin-topbar-title">Admin Office</span>
          <div className="admin-topbar-right">
            <span className="admin-topbar-user">{user?.email}</span>
            <button className="admin-logout-btn" onClick={handleLogout}>Log out</button>
          </div>
        </header>

        <div className="admin-body">
          {/* ── Left panel ── */}
          <div className="admin-panel">
            <div className="admin-tabs">
              {(['expo', 'artworks', 'benches'] as Tab[]).map(t => (
                <button key={t} className={`admin-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t}
                </button>
              ))}
            </div>

            {tab === 'expo' && (
              <ExpoTab expoId={expoId} draft={draft} onDraftChange={setDraft} />
            )}
            {tab === 'artworks' && (
              <ArtworksTab expoId={expoId} draft={draft} onDraftChange={setDraft} />
            )}
            {tab === 'benches' && (
              <BenchesTab expoId={expoId} draft={draft} onDraftChange={setDraft} />
            )}
          </div>

          {/* ── Right: live preview ── */}
          <div className="admin-preview">
            <ExpoProvider config={draft}>
              <ExpoScene />
            </ExpoProvider>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}
