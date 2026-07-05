import { useEffect } from 'react'
import { Receipt, Edit3, FileText, Package } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { FadeSlideIn, StaggeredAnimation, ShimmerBox } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { formatCurrency, formatDate } from '../lib/constants'
import type { Order } from '../types'

export function Orders({
  onEditOrder,
  onGenerateBill,
}: {
  onEditOrder: (order: Order) => void
  onGenerateBill: (order: Order) => void
}) {
  const { currentStore } = useAuthStore()
  const { getActiveOrders, isLoading, loadStoreData } = useDataStore()

  useEffect(() => {
    if (currentStore) {
      loadStoreData(currentStore.id)
    }
  }, [currentStore?.id])

  const activeOrders = getActiveOrders()

  return (
    <div>
      <AppHeader title="Active Orders" />
      <div className="px-5 py-5 max-w-5xl mx-auto lg:ml-64 lg:px-8">
        <FadeSlideIn>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerBox key={i} className="h-24" />
              ))}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-20">
              <Receipt size={48} className="mx-auto text-gray300" />
              <p className="text-gray400 text-sm mt-4">No active orders</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeOrders.map((order, index) => {
                const isParcel = order.orderType === 'parcel'
                const totalItems = order.items?.reduce((sum, oi) => sum + oi.quantity, 0) ?? 0
                return (
                  <StaggeredAnimation key={order.id} index={index}>
                    <div className="bg-white rounded-2xl card-shadow p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isParcel ? (
                            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                              <Package size={20} className="text-warningDark" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-extraLight flex items-center justify-center">
                              <Receipt size={20} className="text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-dark text-sm">
                              {isParcel ? 'Parcel Order' : `Table ${order.tableNumber}`}
                            </p>
                            <p className="text-xs text-gray400">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        <span className="text-lg font-extrabold text-primary">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-gray100 rounded-lg text-xs font-bold text-gray600">
                          {totalItems} item{totalItems !== 1 ? 's' : ''}
                        </span>
                        {order.items?.slice(0, 3).map((oi) => (
                          <span key={oi.itemId} className="text-xs text-gray500 truncate">
                            {oi.item.name} ×{oi.quantity}
                          </span>
                        ))}
                        {order.items && order.items.length > 3 && (
                          <span className="text-xs text-gray400">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditOrder(order)}
                          className="flex-1 h-10 bg-gray100 rounded-xl font-bold text-sm text-gray700 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => onGenerateBill(order)}
                          className="flex-1 h-10 bg-success text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                          <FileText size={16} />
                          Bill
                        </button>
                      </div>
                    </div>
                  </StaggeredAnimation>
                )
              })}
            </div>
          )}
        </FadeSlideIn>
      </div>
    </div>
  )
}
