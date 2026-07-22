import { useEffect } from 'react'
import { useExpoStore } from '../Player/useExpoStore'
import { useExpoContext } from '../Expo/ExpoContext'
import { stepArtwork } from '../Expo/focus'
import * as Icons from '@ui/Icons'

const closePanel = () => useExpoStore.getState().select(null)

export function InfoPanel() {
  const selectedId = useExpoStore((s) => s.selectedId)
  const mode = useExpoStore((s) => s.mode)
  const { config, layout } = useExpoContext()
  const byId = new Map(config.artworks.map((a) => [a.id, a]))
  const art = selectedId ? byId.get(selectedId) : undefined
  const index = art ? layout.stops.findIndex((s) => s.id === art.id) : -1

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.code === 'Escape') closePanel()
      if (!useExpoStore.getState().selectedId) return
      if (e.code === 'BracketRight' || e.code === 'KeyN') stepArtwork(1, layout)
      if (e.code === 'BracketLeft' || e.code === 'KeyP') stepArtwork(-1, layout)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [layout])

  const link = art?.link ?? (config.artist.contact ? `mailto:${config.artist.contact}?subject=${encodeURIComponent(`Inquiry: ${art?.title ?? ''}`)}` : undefined)

  return (
    <aside className={`panel ${art ? 'panel--open' : ''} ${mode === 'tour' ? 'panel--tour' : ''}`} aria-live="polite" aria-hidden={!art}>
      {art && (
        <>
          <div className="panel__top">
            <span className="eyebrow">{String(index + 1).padStart(2, '0')} / {String(layout.stops.length).padStart(2, '0')}{art.type === 'sculpture' ? ' · Sculpture' : ''}</span>
            <button className="icon-btn icon-btn--bare" onClick={closePanel} aria-label="Close"><Icons.Close size={18} /></button>
          </div>
          <h2 className="panel__title">{art.title}</h2>
          <p className="panel__artist">{art.artist}, {art.year}</p>
          <dl className="panel__facts">
            <div><dt>Medium</dt><dd>{art.medium}</dd></div>
            {art.dimensions && <div><dt>Size</dt><dd>{art.dimensions}</dd></div>}
            {art.price && <div><dt>Status</dt><dd>{art.price}</dd></div>}
          </dl>
          <p className="panel__desc">{art.description}</p>
          <div className="panel__actions">
            {link && art.price !== 'Sold' && (
              <a className="btn btn--primary btn--sm" href={link} target="_blank" rel="noreferrer">
                <Icons.Mail size={16} /> Inquire
              </a>
            )}
            {mode !== 'tour' && (
              <div className="panel__nav">
                <button className="icon-btn" onClick={() => stepArtwork(-1, layout)} aria-label="Previous work"><Icons.ChevronLeft size={18} /></button>
                <button className="icon-btn" onClick={() => stepArtwork(1, layout)} aria-label="Next work"><Icons.ChevronRight size={18} /></button>
              </div>
            )}
          </div>
          {config.artist.contact && art.price !== 'Sold' && <p className="panel__contact">{config.artist.contact}</p>}
        </>
      )}
    </aside>
  )
}
