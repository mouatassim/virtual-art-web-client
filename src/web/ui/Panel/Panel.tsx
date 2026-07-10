import './panel.css'

interface PanelProps {
  dark?: boolean
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export function Panel({ dark, className = '', children, style }: PanelProps) {
  return (
    <div className={['panel', dark ? 'panel--dark' : '', className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  )
}
