import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('Service worker registration failed:', error)
    },
  })

  if (!needRefresh) return null

  const handleUpdate = () => {
    updateServiceWorker(true)
  }

  const handleDismiss = () => {
    setNeedRefresh(false)
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-[70] animate-fade-slide md:left-24 md:right-auto md:max-w-sm xl:left-64 safe-top">
      <div className="clay-surface rounded-3xl p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl clay-accent flex items-center justify-center">
          <RefreshCw size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-dark">Update available</p>
          <p className="text-xs text-gray500">A new version of Mario POS is ready</p>
        </div>
        <button
          onClick={handleUpdate}
          className="flex-shrink-0 bg-primary text-white text-xs font-bold rounded-xl px-3 py-2 active:scale-90 transition-transform"
        >
          Update
        </button>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray400 p-1 active:scale-90 transition-transform"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
