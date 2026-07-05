import { useEffect, useState } from 'react'
import { LogOut, Lock, RefreshCw, Info, ChevronRight, User as UserIcon, Shield, Download } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { FadeSlideIn, StaggeredAnimation } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { api } from '../lib/api'
import { APP_NAME, APP_VERSION } from '../lib/constants'

export function Settings({ onLogout }: { onLogout: () => void }) {
  const { user, currentStore, changePassword, refreshUser } = useAuthStore()
  const { loadStoreData, loadStats } = useDataStore()
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

  return (
    <div>
      <AppHeader title="Settings" />
      <div className="px-5 py-5 max-w-5xl mx-auto lg:ml-64 lg:px-8">
        <FadeSlideIn>
          <StaggeredAnimation index={0}>
            <div className="bg-white rounded-2xl card-shadow p-5 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
                  <span className="text-white font-extrabold text-xl">
                    {user?.username?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-dark">{user?.username}</p>
                  <p className="text-sm text-gray500">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary-extraLight rounded-lg text-xs font-bold text-primary">
                    <Shield size={12} />
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </StaggeredAnimation>

          <StaggeredAnimation index={1}>
            <div className="bg-white rounded-2xl card-shadow overflow-hidden mb-4">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full px-5 py-4 flex items-center gap-3 border-b border-gray100"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-extraLight flex items-center justify-center">
                  <Lock size={20} className="text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-dark text-sm">Change Password</p>
                  <p className="text-xs text-gray400">Update your account password</p>
                </div>
                <ChevronRight size={20} className="text-gray300" />
              </button>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full px-5 py-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <RefreshCw size={20} className={`text-accent ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-dark text-sm">Refresh Data</p>
                  <p className="text-xs text-gray400">Reload all store data</p>
                </div>
                <ChevronRight size={20} className="text-gray300" />
              </button>
            </div>
          </StaggeredAnimation>

          <StaggeredAnimation index={2}>
            <div className="bg-white rounded-2xl card-shadow p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Info size={18} className="text-gray400" />
                <h3 className="font-extrabold text-dark text-sm">About</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray500">App Name</span>
                  <span className="font-bold text-dark">{APP_NAME}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray500">Version</span>
                  <span className="font-bold text-dark">{APP_VERSION}</span>
                </div>
                {currentStore && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray500">Current Store</span>
                    <span className="font-bold text-dark">
                      {currentStore.branch ? `${currentStore.name} - ${currentStore.branch}` : currentStore.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </StaggeredAnimation>

          <StaggeredAnimation index={3}>
            <button
              onClick={onLogout}
              className="w-full bg-white rounded-2xl card-shadow p-4 flex items-center gap-3 active:scale-95 transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
                <LogOut size={20} className="text-danger" />
              </div>
              <span className="font-bold text-danger text-sm">Logout</span>
            </button>
          </StaggeredAnimation>
        </FadeSlideIn>
      </div>

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md pb-8 sm:pb-6 animate-fade-slide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray300 rounded-full" />
            </div>
            <div className="px-5 pb-4">
              <h3 className="text-lg font-extrabold text-dark">Change Password</h3>
            </div>
            <div className="px-5 space-y-3">
              {pwdError && (
                <div className="p-3 bg-danger/8 rounded-xl border border-danger/20 text-danger text-sm font-medium">
                  {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="p-3 bg-success/8 rounded-xl border border-success/20 text-success text-sm font-medium">
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
