import { useState } from 'react'
import { useTranslate } from '@common/hooks/useTranslate'
import { useExpoContext } from '../Expo/ExpoContext'
import { useManageExpo } from './useManageExpo'
import { ArtworkForm } from './ArtworkForm'
import type { ArtworkConfig } from '@core/entities/artwork.entity'
import * as Icons from '@ui/Icons'

type View = 'list' | 'add' | { edit: ArtworkConfig }

export function ManagePanel() {
  const { t } = useTranslate()
  const { config } = useExpoContext()
  const { addArtwork, updateArtwork, removeArtwork } = useManageExpo()
  const [view, setView] = useState<View>('list')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleSave = async (artwork: ArtworkConfig) => {
    if (typeof view === 'object' && 'edit' in view) {
      await updateArtwork(view.edit.id, artwork)
    } else {
      await addArtwork(artwork)
    }
    setView('list')
  }

  const handleDelete = async (id: string) => {
    if (confirmId === id) {
      await removeArtwork(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
    }
  }

  if (view === 'add') {
    return (
      <div className="manage-panel">
        <div className="manage-header">
          <button className="back-btn" onClick={() => setView('list')}><Icons.ChevronLeft size={16} /></button>
          <h2>{t('manage.addArtwork')}</h2>
        </div>
        <ArtworkForm onSave={handleSave} onCancel={() => setView('list')} />
      </div>
    )
  }

  if (typeof view === 'object' && 'edit' in view) {
    return (
      <div className="manage-panel">
        <div className="manage-header">
          <button className="back-btn" onClick={() => setView('list')}><Icons.ChevronLeft size={16} /></button>
          <h2>{t('manage.editArtwork')}</h2>
        </div>
        <ArtworkForm initial={view.edit} onSave={handleSave} onCancel={() => setView('list')} />
      </div>
    )
  }

  return (
    <div className="manage-panel">
      <div className="manage-header">
        <h2>{t('manage.artworks')}</h2>
        <button className="add-btn" onClick={() => setView('add')} title={t('manage.addArtwork')}>
          <Icons.Info size={16} />
        </button>
      </div>

      {config.artworks.length === 0 ? (
        <p className="manage-empty">{t('manage.noArtworks')}</p>
      ) : (
        <ul className="artwork-list">
          {config.artworks.map((art) => (
            <li key={art.id} className="artwork-item">
              <div className="artwork-item-info">
                <span className="artwork-item-type">{art.type === 'sculpture' ? '🗿' : '🖼'}</span>
                <div className="artwork-item-text">
                  <span className="artwork-item-title">{art.title}</span>
                  <span className="artwork-item-meta">{art.year} · {art.medium}</span>
                </div>
              </div>
              <div className="artwork-item-actions">
                <button className="item-btn" onClick={() => setView({ edit: art })} aria-label={t('manage.editArtwork')}>
                  <Icons.ExternalLink size={14} />
                </button>
                <button
                  className={`item-btn item-btn--delete ${confirmId === art.id ? 'confirming' : ''}`}
                  onClick={() => handleDelete(art.id)}
                  onBlur={() => setConfirmId(null)}
                  aria-label={t('manage.actions.delete')}
                  title={confirmId === art.id ? t('manage.actions.confirmDelete') : t('manage.actions.delete')}
                >
                  <Icons.Close size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button className="add-artwork-btn" onClick={() => setView('add')}>
        <Icons.Info size={15} /> {t('manage.addArtwork')}
      </button>
    </div>
  )
}
