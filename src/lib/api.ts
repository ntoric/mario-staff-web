import {
  User, Store, Category, Item, Order, Bill, TableModel, SystemStats, AppUpdate,
} from '../types'
import { DEFAULT_API_URL } from './constants'

class ApiService {
  private baseUrl: string = DEFAULT_API_URL
  private token: string | null = null

  constructor() {
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) this.token = savedToken
    const savedUrl = localStorage.getItem('api_url')
    if (savedUrl) this.baseUrl = savedUrl
  }

  get apiUrl() {
    return this.baseUrl
  }

  private get headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.token) h['Authorization'] = `Bearer ${this.token}`
    return h
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('auth_token')
  }

  getToken() {
    return this.token
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status >= 200 && response.status < 300) {
      const text = await response.text()
      if (!text) return null as T
      return JSON.parse(text) as T
    } else if (response.status === 401) {
      this.clearToken()
      throw new Error('Session expired. Please login again.')
    } else {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || 'Request failed')
    }
  }

  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await this.handleResponse<{ token: string; user: User }>(res)
    if (data.token) {
      this.setToken(data.token)
    }
    return data
  }

  async getMe(): Promise<User> {
    const res = await fetch(`${this.baseUrl}/auth/me`, { headers: this.headers })
    return this.handleResponse<User>(res)
  }

  async getStores(): Promise<Store[]> {
    const res = await fetch(`${this.baseUrl}/stores`, { headers: this.headers })
    return this.handleResponse<Store[]>(res)
  }

  async switchStore(storeId: string): Promise<Store> {
    const res = await fetch(`${this.baseUrl}/stores/switch`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ storeId }),
    })
    const data = await this.handleResponse<{ store: Store }>(res)
    return data.store
  }

  async getCategories(storeId: string): Promise<Category[]> {
    const res = await fetch(`${this.baseUrl}/categories?storeId=${storeId}`, { headers: this.headers })
    return this.handleResponse<Category[]>(res)
  }

  async createCategory(storeId: string, name: string, description?: string): Promise<Category> {
    const res = await fetch(`${this.baseUrl}/categories`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ storeId, name, description }),
    })
    return this.handleResponse<Category>(res)
  }

  async updateCategory(id: string, name: string, description?: string): Promise<Category> {
    const res = await fetch(`${this.baseUrl}/categories/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({ name, description }),
    })
    return this.handleResponse<Category>(res)
  }

  async deleteCategory(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/categories/${id}`, { method: 'DELETE', headers: this.headers })
  }

  async getItems(storeId: string): Promise<Item[]> {
    const res = await fetch(`${this.baseUrl}/items?storeId=${storeId}`, { headers: this.headers })
    return this.handleResponse<Item[]>(res)
  }

  async createItem(storeId: string, categoryId: string, name: string, price: number, description?: string, taxPercent?: number): Promise<Item> {
    const res = await fetch(`${this.baseUrl}/items`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ storeId, categoryId, name, price, description, taxPercent }),
    })
    return this.handleResponse<Item>(res)
  }

  async updateItem(id: string, data: Partial<Item>): Promise<Item> {
    const res = await fetch(`${this.baseUrl}/items/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    })
    return this.handleResponse<Item>(res)
  }

  async deleteItem(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/items/${id}`, { method: 'DELETE', headers: this.headers })
  }

  async getTables(storeId: string): Promise<TableModel[]> {
    const res = await fetch(`${this.baseUrl}/tables?storeId=${storeId}`, { headers: this.headers })
    return this.handleResponse<TableModel[]>(res)
  }

  async createTable(storeId: string, number: number, seats: number): Promise<TableModel> {
    const res = await fetch(`${this.baseUrl}/tables`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ storeId, number, seats }),
    })
    return this.handleResponse<TableModel>(res)
  }

  async updateTable(id: string, data: Partial<TableModel>): Promise<TableModel> {
    const res = await fetch(`${this.baseUrl}/tables/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    })
    return this.handleResponse<TableModel>(res)
  }

  async deleteTable(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/tables/${id}`, { method: 'DELETE', headers: this.headers })
  }

  async getOrders(storeId: string, status?: string): Promise<Order[]> {
    const url = status
      ? `${this.baseUrl}/orders?storeId=${storeId}&status=${status}`
      : `${this.baseUrl}/orders?storeId=${storeId}`
    const res = await fetch(url, { headers: this.headers })
    return this.handleResponse<Order[]>(res)
  }

  async createOrder(storeId: string, tableId: string, tableNumber: number, items: { itemId: string; quantity: number; unitPrice?: number; taxPercent?: number; notes?: string }[], totalAmount: number, taxAmount: number, discountAmount: number): Promise<Order> {
    const res = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ storeId, tableId, tableNumber, items, totalAmount, taxAmount, discountAmount }),
    })
    return this.handleResponse<Order>(res)
  }

  async createParcelOrder(storeId: string, items: { itemId: string; quantity: number; unitPrice?: number; taxPercent?: number }[], totalAmount: number, taxAmount: number, discountAmount: number, paymentMethod: string, customerName: string, customerMobile: string): Promise<Order> {
    const res = await fetch(`${this.baseUrl}/orders/parcel`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ storeId, items, totalAmount, taxAmount, discountAmount, paymentMethod, customerName, customerMobile }),
    })
    return this.handleResponse<Order>(res)
  }

  async updateOrder(id: string, data: Record<string, unknown>): Promise<Order> {
    const res = await fetch(`${this.baseUrl}/orders/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    })
    return this.handleResponse<Order>(res)
  }

  async completeOrder(id: string, paymentMethod: string): Promise<Order> {
    const res = await fetch(`${this.baseUrl}/orders/${id}/complete`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ paymentMethod }),
    })
    return this.handleResponse<Order>(res)
  }

  async cancelOrder(id: string): Promise<Order> {
    const res = await fetch(`${this.baseUrl}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: this.headers,
    })
    return this.handleResponse<Order>(res)
  }

  async getBills(storeId: string): Promise<Bill[]> {
    const res = await fetch(`${this.baseUrl}/bills?storeId=${storeId}`, { headers: this.headers })
    return this.handleResponse<Bill[]>(res)
  }

  async createBill(data: Partial<Bill>): Promise<Bill> {
    const res = await fetch(`${this.baseUrl}/bills`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    })
    return this.handleResponse<Bill>(res)
  }

  async queueBill(data: { orderId: string; tableNumber: number; invoiceNo: string; subtotal: number; taxTotal: number; discount: number; total: number; paymentMethod: string; customerName?: string; storeId: string }): Promise<{ success: boolean; queueId: string }> {
    const res = await fetch(`${this.baseUrl}/bills/queue`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    })
    return this.handleResponse<{ success: boolean; queueId: string }>(res)
  }

  async getNextInvoiceNo(storeId: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/bills/next-invoice-no?storeId=${storeId}`, { headers: this.headers })
    const data = await this.handleResponse<{ invoiceNo: string }>(res)
    return data.invoiceNo
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/users/change-password`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    await this.handleResponse(res)
  }

  async getSystemStats(): Promise<SystemStats> {
    const res = await fetch(`${this.baseUrl}/system/stats`, { headers: this.headers })
    return this.handleResponse<SystemStats>(res)
  }

  async getAppUpdate(platform: string): Promise<AppUpdate | null> {
    const res = await fetch(`${this.baseUrl}/app-update?platform=${platform}`, { headers: this.headers })
    const data = await this.handleResponse<AppUpdate & { enabled: boolean }>(res)
    if (!data || !data.enabled) return null
    return data
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { headers: this.headers })
      return res.status === 200
    } catch {
      return false
    }
  }
}

export const api = new ApiService()
