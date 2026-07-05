import { create } from 'zustand'
import { api } from '../lib/api'
import {
  Category, Item, Order, Bill, TableModel, SystemStats,
} from '../types'
import { useAuthStore } from './authStore'

interface DataState {
  categories: Category[]
  items: Item[]
  orders: Order[]
  bills: Bill[]
  tables: TableModel[]
  stats: SystemStats | null
  isLoading: boolean
  error: string | null

  loadStoreData: (storeId: string) => Promise<void>
  loadOrders: (storeId: string) => Promise<void>
  loadTables: (storeId: string) => Promise<void>
  loadCategories: (storeId: string) => Promise<void>
  loadItems: (storeId: string) => Promise<void>
  loadBills: (storeId: string) => Promise<void>
  loadStats: () => Promise<void>

  getActiveOrders: () => Order[]
  getCompletedOrders: () => Order[]
  getCancelledOrders: () => Order[]
  getParcelOrders: () => Order[]
  getTableOrders: (tableId: string) => Order[]
  getTotalRevenue: () => number
  getTodayRevenue: () => number
  getTodayOrderCount: () => number
  getPaymentMethodBreakdown: () => Map<string, number>
}

export const useDataStore = create<DataState>((set, get) => ({
  categories: [],
  items: [],
  orders: [],
  bills: [],
  tables: [],
  stats: null,
  isLoading: false,
  error: null,

  loadStoreData: async (storeId) => {
    set({ isLoading: true, error: null })
    try {
      const [categories, items, orders, bills, tables] = await Promise.all([
        api.getCategories(storeId),
        api.getItems(storeId),
        api.getOrders(storeId),
        api.getBills(storeId),
        api.getTables(storeId),
      ])
      set({ categories, items, orders, bills, tables, isLoading: false })
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false })
    }
  },

  loadOrders: async (storeId) => {
    try {
      const orders = await api.getOrders(storeId)
      set({ orders })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  loadTables: async (storeId) => {
    try {
      const tables = await api.getTables(storeId)
      set({ tables })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  loadCategories: async (storeId) => {
    try {
      const categories = await api.getCategories(storeId)
      set({ categories })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  loadItems: async (storeId) => {
    try {
      const items = await api.getItems(storeId)
      set({ items })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  loadBills: async (storeId) => {
    try {
      const bills = await api.getBills(storeId)
      set({ bills })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  loadStats: async () => {
    try {
      const stats = await api.getSystemStats()
      set({ stats })
    } catch (e) {
      set({ error: (e as Error).message })
    }
  },

  getActiveOrders: () => get().orders.filter((o) => o.status === 'active'),
  getCompletedOrders: () => get().orders.filter((o) => o.status === 'completed'),
  getCancelledOrders: () => get().orders.filter((o) => o.status === 'cancelled'),
  getParcelOrders: () => get().orders.filter((o) => o.orderType === 'parcel'),

  getTableOrders: (tableId) => get().orders.filter((o) => o.tableId === tableId && o.status === 'active'),

  getTotalRevenue: () => get().orders.filter((o) => o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0),

  getTodayRevenue: () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return get().orders
      .filter((o) => o.status === 'completed')
      .filter((o) => new Date(o.createdAt) > new Date(today.getTime() - 1000))
      .reduce((sum, o) => sum + o.totalAmount, 0)
  },

  getTodayOrderCount: () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return get().orders
      .filter((o) => o.status === 'completed')
      .filter((o) => new Date(o.createdAt) > new Date(today.getTime() - 1000))
      .length
  },

  getPaymentMethodBreakdown: () => {
    const map = new Map<string, number>()
    for (const order of get().orders.filter((o) => o.status === 'completed')) {
      const method = order.paymentMethod ?? 'Unknown'
      map.set(method, (map.get(method) ?? 0) + order.totalAmount)
    }
    return map
  },
}))
