import { useEffect, useState } from 'react'
import { useAuthStore } from './stores/authStore'
import { useDataStore } from './stores/dataStore'
import { BottomNav } from './components/BottomNav'
import { Splash } from './pages/Splash'
import { Login } from './pages/Login'
import { Tables } from './pages/Tables'
import { Orders } from './pages/Orders'
import { OrderEditor } from './pages/OrderEditor'
import { History } from './pages/History'
import { Statistics } from './pages/Statistics'
import { Settings } from './pages/Settings'
import { ParcelOrder } from './pages/ParcelOrder'
import { Bill } from './pages/Bill'
import type { Order } from './types'

type Page = 'tables' | 'orders' | 'history' | 'stats' | 'settings'
type Overlay =
  | { type: 'orderEditor'; tableId: string; tableNumber: number; existingOrder?: Order }
  | { type: 'parcelOrder' }
  | { type: 'bill'; order: Order }
  | null

export default function App() {
  const { isAuthenticated, isInitialized, initialize, logout, currentStore } = useAuthStore()
  const { loadStoreData } = useDataStore()
  const [currentPage, setCurrentPage] = useState<Page>('tables')
  const [overlay, setOverlay] = useState<Overlay>(null)

  useEffect(() => {
    initialize()
  }, [])

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
      case 'parcelOrder':
        return <ParcelOrder onBack={() => setOverlay(null)} />
      case 'bill':
        return <Bill order={overlay.order} onBack={() => setOverlay(null)} />
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const navIndex = ['tables', 'orders', 'history', 'stats', 'settings'].indexOf(currentPage)

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {currentPage === 'tables' && (
        <Tables
          onOpenOrder={(tableId, tableNumber, existingOrder) =>
            setOverlay({ type: 'orderEditor', tableId, tableNumber, existingOrder })
          }
          onParcelOrder={() => setOverlay({ type: 'parcelOrder' })}
        />
      )}
      {currentPage === 'orders' && (
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
      )}
      {currentPage === 'history' && <History />}
      {currentPage === 'stats' && <Statistics />}
      {currentPage === 'settings' && <Settings onLogout={handleLogout} />}

      <BottomNav
        currentIndex={navIndex}
        onTabChange={(index) => setCurrentPage(['tables', 'orders', 'history', 'stats', 'settings'][index] as Page)}
      />
    </div>
  )
}
