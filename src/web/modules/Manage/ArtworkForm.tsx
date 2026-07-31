import { useState, type FormEvent } from 'react'
import { useTranslate } from '@common/hooks/useTranslate'
import type { ArtworkConfig, PaintingConfig, SculptureConfig, WallId } from '@core/entities/artwork.entity'

type ArtType = 'painting' | 'sculpture'

const WALLS: WallId[] = ['north', 'south', 'east', 'west', 'center-north', 'center-south']

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'artwork'
}

interface Props {
  initial?: ArtworkConfig
  onSave: (a: ArtworkConfig) => void
  onCancel: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="form-input" {...props} />
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="form-textarea" rows={3} {...props} />
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  )
}

export function ArtworkForm({ initial, onSave, onCancel }: Props) {
  const { t } = useTranslate()
  const [type, setType] = useState<ArtType>(initial?.type === 'sculpture' ? 'sculpture' : 'painting')

  const p = initial as PaintingConfig | undefined
  const s = initial as SculptureConfig | undefined

  const [title, setTitle] = useState(initial?.title ?? '')
  const [artist, setArtist] = useState(initial?.artist ?? '')
  const [year, setYear] = useState(initial?.year ?? String(new Date().getFullYear()))
  const [medium, setMedium] = useState(initial?.medium ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [dimensions, setDimensions] = useState(initial?.dimensions ?? '')
  const [price, setPrice] = useState(initial?.price ?? '')

  // Painting fields
  const [wall, setWall] = useState<WallId>(p?.wall ?? 'north')
  const [offset, setOffset] = useState(String(p?.offset ?? 0))
  const [width, setWidth] = useState(String(p?.width ?? 1.0))
  const [height, setHeight] = useState(String(p?.height ?? 0.8))
  const [image, setImage] = useState(p?.image ?? '')

  // Sculpture fields
  const [posX, setPosX] = useState(String(s?.position?.[0] ?? 0))
  const [posZ, setPosZ] = useState(String(s?.position?.[1] ?? 0))
  const [shape, setShape] = useState<'knot' | 'monolith' | 'spheres'>(s?.shape ?? 'knot')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const base = {
      id: initial?.id ?? slugify(title),
      title,
      artist,
      year,
      medium,
      description,
      dimensions: dimensions || undefined,
      price: price || undefined,
    }
    const artwork: ArtworkConfig = type === 'painting'
      ? {
          ...base,
          type: 'painting' as const,
          wall,
          offset: parseFloat(offset) || 0,
          width: parseFloat(width) || 1,
          height: parseFloat(height) || 0.8,
          image: image || undefined,
          procedural: image ? undefined : { style: 'color-field', seed: Math.floor(Math.random() * 999) },
        }
      : {
          ...base,
          type: 'sculpture' as const,
          position: [parseFloat(posX) || 0, parseFloat(posZ) || 0] as [number, number],
          shape,
          material: { color: '#b7885a', metalness: 0.8, roughness: 0.3 },
          plinth: { width: 0.7, height: 0.9 },
        }
    onSave(artwork)
  }

  return (
    <form className="artwork-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <button type="button" className={`type-btn ${type === 'painting' ? 'active' : ''}`} onClick={() => setType('painting')}>{t('manage.painting')}</button>
        <button type="button" className={`type-btn ${type === 'sculpture' ? 'active' : ''}`} onClick={() => setType('sculpture')}>{t('manage.sculpture')}</button>
      </div>

      <Field label={t('manage.fields.title')}><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></Field>
      <Field label={t('manage.fields.artist')}><Input value={artist} onChange={(e) => setArtist(e.target.value)} required /></Field>
      <div className="form-row-2">
        <Field label={t('manage.fields.year')}><Input value={year} onChange={(e) => setYear(e.target.value)} /></Field>
        <Field label={t('manage.fields.medium')}><Input value={medium} onChange={(e) => setMedium(e.target.value)} required /></Field>
      </div>
      <Field label={t('manage.fields.description')}><Textarea value={description} onChange={(e) => setDescription(e.target.value)} required /></Field>
      <div className="form-row-2">
        <Field label={t('manage.fields.dimensions')}><Input value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="120 × 90 cm" /></Field>
        <Field label={t('manage.fields.price')}><Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Available" /></Field>
      </div>

      {type === 'painting' ? (
        <>
          <Field label={t('manage.fields.wall')}>
            <Select value={wall} onChange={(v) => setWall(v as WallId)}>
              {WALLS.map((w) => <option key={w} value={w}>{t(`manage.walls.${w}`)}</option>)}
            </Select>
          </Field>
          <div className="form-row-3">
            <Field label={t('manage.fields.offset')}><Input type="number" step="0.1" value={offset} onChange={(e) => setOffset(e.target.value)} /></Field>
            <Field label={t('manage.fields.width')}><Input type="number" step="0.1" min="0.1" value={width} onChange={(e) => setWidth(e.target.value)} /></Field>
            <Field label={t('manage.fields.height')}><Input type="number" step="0.1" min="0.1" value={height} onChange={(e) => setHeight(e.target.value)} /></Field>
          </div>
          <Field label={t('manage.fields.image')}><Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="art/my-piece.jpg" /></Field>
        </>
      ) : (
        <>
          <div className="form-row-2">
            <Field label={t('manage.fields.posX')}><Input type="number" step="0.1" value={posX} onChange={(e) => setPosX(e.target.value)} /></Field>
            <Field label={t('manage.fields.posZ')}><Input type="number" step="0.1" value={posZ} onChange={(e) => setPosZ(e.target.value)} /></Field>
          </div>
          <Field label={t('manage.fields.shape')}>
            <Select value={shape} onChange={(v) => setShape(v as typeof shape)}>
              {(['knot', 'monolith', 'spheres'] as const).map((sh) => <option key={sh} value={sh}>{t(`manage.shapes.${sh}`)}</option>)}
            </Select>
          </Field>
        </>
      )}

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>{t('manage.actions.cancel')}</button>
        <button type="submit" className="btn-save">{t('manage.actions.save')}</button>
      </div>
    </form>
  )
}
