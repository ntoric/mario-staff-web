import { useEffect, useState } from 'react'
import { FileText, CreditCard, Banknote, Smartphone, User, CheckCircle, Printer } from 'lucide-react'
import { OverlayHeader } from '../components/AppHeader'
import { useAuthStore } from '../stores/authStore'
import { useDataStore } from '../stores/dataStore'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/constants'
import type { Order } from '../types'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Smartphone },
]

export function Bill({
  order,
  onBack,
}: {
  order: Order
  onBack: () => void
}) {
  const { currentStore } = useAuthStore()
  const { loadStoreData } = useDataStore()
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod || 'cash')
  const [customerName, setCustomerName] = useState(order.customerName || '')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [generatedBill, setGeneratedBill] = useState<{ invoiceNo: string; total: number } | null>(null)

  useEffect(() => {
    if (currentStore) {
      api.getNextInvoiceNo(currentStore.id).then(setInvoiceNo).catch(() => {})
    }
  }, [currentStore?.id])

  const subtotal = order.items?.reduce((sum, oi) => sum + (oi.unitPrice ?? oi.item.price) * oi.quantity, 0) ?? 0
  const taxAmount = order.taxAmount ?? 0
  const discount = order.discountAmount ?? 0
  const total = subtotal + taxAmount - discount

  const handleGenerateBill = async () => {
    if (!currentStore) return
    setIsGenerating(true)
    setError(null)

    try {
      const invNo = invoiceNo || `INV-${Date.now()}`
      await api.queueBill({
        orderId: order.id,
        tableNumber: order.tableNumber ?? 0,
        invoiceNo: invNo,
        subtotal,
        taxTotal: taxAmount,
        discount,
        total,
        paymentMethod,
        customerName: customerName.trim() || undefined,
        storeId: currentStore.id,
      })
      await api.completeOrder(order.id, paymentMethod)
      await loadStoreData(currentStore.id)
      setGeneratedBill({ invoiceNo: invNo, total })
      setSuccess(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <OverlayHeader
        title="Generate Bill"
        subtitle={`${order.orderType === 'parcel' ? 'Parcel Order' : `Table ${order.tableNumber}`}`}
        onBack={onBack}
      />

      <div className="max-w-2xl mx-auto px-4 py-5 pb-32">
        {error && (
          <div className="mb-4 p-3 bg-danger/8 rounded-xl border border-danger/20 text-danger text-sm font-medium">
            {error}
          </div>
        )}

        {success && generatedBill ? (
          <div className="bg-white rounded-2xl card-shadow p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-success" />
            </div>
            <h2 className="text-lg font-extrabold text-dark">Bill Generated!</h2>
            <p className="text-sm text-gray500 mt-1">Invoice #{generatedBill.invoiceNo}</p>
            <p className="text-2xl font-extrabold text-primary mt-3">{formatCurrency(generatedBill.total)}</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 h-12 bg-gray100 rounded-2xl font-bold text-sm text-gray700 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Printer size={18} />
                Print
              </button>
              <button
                onClick={onBack}
                className="flex-1 h-12 btn-primary flex items-center justify-center"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-cardDark rounded-3xl p-6 mb-4 text-center">
              <p className="text-white/60 text-sm">Total Amount</p>
              <p className="text-white text-[44px] font-extrabold mt-1 tracking-tight">{formatCurrency(total)}</p>
              <span className="inline-block mt-3 px-4 py-1.5 bg-white/10 rounded-xl text-white text-sm font-bold">
                {order.orderType === 'parcel' ? 'Parcel' : `Table ${order.tableNumber}`}
              </span>
            </div>

            <div className="clay-surface rounded-3xl p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  <h3 className="font-extrabold text-dark">Order Summary</h3>
                </div>
                {invoiceNo && (
                  <span className="text-xs font-bold text-gray400">#{invoiceNo}</span>
                )}
              </div>

              <div className="space-y-2.5">
                {order.items?.map((oi) => (
                  <div key={oi.itemId} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-dark">{oi.item.name}</span>
                      <span className="text-gray400 ml-2">×{oi.quantity}</span>
                    </div>
                    <span className="font-bold text-dark">
                      {formatCurrency((oi.unitPrice ?? oi.item.price) * oi.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray100 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray500">Subtotal</span>
                  <span className="font-bold text-dark">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray500">Tax</span>
                  <span className="font-bold text-dark">{formatCurrency(taxAmount)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray500">Discount</span>
                    <span className="font-bold text-danger">-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray100">
                  <span className="font-extrabold text-dark">Total</span>
                  <span className="font-extrabold text-primary text-lg">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="clay-surface rounded-3xl p-5 mb-4">
              <h3 className="font-extrabold text-dark mb-3">Customer Name (optional)</h3>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray400" />
                <input
                  type="text"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div className="clay-surface rounded-3xl p-5 mb-4">
              <h3 className="font-extrabold text-dark mb-3">Payment Method</h3>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon
                  const isSelected = paymentMethod === method.value
                  return (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-primary text-white soft-shadow'
                          : 'clay-inset text-gray500'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs font-bold">{method.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={handleGenerateBill}
              disabled={isGenerating}
              className="w-full h-14 btn-primary rounded-2xl flex items-center justify-center gap-2"
            >
              <FileText size={20} />
              {isGenerating ? 'Generating...' : 'Generate Bill'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
