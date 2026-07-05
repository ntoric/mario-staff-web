import { StorePickerButton } from './StorePicker'
import { useAuthStore } from '../stores/authStore'
import { APP_NAME } from '../lib/constants'
import type { ReactNode } from 'react'

export function AppHeader({
  title,
  subtitle,
  showStorePicker = true,
  rightAction,
}: {
  title: string
  subtitle?: string
  showStorePicker?: boolean
  rightAction?: ReactNode
}) {
  const { currentStore } = useAuthStore()

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray200 safe-top">
      <div className="px-5 py-4 flex items-center gap-3 max-w-5xl mx-auto lg:ml-64 lg:px-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold text-dark truncate">{title}</h1>
          {subtitle ? (
            <p className="text-xs text-gray500 mt-0.5 truncate">{subtitle}</p>
          ) : currentStore ? (
            <p className="text-xs text-gray500 mt-0.5 truncate">
              {currentStore.branch ? `${currentStore.name} - ${currentStore.branch}` : currentStore.name}
            </p>
          ) : null}
        </div>
        {rightAction}
        {showStorePicker && <StorePickerButton />}
      </div>
    </header>
  )
}
