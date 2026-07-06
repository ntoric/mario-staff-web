import { useEffect, useState, useMemo } from 'react'
import { History as HistoryIcon, Search, ChevronDown, X, CheckCircle, XCircle } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { FadeSlideIn, StaggeredAnimation, ShimmerBox } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { formatCurrency, formatDate } from '../lib/constants'

const STATUS_FILTERS = ['all', 'completed', 'cancelled'] as const

export function History() {
  const { currentStore } = useAuthStore()
  const { orders, isLoading, loadStoreData } = useDataStore()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (currentStore) {
      loadStoreData(currentStore.id)
    }
  }, [currentStore?.id])

  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => o.status !== 'active')
    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (o) =>
          o.customerName?.toLowerCase().includes(q) ||
          o.items?.some((oi) => oi.item.name.toLowerCase().includes(q)) ||
          `table ${o.tableNumber}`.includes(q)
      )
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, statusFilter, searchQuery])

  return (
    <div>
      <AppHeader title="History" />
      <div className="page-content">
        <FadeSlideIn>
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`filter-chip capitalize ${statusFilter === status ? 'filter-chip-active' : 'filter-chip-inactive'}`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative mb-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray500" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11 py-3 bg-gray200/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray500"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <ShimmerBox key={i} className="h-20" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <div className="empty-state-icon mb-4">
                <HistoryIcon size={40} className="text-gray400" />
              </div>
              <p className="text-gray500 text-sm font-medium">No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order, index) => {
                const isExpanded = expandedId === order.id
                const isParcel = order.orderType === 'parcel'
                const isCompleted = order.status === 'completed'
                return (
                  <StaggeredAnimation key={order.id} index={index}>
                    <div className="bg-white rounded-[20px] card-shadow overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="w-full p-4 flex items-center gap-3"
                      >
                        <div
                          className={`status-icon-shell shrink-0 ${
                            isCompleted ? 'bg-success/10' : 'bg-danger/10'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle size={22} className="text-success" />
                          ) : (
                            <XCircle size={22} className="text-danger" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-dark text-sm truncate">
                              {isParcel ? 'Parcel Order' : `Table ${order.tableNumber}`}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize shrink-0 ${
                                isCompleted ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray500 mt-0.5">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-primary text-sm">
                            {formatCurrency(order.totalAmount)}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-gray400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray200/60 pt-3">
                          <div className="space-y-2 mb-3">
                            {order.items?.map((oi) => (
                              <div key={oi.itemId} className="flex justify-between text-sm">
                                <span className="text-gray600">
                                  {oi.item.name} ×{oi.quantity}
                                </span>
                                <span className="font-bold text-dark">
                                  {formatCurrency((oi.unitPrice ?? oi.item.price) * oi.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="clay-inset rounded-2xl p-3 space-y-1.5">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray500">Subtotal</span>
                              <span className="font-bold text-dark">
                                {formatCurrency(order.totalAmount - order.taxAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray500">Tax</span>
                              <span className="font-bold text-dark">{formatCurrency(order.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-gray300/30">
                              <span className="font-extrabold text-dark">Total</span>
                              <span className="font-extrabold text-primary">
                                {formatCurrency(order.totalAmount)}
                              </span>
                            </div>
                            {order.paymentMethod && (
                              <div className="flex justify-between text-sm pt-1">
                                <span className="text-gray500">Payment</span>
                                <span className="font-bold text-dark capitalize">{order.paymentMethod}</span>
                              </div>
                            )}
                            {order.customerName && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray500">Customer</span>
                                <span className="font-bold text-dark">{order.customerName}</span>
                              </div>
                            )}
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
