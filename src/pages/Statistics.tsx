import { useEffect } from 'react'
import { TrendingUp, ShoppingBag, Package, DollarSign, Banknote, CreditCard, Smartphone } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { BentoGrid, BentoTile, BentoStat, BentoHeroStat } from '../components/BentoGrid'
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

  return (
    <div>
      <AppHeader title="Statistics" />
      <div className="page-content">
        <FadeSlideIn>
          {isLoading ? (
            <BentoGrid>
              {Array.from({ length: 6 }).map((_, i) => (
                <BentoTile key={i} span={i === 0 ? 'full' : '1x1'}>
                  <ShimmerBox className="h-full min-h-[72px] rounded-2xl" />
                </BentoTile>
              ))}
            </BentoGrid>
          ) : (
            <BentoGrid>
              <StaggeredAnimation index={0} className="contents">
                <BentoTile span="full" variant="hero">
                  <BentoHeroStat
                    label="Total Revenue"
                    value={formatCurrency(totalRevenue)}
                    sublabel={`${completedCount} completed orders`}
                  />
                </BentoTile>
              </StaggeredAnimation>

              <StaggeredAnimation index={1} className="contents">
                <BentoTile span="1x1">
                  <BentoStat
                    label="Active Orders"
                    value={String(activeCount)}
                    icon={ShoppingBag}
                    iconColor="#FFB547"
                    iconBg="bg-warning/10"
                  />
                </BentoTile>
              </StaggeredAnimation>

              <StaggeredAnimation index={2} className="contents">
                <BentoTile span="1x2" variant="accent" className="!min-h-[188px] md:!min-h-[88px]">
                  <BentoStat
                    label="Today Revenue"
                    value={formatCurrency(todayRevenue)}
                    icon={DollarSign}
                    iconColor="var(--primary)"
                    iconBg="clay-accent"
                  />
                  <p className="text-[11px] text-gray500 mt-auto pt-3 hidden md:block">
                    {todayCount} orders today
                  </p>
                </BentoTile>
              </StaggeredAnimation>

              <StaggeredAnimation index={3} className="contents">
                <BentoTile span="1x1">
                  <BentoStat
                    label="Completed"
                    value={String(completedCount)}
                    icon={Package}
                    iconColor="#00C896"
                    iconBg="bg-success/10"
                  />
                </BentoTile>
              </StaggeredAnimation>

              <StaggeredAnimation index={4} className="contents">
                <BentoTile span="1x1">
                  <BentoStat
                    label="Today Orders"
                    value={String(todayCount)}
                    icon={TrendingUp}
                    iconColor="#4DA3FF"
                    iconBg="bg-info/10"
                  />
                </BentoTile>
              </StaggeredAnimation>

              <StaggeredAnimation index={5} className="contents">
                <BentoTile span="full" className="!min-h-0">
                  <h3 className="font-extrabold text-dark mb-4 text-sm">Payment Methods</h3>
                  {paymentBreakdown.size === 0 ? (
                    <p className="text-sm text-gray500">No payment data available</p>
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
                            <AnimatedProgress value={amount / maxPayment} color="var(--primary)" />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </BentoTile>
              </StaggeredAnimation>

              {stats && user?.role === 'superadmin' && (
                <StaggeredAnimation index={6} className="contents">
                  <BentoTile span="full" className="!min-h-0">
                    <h3 className="section-title mb-4">System Stats</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {[
                        { label: 'Users', value: stats.users, icon: '👤' },
                        { label: 'Stores', value: stats.stores, icon: '🏪' },
                        { label: 'Categories', value: stats.categories, icon: '📂' },
                        { label: 'Items', value: stats.items, icon: '🍽️' },
                        { label: 'Orders', value: stats.orders, icon: '📋' },
                      ].map((row) => (
                        <div key={row.label} className="bento-tile-inset text-center !min-h-[72px] !p-3">
                          <span className="text-lg block mb-1">{row.icon}</span>
                          <p className="text-[10px] text-gray500 font-medium uppercase tracking-wide">{row.label}</p>
                          <p className="text-lg font-extrabold text-dark">{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </BentoTile>
                </StaggeredAnimation>
              )}
            </BentoGrid>
          )}
        </FadeSlideIn>
      </div>
    </div>
  )
}
