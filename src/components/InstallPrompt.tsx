import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { canInstallPwa, isIOS } from '../lib/pwa'
import { APP_LOGO, APP_NAME } from '../lib/constants'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSAL_KEY = 'pwa-install-dismissed'
const DISMISSAL_DURATION = 7 * 24 * 60 * 60 * 1000

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!canInstallPwa()) return

    const dismissed = localStorage.getItem(DISMISSAL_KEY)
    if (dismissed) {
      const dismissedAt = Number(dismissed)
      if (Date.now() - dismissedAt < DISMISSAL_DURATION) return
    }

    if (isIOS()) {
      const timer = setTimeout(() => {
        setShowIosHint(true)
        setVisible(true)
      }, 3000)
      return () => clearTimeout(timer)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'dismissed') {
      localStorage.setItem(DISMISSAL_KEY, String(Date.now()))
    }
    setDeferredPrompt(null)
    setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSAL_KEY, String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  if (showIosHint && isIOS()) {
    return (
      <div className="fixed bottom-24 left-4 right-4 z-50 animate-fade-slide md:bottom-4 md:left-24 md:right-auto md:max-w-sm xl:left-64">
        <div className="clay-surface rounded-3xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden">
              <img src={APP_LOGO} alt={APP_NAME} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-dark">Install Mario POS</p>
              <p className="text-xs text-gray500 mt-1">
                Tap <Share size={12} className="inline -mt-0.5" /> Share, then &quot;Add to Home Screen&quot;
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-gray400 p-1 active:scale-90 transition-transform"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-fade-slide md:bottom-4 md:left-24 md:right-auto md:max-w-sm xl:left-64">
      <div className="clay-surface rounded-3xl p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden">
          <img src={APP_LOGO} alt={APP_NAME} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-dark">Install Mario POS</p>
          <p className="text-xs text-gray500">Add to your home screen for quick access</p>
        </div>
        <button
          onClick={handleInstall}
          className="flex-shrink-0 bg-primary text-white rounded-xl p-2.5 active:scale-90 transition-transform"
          aria-label="Install"
        >
          <Download size={20} />
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
