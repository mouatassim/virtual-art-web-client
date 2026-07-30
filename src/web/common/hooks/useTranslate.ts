import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export type Language = 'en' | 'fr' | 'ar' | 'es'

const RTL_LANGUAGES: Language[] = ['ar']

export function useTranslate() {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language as Language

  const changeLanguage = (lang: Language) => i18n.changeLanguage(lang)

  useEffect(() => {
    const dir = RTL_LANGUAGES.includes(currentLanguage) ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', currentLanguage)
  }, [currentLanguage])

  return { t, currentLanguage, changeLanguage }
}
