import { useEffect, useState, useMemo } from 'react'
import { Search, Plus, Minus, Trash2, Save, User, Phone, ChevronDown, ChevronUp, CreditCard, Banknote, Smartphone } from 'lucide-react'
import { AppHeader, OverlayHeader } from '../components/AppHeader'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/constants'
import type { OrderItem, Item } from '../types'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Smartphone },
]

export function ParcelOrder({
  onBack,
  onComplete,
  embedded = false,
}: {
  onBack: () => void
  onComplete?: () => void
  embedded?: boolean
}) {
  const { currentStore } = useAuthStore()
  const { categories, items, loadStoreData } = useDataStore()
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<Map<string, OrderItem>>(new Map())
  const [customerName, setCustomerName] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [summaryExpanded, setSummaryExpanded] = useState(false)

  useEffect(() => {
    if (currentStore && items.length === 0) {
      loadStoreData(currentStore.id)
    }
  }, [currentStore?.id])

  const filteredItems = useMemo(() => {
    let result = items.filter((i) => i.isActive)
    if (selectedCategoryId !== 'all') {
      result = result.filter((i) => i.categoryId === selectedCategoryId)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((i) => i.name.toLowerCase().includes(q))
    }
    return result
  }, [items, selectedCategoryId, searchQuery])

  const subtotal = useMemo(() => {
    let sum = 0
    for (const oi of cart.values()) {
      sum += (oi.unitPrice ?? oi.item.price) * oi.quantity
    }
    return sum
  }, [cart])

  const taxAmount = useMemo(() => {
    let tax = 0
    for (const oi of cart.values()) {
      const price = (oi.unitPrice ?? oi.item.price) * oi.quantity
      const rate = oi.taxPercent ?? oi.item.taxPercent ?? 0
      tax += price * (rate / 100)
    }
    return tax
  }, [cart])

  const total = subtotal + taxAmount

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const newCart = new Map(prev)
      const existing = newCart.get(item.id)
      if (existing) {
        newCart.set(item.id, { ...existing, quantity: existing.quantity + 1 })
      } else {
        newCart.set(item.id, {
          itemId: item.id,
          item,
          quantity: 1,
          unitPrice: item.price,
          taxPercent: item.taxPercent ?? 0,
        })
      }
      return newCart
    })
  }

  const decrementItem = (itemId: string) => {
    setCart((prev) => {
      const newCart = new Map(prev)
      const existing = newCart.get(itemId)
      if (!existing) return prev
      if (existing.quantity <= 1) {
        newCart.delete(itemId)
      } else {
        newCart.set(itemId, { ...existing, quantity: existing.quantity - 1 })
      }
      return newCart
    })
  }

  const removeItem = (itemId: string) => {
    setCart((prev) => {
      const newCart = new Map(prev)
      newCart.delete(itemId)
      return newCart
    })
  }

  const handleSave = async () => {
    if (!currentStore) return
    if (cart.size === 0) {
      setError('Please add at least one item')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const cartItems = Array.from(cart.values()).map((oi) => ({
        itemId: oi.itemId,
        quantity: oi.quantity,
        unitPrice: oi.unitPrice,
        taxPercent: oi.taxPercent,
        item: { id: oi.item.id, name: oi.item.name, price: oi.item.price, description: oi.item.description },
      }))

      await api.createParcelOrder(
        currentStore.id,
        cartItems,
        total,
        taxAmount,
        0,
        paymentMethod,
        customerName.trim(),
        customerMobile.trim(),
      )
      await loadStoreData(currentStore.id)
      setSuccess('Parcel order created successfully!')
      setTimeout(() => (onComplete ?? onBack)(), 1200)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const cartArray = Array.from(cart.values())
  const totalItems = cartArray.reduce((sum, oi) => sum + oi.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      {embedded ? (
        <AppHeader title="Parcel Order" subtitle={`${totalItems} items in cart`} />
      ) : (
        <OverlayHeader
          title="Parcel Order"
          subtitle={`${totalItems} items in cart`}
          onBack={onBack}
        />
      )}

      <div
        className={`max-w-6xl mx-auto px-4 ${
          embedded
            ? cart.size > 0
              ? 'pb-[calc(240px+var(--mobile-bottom-nav-height))] md:pb-52'
              : 'page-content !pt-0 !pb-28 md:!pb-6'
            : 'pb-48'
        } ${embedded && cart.size === 0 ? 'page-content !pt-0' : embedded ? 'pt-0' : ''}`}
      >
        {error && (
          <div className="mx-5 mt-4 p-3 bg-danger/8 rounded-xl border border-danger/20 text-danger text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-5 mt-4 p-3 bg-success/8 rounded-xl border border-success/20 text-success text-sm font-medium">
            {success}
          </div>
        )}

        <div className="px-5 pt-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-11 py-3"
            />
          </div>
        </div>

        <div className="px-5 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategoryId === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray500 card-shadow'
            }`}
          >
            All
          </button>
          {categories.filter((c) => c.isActive).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray500 card-shadow'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="px-5 pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredItems.map((item) => {
            const inCart = cart.get(item.id)
            return (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="bg-white rounded-2xl card-shadow p-4 text-left transition-all active:scale-95 relative"
              >
                {inCart && (
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-extrabold elevated-shadow">
                    {inCart.quantity}
                  </span>
                )}
                <p className="font-bold text-sm text-dark line-clamp-2">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-gray400 mt-0.5 line-clamp-1">{item.description}</p>
                )}
                <p className="text-primary font-extrabold mt-2">{formatCurrency(item.price)}</p>
              </button>
            )
          })}
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray400 text-sm">No items found</p>
            </div>
          )}
        </div>

        <div className="px-5 pt-5 space-y-3">
          <h3 className="text-sm font-extrabold text-dark">Customer Details</h3>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray400" />
            <input
              type="text"
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray400" />
            <input
              type="tel"
              placeholder="Mobile number (optional)"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              className="input-field pl-11"
            />
          </div>

          <h3 className="text-sm font-extrabold text-dark pt-2">Payment Method</h3>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon
              const isSelected = paymentMethod === method.value
              return (
                <button
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  className={`flex-1 h-14 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary text-white elevated-shadow'
                      : 'bg-white text-gray500 card-shadow'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-bold">{method.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {cart.size > 0 && (
        <div
          className={`cart-bar safe-bottom ${embedded ? 'cart-bar-above-nav' : 'bottom-0'}`}
        >
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setSummaryExpanded(!summaryExpanded)}
              className="w-full px-5 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {summaryExpanded ? <ChevronDown size={20} className="text-gray400" /> : <ChevronUp size={20} className="text-gray400" />}
                <span className="text-sm font-bold text-dark">
                  {totalItems} item{totalItems !== 1 ? 's' : ''} · {formatCurrency(total)}
                </span>
              </div>
              <span className="text-xs text-gray400 font-medium">
                {summaryExpanded ? 'Collapse' : 'Expand'}
              </span>
            </button>

            {summaryExpanded && (
              <div className="px-5 pb-3 max-h-48 overflow-y-auto space-y-2">
                {cartArray.map((oi) => (
                  <div key={oi.itemId} className="flex items-center gap-3 py-2 border-b border-gray100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark truncate">{oi.item.name}</p>
                      <p className="text-xs text-gray500">
                        {formatCurrency(oi.unitPrice ?? oi.item.price)} × {oi.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decrementItem(oi.itemId)}
                        className="w-8 h-8 rounded-lg bg-gray100 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Minus size={16} className="text-gray600" />
                      </button>
                      <span className="text-sm font-bold text-dark w-6 text-center">{oi.quantity}</span>
                      <button
                        onClick={() => addToCart(oi.item)}
                        className="w-8 h-8 rounded-lg bg-primary-extraLight flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Plus size={16} className="text-primary" />
                      </button>
                      <button
                        onClick={() => removeItem(oi.itemId)}
                        className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <Trash2 size={15} className="text-danger" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="px-5 pb-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray400">Total (incl. tax)</p>
                <p className="text-lg font-extrabold text-dark">{formatCurrency(total)}</p>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary h-12 px-6 flex items-center gap-2"
              >
                <Save size={18} />
                {isSaving ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
