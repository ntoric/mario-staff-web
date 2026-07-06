import {
  LayoutGrid,
  Receipt,
  History,
  BarChart3,
  UtensilsCrossed,
  Package,
  Settings,
} from 'lucide-react'
import { APP_LOGO, APP_NAME } from '../lib/constants'

export interface NavItem {
  id: string
  icon: typeof LayoutGrid
  label: string
}

export const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'tables', icon: LayoutGrid, label: 'Tables' },
  { id: 'orders', icon: Receipt, label: 'Orders' },
  { id: 'history', icon: History, label: 'History' },
  { id: 'stats', icon: BarChart3, label: 'Stats' },
  { id: 'menu', icon: UtensilsCrossed, label: 'Menu' },
  { id: 'parcel', icon: Package, label: 'Parcel' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

export function BottomNav({
  navItems,
  currentIndex,
  onTabChange,
}: {
  navItems: NavItem[]
  currentIndex: number
  onTabChange: (index: number) => void
}) {
  return (
    <>
      {/* Mobile: floating clay bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(18px+env(safe-area-inset-bottom))] pt-2 pointer-events-none">
        <div className="clay-nav-bar rounded-[30px] pointer-events-auto max-w-lg mx-auto">
          <div className="flex items-center justify-around px-1 py-2">
            {navItems.map((item, index) => {
              const isSelected = currentIndex === index
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(index)}
                  className="nav-tab-btn flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-2xl transition-all duration-200 min-w-0 flex-1"
                >
                  <Icon
                    size={22}
                    strokeWidth={isSelected ? 2.5 : 2}
                    className={`nav-icon-3d ${isSelected ? 'nav-icon-3d-active text-primary' : 'text-gray500'}`}
                  />
                  <span
                    className={`text-[10px] leading-tight truncate max-w-full ${
                      isSelected ? 'font-bold text-primary' : 'font-medium text-gray500'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Tablet: icon-only sidebar */}
      <nav className="hidden md:flex xl:hidden fixed left-0 top-0 bottom-0 w-20 z-50 flex-col items-center py-6 px-2">
        <div className="clay-surface rounded-[32px] w-full flex-1 flex flex-col items-center py-5 gap-1">
          <div className="w-10 h-10 rounded-2xl overflow-hidden mb-4 shrink-0">
            <img src={APP_LOGO} alt={APP_NAME} className="w-full h-full object-cover" />
          </div>
          {navItems.map((item, index) => {
            const isSelected = currentIndex === index
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(index)}
                title={item.label}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-200 ${
                  isSelected ? 'clay-accent' : 'hover:bg-white/40'
                }`}
              >
                <Icon
                  size={24}
                  strokeWidth={isSelected ? 2.5 : 2}
                  className={isSelected ? 'text-primary' : 'text-gray500'}
                />
              </button>
            )
          })}
        </div>
      </nav>

      {/* Desktop: sidebar with labels */}
      <nav className="hidden xl:flex fixed left-0 top-0 bottom-0 w-60 z-50 flex-col p-4">
        <div className="clay-surface rounded-[32px] w-full flex-1 flex flex-col py-6 px-3">
          <div className="flex items-center gap-3 px-3 mb-6">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0">
              <img src={APP_LOGO} alt={APP_NAME} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-dark text-sm truncate">Mario POS</p>
              <p className="text-[11px] text-gray500 truncate">Order Management</p>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            {navItems.map((item, index) => {
              const isSelected = currentIndex === index
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isSelected ? 'clay-accent' : 'hover:bg-white/40'
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={isSelected ? 2.5 : 2}
                    className={isSelected ? 'text-primary' : 'text-gray500'}
                  />
                  <span
                    className={`text-sm ${
                      isSelected ? 'font-bold text-primary' : 'font-medium text-gray600'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </>
  )
}
