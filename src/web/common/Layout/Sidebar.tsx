import { useState } from 'react'
import { useTranslate } from '@common/hooks/useTranslate'
import { SettingsPanel } from '@modules/Settings/SettingsPanel'
import './sidebar.css'

type ActiveSection = 'settings' | null

function IconPalette({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  )
}

function IconSettings({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconMenu({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { t } = useTranslate()
  const [active, setActive] = useState<ActiveSection>(null)

  const toggle = (section: ActiveSection) => {
    if (collapsed) {
      onToggleCollapse()
      setActive(section)
    } else {
      setActive((prev) => (prev === section ? null : section))
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={() => { if (collapsed) onToggleCollapse() }} style={{ cursor: collapsed ? 'pointer' : 'default' }}>
          <IconPalette size={22} />
          <span className="sidebar-logo-name">Virtual Expo</span>
        </div>
        {!collapsed && (
          <button className="sidebar-toggle" onClick={onToggleCollapse} title="Collapse sidebar">
            <IconMenu size={16} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-btn ${active === 'settings' && !collapsed ? 'active' : ''}`}
          onClick={() => toggle('settings')}
          title={t('nav.settings')}
        >
          <IconSettings size={18} />
          <span className="sidebar-nav-label">{t('nav.settings')}</span>
        </button>
      </nav>

      {!collapsed && active === 'settings' && (
        <div className="sidebar-panel">
          <SettingsPanel />
        </div>
      )}
    </aside>
  )
}
