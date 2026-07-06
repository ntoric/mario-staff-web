import { useEffect, useState, useMemo } from 'react'
import { Search, UtensilsCrossed, Tag } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { FadeSlideIn, StaggeredAnimation, ShimmerBox } from '../components/Animations'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { formatCurrency } from '../lib/constants'

type MenuTab = 'categories' | 'items'

export function Menu() {
  const { currentStore } = useAuthStore()
  const { categories, items, isLoading, loadStoreData } = useDataStore()
  const [activeTab, setActiveTab] = useState<MenuTab>('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')

  useEffect(() => {
    if (currentStore) {
      loadStoreData(currentStore.id)
    }
  }, [currentStore?.id])

  const activeCategories = categories.filter((c) => c.isActive)
  const activeItems = items.filter((i) => i.isActive)

  const filteredItems = useMemo(() => {
    let result = activeItems
    if (selectedCategoryId !== 'all') {
      result = result.filter((i) => i.categoryId === selectedCategoryId)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((i) => i.name.toLowerCase().includes(q))
    }
    return result
  }, [activeItems, selectedCategoryId, searchQuery])

  const getCategoryItemCount = (categoryId: string) =>
    activeItems.filter((i) => i.categoryId === categoryId).length

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name ?? 'Unknown'

  return (
    <div>
      <AppHeader title="Menu List" />

      <div className="page-content">
        <FadeSlideIn>
          <div className="clay-surface rounded-3xl p-1.5 flex gap-1 mb-4">
            {(['categories', 'items'] as MenuTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-bold capitalize transition-all ${
                  activeTab === tab ? 'clay-accent text-primary' : 'text-gray500'
                }`}
              >
                {tab === 'categories' ? 'Categories' : 'Food Items'}
              </button>
            ))}
          </div>

          {activeTab === 'categories' ? (
            isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ShimmerBox key={i} className="h-24" />
                ))}
              </div>
            ) : activeCategories.length === 0 ? (
              <div className="text-center py-20">
                <div className="empty-state-icon mb-4">
                  <Tag size={40} className="text-gray400" />
                </div>
                <p className="text-gray500 text-sm">No categories found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {activeCategories.map((cat, index) => (
                  <StaggeredAnimation key={cat.id} index={index}>
                    <div className="clay-surface rounded-3xl p-4 flex items-center gap-4">
                      <div className="w-14 h-14 clay-accent rounded-full flex items-center justify-center shrink-0">
                        <UtensilsCrossed size={24} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-dark truncate">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-gray500 mt-0.5 line-clamp-2">{cat.description}</p>
                        )}
                        <p className="text-xs font-bold text-primary mt-1">
                          {getCategoryItemCount(cat.id)} items
                        </p>
                      </div>
                    </div>
                  </StaggeredAnimation>
                ))}
              </div>
            )
          ) : (
            <>
              <div className="relative mb-3">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray500" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-11 py-3 bg-gray200/50 border-0"
                />
              </div>

              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className={`filter-chip ${selectedCategoryId === 'all' ? 'filter-chip-active' : 'filter-chip-inactive'}`}
                >
                  All
                </button>
                {activeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`filter-chip ${selectedCategoryId === cat.id ? 'filter-chip-active' : 'filter-chip-inactive'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <ShimmerBox key={i} className="h-20" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-20">
                  <div className="empty-state-icon mb-4">
                    <UtensilsCrossed size={40} className="text-gray400" />
                  </div>
                  <p className="text-gray500 text-sm">No items found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item, index) => (
                    <StaggeredAnimation key={item.id} index={index}>
                      <div className="clay-surface rounded-3xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 clay-accent rounded-full flex items-center justify-center shrink-0">
                          <UtensilsCrossed size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-dark truncate">{item.name}</p>
                            <p className="font-extrabold text-primary shrink-0">{formatCurrency(item.price)}</p>
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray500 mt-0.5 line-clamp-1">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="px-2 py-0.5 clay-accent rounded-lg text-[11px] font-bold text-primary">
                              {getCategoryName(item.categoryId)}
                            </span>
                            {(item.taxPercent ?? 0) > 0 && (
                              <span className="text-[11px] text-gray500">Tax {item.taxPercent}%</span>
                            )}
                            {item.hsnCode && (
                              <span className="text-[11px] text-gray500">HSN {item.hsnCode}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </StaggeredAnimation>
                  ))}
                </div>
              )}
            </>
          )}
        </FadeSlideIn>
      </div>
    </div>
  )
}
