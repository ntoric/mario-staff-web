import { useEffect, useState } from 'react'
import { APP_LOGO, APP_NAME } from '../lib/constants'

export function Splash({ status }: { status?: string }) {
  const [logoVisible, setLogoVisible] = useState(false)
  const [textVisible, setTextVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 100)
    const t2 = setTimeout(() => setTextVisible(true), 500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div
          className={`transition-all duration-500 ease-out ${
            logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="w-[100px] h-[100px] clay-surface rounded-3xl overflow-hidden">
            <img src={APP_LOGO} alt={APP_NAME} className="w-full h-full object-cover" />
          </div>
        </div>
        <div
          className={`mt-7 flex flex-col items-center transition-all duration-350 ease-out ${
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <h1 className="text-dark text-[28px] font-extrabold tracking-tight">Mario POS</h1>
          <p className="text-gray500 text-sm font-normal mt-2">
            {status ?? 'Loading...'}
          </p>
          <div className="mt-8">
            {!status && (
              <div className="w-8 h-8 border-2 border-primary-light/40 border-t-primary-light rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
