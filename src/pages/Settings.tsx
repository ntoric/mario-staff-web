import { useEffect, useState } from 'react'
import { LogOut, Lock, RefreshCw, Info, ChevronRight, Shield, Check } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { BentoGrid, BentoTile } from '../components/BentoGrid'
import { FadeSlideIn, StaggeredAnimation } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { useThemeStore } from '../stores/themeStore'
import { THEME_OPTIONS } from '../lib/theme'
import { APP_NAME, APP_VERSION } from '../lib/constants'

export function Settings({ onLogout }: { onLogout: () => void }) {
  const { user, currentStore, changePassword, refreshUser } = useAuthStore()
  const { loadStoreData, loadStats } = useDataStore()
  const { themeId, setTheme } = useThemeStore()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleChangePassword = async () => {
    setPwdError(null)
    setPwdSuccess(false)
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError('All fields are required')
      return
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New passwords do not match')
      return
    }
    if (newPwd.length < 6) {
      setPwdError('Password must be at least 6 characters')
      return
    }
    setIsChanging(true)
    const success = await changePassword(currentPwd, newPwd)
    setIsChanging(false)
    if (success) {
      setPwdSuccess(true)
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
      setTimeout(() => {
        setShowPasswordModal(false)
        setPwdSuccess(false)
      }, 1500)
    } else {
      setPwdError('Failed to change password')
    }
  }

  const handleRefresh = async () => {
    if (!currentStore) return
    setIsRefreshing(true)
    await Promise.all([
      loadStoreData(currentStore.id),
      refreshUser(),
      user?.role === 'superadmin' ? loadStats() : Promise.resolve(),
    ])
    setIsRefreshing(false)
  }

  const roleLabel = user?.role?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  const selectedTheme = THEME_OPTIONS.find((t) => t.id === themeId) ?? THEME_OPTIONS[0]
  const otherThemes = THEME_OPTIONS.filter((t) => t.id !== themeId)

  return (
    <div>
      <AppHeader title="Settings" showLogo={false} />
      <div className="page-content">
        <FadeSlideIn>
          <BentoGrid className="mb-2">
            <StaggeredAnimation index={0} className="contents">
              <BentoTile span="full" variant="dark" className="!min-h-[120px]">
                <div className="flex items-center gap-4 h-full">
                  <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-3xl bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-white font-extrabold text-2xl">
                      {user?.username?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-white text-lg truncate">{user?.username}</p>
                    <p className="text-sm text-white/60 truncate">{user?.email}</p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-primary/20 rounded-xl text-xs font-bold text-primary-light">
                      <Shield size={12} />
                      {roleLabel}
                    </span>
                    {currentStore && (
                      <p className="text-xs text-white/50 mt-1 truncate">
                        {currentStore.branch
                          ? `${currentStore.name} - ${currentStore.branch}`
                          : currentStore.name}
                      </p>
                    )}
                  </div>
                </div>
              </BentoTile>
            </StaggeredAnimation>

            <StaggeredAnimation index={1} className="contents">
              <BentoTile
                span="2x1"
                onClick={() => setShowPasswordModal(true)}
                className="bento-settings-password !min-h-[96px]"
              >
                <div className="flex items-center gap-3 h-full">
                  <div className="w-10 h-10 clay-accent rounded-2xl flex items-center justify-center shrink-0">
                    <Lock size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-dark text-sm">Change Password</p>
                    <p className="text-xs text-gray500 truncate">Update your account password</p>
                  </div>
                  <ChevronRight size={20} className="text-gray400 shrink-0" />
                </div>
              </BentoTile>
            </StaggeredAnimation>

            <StaggeredAnimation index={2} className="contents">
              <BentoTile
                span="1x1"
                onClick={handleRefresh}
                className="!min-h-[96px]"
              >
                <div className="flex flex-col justify-center h-full gap-2">
                  <div className="w-10 h-10 bg-info/10 rounded-2xl flex items-center justify-center">
                    <RefreshCw size={20} className={`text-info ${isRefreshing ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <p className="font-bold text-dark text-sm">Refresh</p>
                    <p className="text-[11px] text-gray500 leading-tight">Reload store data</p>
                  </div>
                </div>
              </BentoTile>
            </StaggeredAnimation>
          </BentoGrid>

          <p className="section-title mb-3 px-1 mt-5">Appearance</p>
          <BentoGrid className="mb-2">
            <StaggeredAnimation index={3} className="contents">
              <BentoTile
                span="2x2"
                variant="accent"
                onClick={() => setTheme(selectedTheme.id, user?.id)}
                className="ring-2 ring-primary/40 !min-h-[160px] md:!min-h-[88px] md:col-span-2 md:row-span-1"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full" style={{ background: selectedTheme.primary }} />
                  <div className="w-6 h-6 rounded-full" style={{ background: selectedTheme.primaryLight }} />
                  <div className="w-6 h-6 rounded-full border border-gray200/60" style={{ background: selectedTheme.background }} />
                </div>
                <p className="font-extrabold text-dark text-base">{selectedTheme.label}</p>
                <p className="text-xs text-gray500 mt-1">{selectedTheme.description}</p>
                <div className="mt-auto pt-3 flex items-center gap-1 text-primary text-xs font-bold">
                  <Check size={14} />
                  Active theme
                </div>
              </BentoTile>
            </StaggeredAnimation>

            {otherThemes.map((theme, i) => (
              <StaggeredAnimation key={theme.id} index={4 + i} className="contents">
                <BentoTile
                  span="1x1"
                  onClick={() => setTheme(theme.id, user?.id)}
                  className="!min-h-[88px]"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ background: theme.primary }} />
                    <div className="w-4 h-4 rounded-full" style={{ background: theme.primaryLight }} />
                  </div>
                  <p className="font-bold text-dark text-xs leading-tight">{theme.label}</p>
                </BentoTile>
              </StaggeredAnimation>
            ))}
          </BentoGrid>

          <p className="section-title mb-3 px-1 mt-5">About</p>
          <BentoGrid>
            <StaggeredAnimation index={8} className="contents">
              <BentoTile span="full" className="!min-h-0">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={18} className="text-gray500" />
                  <h3 className="font-extrabold text-dark text-sm">App Info</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bento-tile-inset !min-h-[64px] !p-3">
                    <p className="text-[10px] text-gray500 uppercase tracking-wide font-bold">App</p>
                    <p className="font-extrabold text-dark text-sm mt-1">{APP_NAME}</p>
                  </div>
                  <div className="bento-tile-inset !min-h-[64px] !p-3">
                    <p className="text-[10px] text-gray500 uppercase tracking-wide font-bold">Version</p>
                    <p className="font-extrabold text-dark text-sm mt-1">{APP_VERSION}</p>
                  </div>
                </div>
              </BentoTile>
            </StaggeredAnimation>

            <StaggeredAnimation index={9} className="contents">
              <BentoTile
                span="full"
                onClick={onLogout}
                className="!min-h-[72px] border border-danger/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-danger/10 rounded-2xl flex items-center justify-center">
                    <LogOut size={20} className="text-danger" />
                  </div>
                  <span className="font-bold text-danger text-sm">Logout</span>
                </div>
              </BentoTile>
            </StaggeredAnimation>
          </BentoGrid>
        </FadeSlideIn>
      </div>

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/30 p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="clay-surface rounded-[32px] w-full max-w-md pb-6 animate-fade-slide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-[42px] h-1.5 bg-gray400/70 rounded-full" />
            </div>
            <div className="px-5 pb-4">
              <h3 className="text-lg font-extrabold text-dark">Change Password</h3>
            </div>
            <div className="px-5 space-y-3">
              {pwdError && (
                <div className="p-3 clay-inset rounded-2xl border border-danger/20 text-danger text-sm font-medium">
                  {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="p-3 clay-inset rounded-2xl border border-success/20 text-success text-sm font-medium">
                  Password changed successfully!
                </div>
              )}
              <input
                type="password"
                placeholder="Current password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="input-field"
              />
              <button
                onClick={handleChangePassword}
                disabled={isChanging}
                className="w-full h-12 btn-primary flex items-center justify-center"
              >
                {isChanging ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
