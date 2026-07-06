import { useState, type FormEvent } from 'react'
import { User as UserIcon, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { APP_LOGO, APP_NAME } from '../lib/constants'

export function Login() {
  const { login, isLoading, error } = useAuthStore()
  const { loadStoreData } = useDataStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [obscurePassword, setObscurePassword] = useState(true)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    const success = await login(username.trim(), password)
    if (success) {
      const auth = useAuthStore.getState()
      if (auth.currentStore) {
        await loadStoreData(auth.currentStore.id)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center safe-top px-4 sm:px-6">
      <div className="w-full max-w-[440px] px-4">
        <div className="flex flex-col items-center">
          <div className="w-[82px] h-[82px] clay-surface rounded-3xl overflow-hidden">
            <img src={APP_LOGO} alt={APP_NAME} className="w-full h-full object-cover" />
          </div>
          <h1 className="mt-6 text-[28px] font-extrabold text-dark tracking-tight">Welcome Back</h1>
          <p className="mt-1.5 text-[15px] text-gray500">Sign in to Mario POS</p>
        </div>

        <div className="mt-8 clay-surface rounded-[32px] p-6">
          {error && (
            <div className="mb-4 p-3.5 clay-inset rounded-2xl border border-danger/20 flex items-center gap-2.5">
              <AlertCircle size={20} className="text-danger shrink-0" />
              <p className="text-danger text-[13px] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="relative clay-inset rounded-2xl">
              <UserIcon
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray500"
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent rounded-2xl px-4 py-4 pl-12 text-sm text-gray800 placeholder-gray500 outline-none"
              />
            </div>

            <div className="relative clay-inset rounded-2xl">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray500"
              />
              <input
                type={obscurePassword ? 'password' : 'text'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent rounded-2xl px-4 py-4 pl-12 pr-12 text-sm text-gray800 placeholder-gray500 outline-none"
              />
              <button
                type="button"
                onClick={() => setObscurePassword(!obscurePassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray500"
              >
                {obscurePassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary mt-2 h-[58px] rounded-[22px] flex items-center justify-center text-base"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="h-12" />
      </div>
    </div>
  )
}
