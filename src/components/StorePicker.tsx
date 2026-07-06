import { Store as StoreIcon, CheckCircle, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { Store } from '../types'

export function StorePickerButton({ onStoreChanged }: { onStoreChanged?: () => void }) {
  const { user, currentStore, switchStore } = useAuthStore()
  const { loadStoreData } = useDataStore()
  const [open, setOpen] = useState(false)
  const stores = user?.stores ?? []

  if (stores.length <= 1) return null

  const handleSelect = async (store: Store) => {
    setOpen(false)
    await switchStore(store)
    await loadStoreData(store.id)
    onStoreChanged?.()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-12 h-12 clay-surface rounded-2xl flex items-center justify-center active:scale-95 transition-transform shrink-0"
      >
        <StoreIcon size={22} className="text-primary" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/30 p-4 md:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="clay-surface rounded-[32px] w-full max-w-md pb-6 animate-fade-slide max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-[42px] h-1.5 bg-gray400/70 rounded-full" />
            </div>
            <div className="flex items-start justify-between px-5 pb-2">
              <div>
                <h3 className="text-[22px] font-extrabold text-dark tracking-tight">Switch Store</h3>
                <p className="text-sm text-gray500 mt-1">Select a storefront to manage</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 -mr-1">
                <X size={22} className="text-gray500" />
              </button>
            </div>
            <div className="px-4 pt-2 space-y-3">
              {stores.map((store) => {
                const isCurrent = currentStore?.id === store.id
                return (
                  <button
                    key={store.id}
                    onClick={() => !isCurrent && handleSelect(store)}
                    disabled={isCurrent}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-3xl transition-all text-left ${
                      isCurrent ? 'clay-accent' : 'clay-surface hover:opacity-90'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isCurrent ? 'bg-primary' : 'clay-inset'
                      }`}
                    >
                      {isCurrent ? (
                        <CheckCircle size={22} className="text-white" />
                      ) : (
                        <StoreIcon size={22} className="text-gray500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[15px] text-dark truncate">
                        {store.branch ? `${store.name} - ${store.branch}` : store.name}
                      </p>
                      <p
                        className={`text-xs font-semibold ${
                          store.isActive ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {store.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="px-2.5 py-1 clay-accent rounded-xl text-[11px] font-bold text-primary shrink-0">
                        Current
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
