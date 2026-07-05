import { InstallPrompt } from './InstallPrompt'
import { OfflineBanner } from './OfflineBanner'
import { UpdatePrompt } from './UpdatePrompt'

export function PwaRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <OfflineBanner />
      <InstallPrompt />
      <UpdatePrompt />
    </>
  )
}
