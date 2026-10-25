import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { applyTheme, type ThemeKey, THEMES } from './lib/themes'
import { registerServiceWorker, preloadMascots } from './lib/pwa'
import { useGameStore } from './store/useGameStore'

const savedTheme = (localStorage.getItem('tts_quest_theme') as ThemeKey) || 'obsidian'
applyTheme(THEMES[savedTheme] ? savedTheme : 'obsidian')

if (typeof window !== 'undefined') {
  (window as unknown as { __gameStore: typeof useGameStore }).__gameStore = useGameStore
}

// Initialize Offline PWA & Background Asset Preloading
registerServiceWorker()
preloadMascots()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


