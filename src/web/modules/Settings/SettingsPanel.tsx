import { useTranslate, type Language } from '@common/hooks/useTranslate'

const LANGUAGES: { value: Language; flag: string }[] = [
  { value: 'en', flag: '🇬🇧' },
  { value: 'fr', flag: '🇫🇷' },
  { value: 'ar', flag: '🇸🇦' },
  { value: 'es', flag: '🇪🇸' },
]

export function SettingsPanel() {
  const { t, currentLanguage, changeLanguage } = useTranslate()

  return (
    <div className="settings-panel">
      <h2>{t('settings.title')}</h2>

      <div className="settings-field">
        <label className="settings-label">{t('settings.language')}</label>
        <div className="lang-grid">
          {LANGUAGES.map(({ value, flag }) => (
            <button
              key={value}
              className={`lang-btn ${currentLanguage === value ? 'active' : ''}`}
              onClick={() => changeLanguage(value)}
              aria-pressed={currentLanguage === value}
            >
              <span className="lang-flag">{flag}</span>
              <span className="lang-name">{t(`settings.languages.${value}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
