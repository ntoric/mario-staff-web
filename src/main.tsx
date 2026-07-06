import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PwaRoot } from './components/PwaRoot'
import { applyTheme, getThemeById, DEFAULT_THEME_ID } from './lib/theme'
import './index.css'

const storedTheme = localStorage.getItem('theme_pref') ?? DEFAULT_THEME_ID
applyTheme(getThemeById(storedTheme))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PwaRoot>
      <App />
    </PwaRoot>
  </React.StrictMode>,
)
