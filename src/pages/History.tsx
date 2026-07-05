import { useEffect, useState, useMemo } from 'react'
import { History as HistoryIcon, Search, Package, Receipt, ChevronDown, X } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { FadeSlideIn, StaggeredAnimation, ShimmerBox } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { formatCurrency, formatDate } from '../lib/constants'
import type { Order } from '../types'

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
      <div className="px-5 py-5 max-w-5xl mx-auto lg:ml-64 lg:px-8">
        <FadeSlideIn>
          <div className="relative mb-3">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11 py-3"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray400"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all capitalize ${
                  statusFilter === status
                    ? 'gradient-primary text-white'
                    : 'bg-white text-gray500 card-shadow'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <ShimmerBox key={i} className="h-20" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <HistoryIcon size={48} className="mx-auto text-gray300" />
              <p className="text-gray400 text-sm mt-4">No orders found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredOrders.map((order, index) => {
                const isExpanded = expandedId === order.id
                const isParcel = order.orderType === 'parcel'
                const totalItems = order.items?.reduce((sum, oi) => sum + oi.quantity, 0) ?? 0
                return (
                  <StaggeredAnimation key={order.id} index={index}>
                    <div className="bg-white rounded-2xl card-shadow overflow-hidden">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        className="w-full p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {isParcel ? (
                            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                              <Package size={20} className="text-warningDark" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary-extraLight flex items-center justify-center">
                              <Receipt size={20} className="text-primary" />
                            </div>
                          )}
                          <div className="text-left">
                            <p className="font-bold text-dark text-sm">
                              {isParcel ? 'Parcel' : `Table ${order.tableNumber}`}
                            </p>
                            <p className="text-xs text-gray400">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                            order.status === 'completed'
                              ? 'bg-success/10 text-success'
                              : 'bg-danger/10 text-danger'
                          }`}>
                            {order.status}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-gray400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray100 pt-3">
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
                          <div className="pt-3 border-t border-gray100 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray500">Subtotal</span>
                              <span className="font-bold text-dark">{formatCurrency(order.totalAmount - order.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray500">Tax</span>
                              <span className="font-bold text-dark">{formatCurrency(order.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span className="font-extrabold text-dark">Total</span>
                              <span className="font-extrabold text-primary">{formatCurrency(order.totalAmount)}</span>
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

                      {!isExpanded && (
                        <div className="px-4 pb-3 flex items-center justify-between">
                          <span className="text-xs text-gray400">
                            {totalItems} item{totalItems !== 1 ? 's' : ''}
                            {order.paymentMethod && ` · ${order.paymentMethod}`}
                          </span>
                          <span className="font-extrabold text-primary text-sm">
                            {formatCurrency(order.totalAmount)}
                          </span>
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
