import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import './common/translations/i18n'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
