import { create } from 'zustand'
import { applyTheme, DEFAULT_THEME_ID, getThemeById, themeStorageKey, type ThemeOption } from '../lib/theme'

interface ThemeState {
  themeId: string
  theme: ThemeOption
  setTheme: (id: string, userId?: string) => void
  loadTheme: (userId?: string) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeId: DEFAULT_THEME_ID,
  theme: getThemeById(DEFAULT_THEME_ID),

  setTheme: (id, userId) => {
    const theme = getThemeById(id)
    applyTheme(theme)
    localStorage.setItem(themeStorageKey(userId), id)
    set({ themeId: id, theme })
  },

  loadTheme: (userId) => {
    const stored = localStorage.getItem(themeStorageKey(userId)) ?? DEFAULT_THEME_ID
    const theme = getThemeById(stored)
    applyTheme(theme)
    set({ themeId: stored, theme })
  },
}))
