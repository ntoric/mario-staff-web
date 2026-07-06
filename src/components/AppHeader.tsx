import { StorePickerButton } from './StorePicker'
import { useAuthStore } from '../stores/authStore'
import { APP_LOGO, APP_NAME } from '../lib/constants'
import type { ReactNode } from 'react'

export function AppHeader({
  title,
  subtitle,
  showStorePicker = true,
  showLogo = true,
  rightAction,
}: {
  title: string
  subtitle?: string
  showStorePicker?: boolean
  showLogo?: boolean
  rightAction?: ReactNode
}) {
  const { currentStore } = useAuthStore()

  const storeLabel = currentStore
    ? currentStore.branch
      ? `${currentStore.name} - ${currentStore.branch}`
      : currentStore.name
    : undefined

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md safe-top">
      <div className="h-[72px] w-full px-4 md:pl-24 xl:pl-[272px] flex items-center gap-3">
        {showLogo && (
          <div className="w-12 h-12 clay-surface rounded-2xl overflow-hidden shrink-0 hidden sm:block">
            <img src={APP_LOGO} alt={APP_NAME} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-extrabold text-dark truncate tracking-tight">{title}</h1>
          {(subtitle ?? storeLabel) && (
            <p className="text-[13px] text-gray500 mt-0.5 truncate">{subtitle ?? storeLabel}</p>
          )}
        </div>
        {rightAction}
        {showStorePicker && <StorePickerButton />}
      </div>
    </header>
  )
}

export function OverlayHeader({
  title,
  subtitle,
  onBack,
  rightAction,
}: {
  title: string
  subtitle?: string
  onBack: () => void
  rightAction?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md safe-top">
      <div className="h-[72px] px-4 flex items-center gap-3 max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="w-12 h-12 clay-surface rounded-2xl flex items-center justify-center shrink-0 active:scale-95 transition-transform"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray600">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-dark truncate">{title}</h1>
          {subtitle && <p className="text-xs text-gray500 truncate">{subtitle}</p>}
        </div>
        {rightAction}
      </div>
    </header>
  )
}
