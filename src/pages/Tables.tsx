import { useEffect, useState } from 'react'
import { Plus, Users, ShoppingBag, Package } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { FadeSlideIn, StaggeredAnimation, ShimmerBox } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { formatCurrency } from '../lib/constants'
import type { TableModel, Order } from '../types'

export function Tables({
  onOpenOrder,
  onParcelOrder,
}: {
  onOpenOrder: (tableId: string, tableNumber: number, existingOrder?: Order) => void
  onParcelOrder: () => void
}) {
  const { currentStore } = useAuthStore()
  const { tables, orders, isLoading, loadStoreData, getTableOrders } = useDataStore()

  useEffect(() => {
    if (currentStore) {
      loadStoreData(currentStore.id)
    }
  }, [currentStore?.id])

  const handleTableClick = (table: TableModel) => {
    const activeOrder = getTableOrders(table.id)[0]
    onOpenOrder(table.id, table.number, activeOrder)
  }

  return (
    <div>
      <AppHeader
        title="Tables"
        subtitle={currentStore?.branch ? `${currentStore.name} - ${currentStore.branch}` : currentStore?.name}
        rightAction={
          <button
            onClick={onParcelOrder}
            className="h-10 px-4 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 active:scale-95 transition-transform"
          >
            <Package size={18} />
            <span className="hidden sm:inline">Parcel</span>
          </button>
        }
      />

      <div className="px-5 py-5 max-w-5xl mx-auto lg:ml-64 lg:px-8">
        <FadeSlideIn>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ShimmerBox key={i} className="h-32" />
              ))
            ) : tables.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray400 text-sm">No tables found for this store</p>
              </div>
            ) : (
              tables.map((table, index) => {
                const tableOrders = getTableOrders(table.id)
                const hasActiveOrder = tableOrders.length > 0
                const order = tableOrders[0]
                const totalItems = order?.items?.reduce((sum, oi) => sum + oi.quantity, 0) ?? 0

                return (
                  <StaggeredAnimation key={table.id} index={index}>
                    <button
                      onClick={() => handleTableClick(table)}
                      className={`w-full h-32 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                        hasActiveOrder
                          ? 'gradient-primary text-white elevated-shadow'
                          : 'bg-white card-shadow text-dark'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          hasActiveOrder ? 'bg-white/20' : 'bg-primary-extraLight'
                        }`}
                      >
                        <span className={`font-extrabold text-xl ${hasActiveOrder ? 'text-white' : 'text-primary'}`}>
                          {table.number}
                        </span>
                      </div>
                      {hasActiveOrder ? (
                        <>
                          <div className="flex items-center gap-1.5 text-white/90">
                            <ShoppingBag size={14} />
                            <span className="text-xs font-bold">{totalItems} items</span>
                          </div>
                          <span className="text-white font-extrabold text-sm">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 text-gray400">
                            <Users size={14} />
                            <span className="text-xs font-medium">{table.seats} seats</span>
                          </div>
                          <span className="text-xs font-bold text-gray500">Available</span>
                        </>
                      )}
                    </button>
                  </StaggeredAnimation>
                )
              })
            )}
          </div>
        </FadeSlideIn>
      </div>
    </div>
  )
}
