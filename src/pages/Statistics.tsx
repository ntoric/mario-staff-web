import { useEffect } from 'react'
import { TrendingUp, ShoppingBag, Package, DollarSign, Banknote, CreditCard, Smartphone } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { FadeSlideIn, StaggeredAnimation, AnimatedProgress, ShimmerBox } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { formatCurrency } from '../lib/constants'

export function Statistics() {
  const { currentStore, user } = useAuthStore()
  const {
    getCompletedOrders, getActiveOrders, getTotalRevenue, getTodayRevenue,
    getTodayOrderCount, getPaymentMethodBreakdown, stats, isLoading, loadStoreData, loadStats,
  } = useDataStore()

  useEffect(() => {
    if (currentStore) {
      loadStoreData(currentStore.id)
    }
    if (user?.role === 'superadmin') {
      loadStats()
    }
  }, [currentStore?.id])

  const totalRevenue = getTotalRevenue()
  const todayRevenue = getTodayRevenue()
  const todayCount = getTodayOrderCount()
  const completedCount = getCompletedOrders().length
  const activeCount = getActiveOrders().length
  const paymentBreakdown = getPaymentMethodBreakdown()
  const maxPayment = Math.max(...paymentBreakdown.values(), 1)

  const paymentIcons: Record<string, typeof Banknote> = {
    cash: Banknote,
    card: CreditCard,
    upi: Smartphone,
  }

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'primary' },
    { label: 'Today Revenue', value: formatCurrency(todayRevenue), icon: TrendingUp, color: 'accent' },
    { label: 'Active Orders', value: String(activeCount), icon: ShoppingBag, color: 'warning' },
    { label: 'Completed', value: String(completedCount), icon: Package, color: 'success' },
  ]

  return (
    <div>
      <AppHeader title="Statistics" />
      <div className="px-5 py-5 max-w-5xl mx-auto lg:ml-64 lg:px-8">
        <FadeSlideIn>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerBox key={i} className="h-28" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {statCards.map((card, index) => {
                  const Icon = card.icon
                  return (
                    <StaggeredAnimation key={card.label} index={index}>
                      <div className="bg-white rounded-2xl card-shadow p-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${card.color}/10`}>
                          <Icon size={20} className={`text-${card.color}`} />
                        </div>
                        <p className="text-xs text-gray400 font-medium">{card.label}</p>
                        <p className="text-lg font-extrabold text-dark mt-0.5">{card.value}</p>
                      </div>
                    </StaggeredAnimation>
                  )
                })}
              </div>

              <StaggeredAnimation index={4}>
                <div className="bg-white rounded-2xl card-shadow p-5 mb-5">
                  <h3 className="font-extrabold text-dark mb-1">Today's Summary</h3>
                  <p className="text-xs text-gray400 mb-4">{todayCount} orders completed today</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-extrabold text-primary">{formatCurrency(todayRevenue)}</span>
                    <span className="text-sm text-gray400 mb-1">revenue today</span>
                  </div>
                </div>
              </StaggeredAnimation>

              <StaggeredAnimation index={5}>
                <div className="bg-white rounded-2xl card-shadow p-5 mb-5">
                  <h3 className="font-extrabold text-dark mb-4">Payment Methods</h3>
                  {paymentBreakdown.size === 0 ? (
                    <p className="text-sm text-gray400">No payment data available</p>
                  ) : (
                    <div className="space-y-4">
                      {Array.from(paymentBreakdown.entries()).map(([method, amount]) => {
                        const Icon = paymentIcons[method] || Banknote
                        return (
                          <div key={method}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <Icon size={16} className="text-gray500" />
                                <span className="text-sm font-bold text-dark capitalize">{method}</span>
                              </div>
                              <span className="text-sm font-bold text-dark">{formatCurrency(amount)}</span>
                            </div>
                            <AnimatedProgress value={amount / maxPayment} />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </StaggeredAnimation>

              {stats && user?.role === 'superadmin' && (
                <StaggeredAnimation index={6}>
                  <div className="bg-white rounded-2xl card-shadow p-5">
                    <h3 className="font-extrabold text-dark mb-4">System Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-gray50 rounded-xl p-3">
                        <p className="text-xs text-gray400">Total Users</p>
                        <p className="text-lg font-extrabold text-dark">{stats.users}</p>
                      </div>
                      <div className="bg-gray50 rounded-xl p-3">
                        <p className="text-xs text-gray400">Total Stores</p>
                        <p className="text-lg font-extrabold text-dark">{stats.stores}</p>
                      </div>
                      <div className="bg-gray50 rounded-xl p-3">
                        <p className="text-xs text-gray400">Total Items</p>
                        <p className="text-lg font-extrabold text-dark">{stats.items}</p>
                      </div>
                      <div className="bg-gray50 rounded-xl p-3">
                        <p className="text-xs text-gray400">Total Orders</p>
                        <p className="text-lg font-extrabold text-dark">{stats.orders}</p>
                      </div>
                    </div>
                  </div>
                </StaggeredAnimation>
              )}
            </>
          )}
        </FadeSlideIn>
      </div>
    </div>
  )
}
