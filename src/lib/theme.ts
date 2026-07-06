export interface ThemeOption {
  id: string
  label: string
  description: string
  primary: string
  primaryDark: string
  primaryLight: string
  primarySoft: string
  background: string
  backgroundSecondary: string
  cardColor: string
  accentTint: string
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'sunset',
    label: 'Sunset Orange',
    description: 'Warm orange and cream',
    primary: '#FF8A1F',
    primaryDark: '#E56F00',
    primaryLight: '#FFB86B',
    primarySoft: '#FFE6CC',
    background: '#F8F2EB',
    backgroundSecondary: '#F1E7DD',
    cardColor: '#FFFCF8',
    accentTint: '#FFD4AD',
  },
  {
    id: 'ocean',
    label: 'Ocean Blue',
    description: 'Cool blue and mist',
    primary: '#287DFF',
    primaryDark: '#155AD1',
    primaryLight: '#79B0FF',
    primarySoft: '#D9E8FF',
    background: '#F1F6FF',
    backgroundSecondary: '#E4ECF8',
    cardColor: '#FBFDFF',
    accentTint: '#D7E8FF',
  },
  {
    id: 'forest',
    label: 'Forest Green',
    description: 'Fresh green and sage',
    primary: '#2F9E68',
    primaryDark: '#23784E',
    primaryLight: '#7ED7AA',
    primarySoft: '#D7F3E4',
    background: '#F2F7F1',
    backgroundSecondary: '#E3EEE0',
    cardColor: '#FBFEFA',
    accentTint: '#D7EEDB',
  },
  {
    id: 'plum',
    label: 'Plum Purple',
    description: 'Deep plum and lavender',
    primary: '#8A56E8',
    primaryDark: '#6C3FC0',
    primaryLight: '#C29EFF',
    primarySoft: '#E9DDFF',
    background: '#F6F1FF',
    backgroundSecondary: '#ECE4F9',
    cardColor: '#FEFBFF',
    accentTint: '#E5D8FF',
  },
]

export const DEFAULT_THEME_ID = 'sunset'

export function getThemeById(id: string): ThemeOption {
  return THEME_OPTIONS.find((t) => t.id === id) ?? THEME_OPTIONS[0]
}

export function applyTheme(theme: ThemeOption) {
  const root = document.documentElement
  root.style.setProperty('--primary', theme.primary)
  root.style.setProperty('--primary-dark', theme.primaryDark)
  root.style.setProperty('--primary-light', theme.primaryLight)
  root.style.setProperty('--primary-soft', theme.primarySoft)
  root.style.setProperty('--background', theme.background)
  root.style.setProperty('--background-secondary', theme.backgroundSecondary)
  root.style.setProperty('--card-color', theme.cardColor)
  root.style.setProperty('--accent-tint', theme.accentTint)
  root.style.setProperty('--theme-color', theme.primary)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme.primary)
}

export function themeStorageKey(userId?: string) {
  return userId ? `theme_pref_user_${userId}` : 'theme_pref'
}
