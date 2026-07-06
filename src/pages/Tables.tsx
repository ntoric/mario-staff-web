import { useEffect } from 'react'
import { UtensilsCrossed, Users, ShoppingBag } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { OrderTimer } from '../components/OrderTimer'
import { FadeSlideIn, StaggeredAnimation, ShimmerBox } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { formatCurrency } from '../lib/constants'
import type { TableModel, Order } from '../types'

function TableCard({
  table,
  order,
  onClick,
}: {
  table: TableModel
  order?: Order
  onClick: () => void
}) {
  const occupied = !!order
  const totalItems = order?.items?.reduce((sum, oi) => sum + oi.quantity, 0) ?? 0

  return (
    <div className="w-full min-w-0 aspect-[3/4] md:aspect-[10/11]">
      <button
        onClick={onClick}
        className={`w-full h-full rounded-[28px] flex flex-col items-center px-3 py-3.5 tilt-press overflow-hidden ${
          occupied
            ? 'table-card-occupied text-white'
            : 'surface-table-available text-dark'
        }`}
      >
        {/* Top: icon + title */}
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`w-[54px] h-[54px] rounded-full flex items-center justify-center shrink-0 ${
              occupied ? 'bg-white/18 shadow-[2px_3px_6px_rgba(0,0,0,0.18)]' : 'table-icon-available'
            }`}
          >
            <UtensilsCrossed
              size={22}
              className={occupied ? 'text-white' : 'text-gray500'}
            />
          </div>
          <p
            className={`font-bold text-base mt-2 text-center leading-tight ${
              occupied ? 'text-white' : 'text-dark'
            }`}
          >
            Table {table.number}
          </p>
        </div>

        {/* Middle: metadata */}
        <div className="flex flex-col items-center justify-center flex-1 w-full min-h-0 py-1">
          {occupied ? (
            <div className="flex items-center gap-1 text-white/90">
              <ShoppingBag size={12} strokeWidth={2.5} />
              <span className="text-xs font-semibold">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray600">
              <Users size={12} strokeWidth={2.5} />
              <span className="text-xs font-semibold">{table.seats} seats</span>
            </div>
          )}
        </div>

        {/* Bottom: amount / status + timer */}
        <div className="flex flex-col items-center shrink-0 gap-0.5 min-h-[40px] justify-end">
          {occupied ? (
            <>
              <span className="text-white font-bold text-sm leading-none">
                {formatCurrency(order.totalAmount)}
              </span>
              {order.createdAt && (
                <OrderTimer createdAt={order.createdAt} light />
              )}
            </>
          ) : (
            <span className="text-xs font-bold text-success">Available</span>
          )}
        </div>
      </button>
    </div>
  )
}

export function Tables({
  onOpenOrder,
}: {
  onOpenOrder: (tableId: string, tableNumber: number, existingOrder?: Order) => void
}) {
  const { currentStore } = useAuthStore()
  const { tables, isLoading, loadStoreData, getTableOrders } = useDataStore()

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
    <div className="min-h-full">
      <AppHeader
        title="Tables"
        showLogo={false}
        subtitle={
          currentStore?.branch
            ? `${currentStore.name} - ${currentStore.branch}`
            : currentStore?.name
        }
      />

      <div className="px-4 pt-2 pb-28 md:ml-20 md:pb-6 xl:ml-60 xl:px-8 max-w-6xl">
        <FadeSlideIn>
          <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[14px]">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ShimmerBox key={i} className="aspect-[3/4] md:aspect-[10/11] rounded-[28px]" />
              ))
            ) : tables.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="empty-state-icon mb-4">
                  <UtensilsCrossed size={40} className="text-gray400" />
                </div>
                <p className="text-gray500 text-sm font-medium">No tables found for this store</p>
              </div>
            ) : (
              tables.map((table, index) => {
                const order = getTableOrders(table.id)[0]
                return (
                  <StaggeredAnimation key={table.id} index={index} className="min-w-0">
                    <TableCard
                      table={table}
                      order={order}
                      onClick={() => handleTableClick(table)}
                    />
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
