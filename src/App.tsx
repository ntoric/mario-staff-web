import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from './stores/authStore'
import { useDataStore } from './stores/dataStore'
import { useThemeStore } from './stores/themeStore'
import { BottomNav, ALL_NAV_ITEMS, type NavItem } from './components/BottomNav'
import { Splash } from './pages/Splash'
import { Login } from './pages/Login'
import { Tables } from './pages/Tables'
import { Orders } from './pages/Orders'
import { OrderEditor } from './pages/OrderEditor'
import { History } from './pages/History'
import { Statistics } from './pages/Statistics'
import { Settings } from './pages/Settings'
import { Menu } from './pages/Menu'
import { ParcelOrder } from './pages/ParcelOrder'
import { Bill } from './pages/Bill'
import type { Order } from './types'

type PageId = 'tables' | 'orders' | 'history' | 'stats' | 'menu' | 'parcel' | 'settings'
type Overlay =
  | { type: 'orderEditor'; tableId: string; tableNumber: number; existingOrder?: Order }
  | { type: 'bill'; order: Order }
  | null

function canViewStats(role?: string) {
  return role === 'superadmin' || role === 'business_owner' || role === 'business_admin'
}

export default function App() {
  const { user, isAuthenticated, isInitialized, initialize, logout, currentStore } = useAuthStore()
  const { loadStoreData } = useDataStore()
  const { loadTheme } = useThemeStore()
  const [currentPage, setCurrentPage] = useState<PageId>('tables')
  const [overlay, setOverlay] = useState<Overlay>(null)

  const navItems: NavItem[] = useMemo(() => {
    return ALL_NAV_ITEMS.filter((item) => {
      if (item.id === 'stats') return canViewStats(user?.role)
      return true
    })
  }, [user?.role])

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    loadTheme(user?.id)
  }, [user?.id])

  useEffect(() => {
    if (isAuthenticated && currentStore) {
      loadStoreData(currentStore.id)
    }
  }, [isAuthenticated, currentStore?.id])

  if (!isInitialized) {
    return <Splash />
  }

  if (!isAuthenticated) {
    return <Login />
  }

  if (overlay) {
    switch (overlay.type) {
      case 'orderEditor':
        return (
          <OrderEditor
            tableId={overlay.tableId}
            tableNumber={overlay.tableNumber}
            existingOrder={overlay.existingOrder}
            onBack={() => setOverlay(null)}
            onGenerateBill={(order) => setOverlay({ type: 'bill', order })}
          />
        )
      case 'bill':
        return <Bill order={overlay.order} onBack={() => setOverlay(null)} />
    }
  }

  const currentIndex = navItems.findIndex((item) => item.id === currentPage)

  const handleTabChange = (index: number) => {
    setCurrentPage(navItems[index].id as PageId)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={currentPage === 'tables' ? '' : 'hidden'}>
        <Tables
          onOpenOrder={(tableId, tableNumber, existingOrder) =>
            setOverlay({ type: 'orderEditor', tableId, tableNumber, existingOrder })
          }
        />
      </div>
      <div className={currentPage === 'orders' ? '' : 'hidden'}>
        <Orders
          onEditOrder={(order) =>
            setOverlay({
              type: 'orderEditor',
              tableId: order.tableId,
              tableNumber: order.tableNumber,
              existingOrder: order,
            })
          }
          onGenerateBill={(order) => setOverlay({ type: 'bill', order })}
        />
      </div>
      <div className={currentPage === 'history' ? '' : 'hidden'}>
        <History />
      </div>
      <div className={currentPage === 'stats' ? '' : 'hidden'}>
        <Statistics />
      </div>
      <div className={currentPage === 'menu' ? '' : 'hidden'}>
        <Menu />
      </div>
      <div className={currentPage === 'parcel' ? '' : 'hidden'}>
        <ParcelOrder
          embedded
          onBack={() => setCurrentPage('tables')}
          onComplete={() => setCurrentPage('history')}
        />
      </div>
      <div className={currentPage === 'settings' ? '' : 'hidden'}>
        <Settings onLogout={() => logout()} />
      </div>

      <BottomNav navItems={navItems} currentIndex={Math.max(0, currentIndex)} onTabChange={handleTabChange} />
    </div>
  )
}
