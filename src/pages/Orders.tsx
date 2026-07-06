import { useEffect, useMemo, useState } from 'react'
import { Receipt, Edit3, FileText, ChevronDown, ChevronUp, ShoppingBag, DollarSign, Clock } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { OrderTimer } from '../components/OrderTimer'
import { BentoGrid, BentoTile, BentoStat } from '../components/BentoGrid'
import { FadeSlideIn, StaggeredAnimation, ShimmerBox } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { formatCurrency } from '../lib/constants'
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (currentStore) {
      loadStoreData(currentStore.id)
    }
  }, [currentStore?.id])

  const activeOrders = getActiveOrders()

  const { totalValue, oldestMinutes } = useMemo(() => {
    const total = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0)
    const now = Date.now()
    let oldest = 0
    for (const order of activeOrders) {
      if (order.createdAt) {
        const mins = Math.floor((now - new Date(order.createdAt).getTime()) / 60000)
        if (mins > oldest) oldest = mins
      }
    }
    return { totalValue: total, oldestMinutes: oldest }
  }, [activeOrders])

  return (
    <div>
      <AppHeader title="Active Orders" />
      <div className="page-content">
        <FadeSlideIn>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerBox key={i} className="h-24" />
              ))}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-20">
              <div className="empty-state-icon mb-4">
                <Receipt size={40} className="text-gray400" />
              </div>
              <p className="text-gray500 text-sm font-medium">No active orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              <BentoGrid cols={3} className="md:hidden mb-1">
                <BentoTile span="1x1" variant="accent">
                  <BentoStat
                    label="Active"
                    value={String(activeOrders.length)}
                    icon={ShoppingBag}
                    iconColor="var(--primary)"
                    iconBg="clay-accent"
                  />
                </BentoTile>
                <BentoTile span="1x1">
                  <BentoStat
                    label="Total"
                    value={formatCurrency(totalValue)}
                    icon={DollarSign}
                    iconColor="#00C896"
                    iconBg="bg-success/10"
                  />
                </BentoTile>
                <BentoTile span="1x1" variant="accent">
                  <BentoStat
                    label="Longest"
                    value={oldestMinutes > 0 ? `${oldestMinutes}m` : '—'}
                    icon={Clock}
                    iconColor="#FFB547"
                    iconBg="bg-warning/10"
                  />
                </BentoTile>
              </BentoGrid>

              {activeOrders.map((order, index) => {
                const isParcel = order.orderType === 'parcel'
                const isExpanded = expandedId === order.id
                const totalItems = order.items?.reduce((sum, oi) => sum + oi.quantity, 0) ?? 0
                return (
                  <StaggeredAnimation key={order.id} index={index}>
                    <div className="clay-surface rounded-[28px] overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="w-full p-4 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="px-3 py-1.5 clay-accent rounded-xl text-sm font-bold text-primary shrink-0">
                            {isParcel ? 'Parcel' : `T${order.tableNumber}`}
                          </span>
                          {order.createdAt && (
                            <span className="clay-inset px-2 py-1 rounded-lg shrink-0">
                              <OrderTimer createdAt={order.createdAt} />
                            </span>
                          )}
                          <span className="text-xs text-gray500 font-medium truncate">
                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[22px] font-extrabold text-primary">
                            {formatCurrency(order.totalAmount)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={18} className="text-gray400" />
                          ) : (
                            <ChevronDown size={18} className="text-gray400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="clay-inset rounded-2xl p-3 mb-3">
                            <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-gray500 uppercase tracking-wide mb-2">
                              <span>Item</span>
                              <span className="text-center">Qty</span>
                              <span className="text-right">Amount</span>
                            </div>
                            {order.items?.map((oi) => (
                              <div key={oi.itemId} className="grid grid-cols-3 gap-2 py-1.5 text-sm border-t border-gray300/30 first:border-0">
                                <span className="text-gray800 font-medium truncate">{oi.item.name}</span>
                                <span className="text-center text-gray600">{oi.quantity}</span>
                                <span className="text-right font-bold text-dark">
                                  {formatCurrency((oi.unitPrice ?? oi.item.price) * oi.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => onEditOrder(order)}
                              className="flex-1 h-11 clay-surface rounded-2xl font-bold text-sm text-info flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                              <Edit3 size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => onGenerateBill(order)}
                              className="flex-1 h-11 bg-success text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                              <FileText size={16} />
                              Bill
                            </button>
                          </div>
                        </div>
                      )}
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
