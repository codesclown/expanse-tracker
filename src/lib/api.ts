const API_BASE = '/api'

export class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  // Auth
  async login(email: string, password: string) {
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      this.setToken(data.token)
      return data
    } catch (error: any) {
      console.error('API login error:', error)
      // If API fails, check local storage
      const localUser = localStorage.getItem('user')
      if (localUser) {
        const user = JSON.parse(localUser)
        if (user.email === email) {
          this.setToken(user.token)
          return { token: user.token, user }
        }
      }
      throw new Error('Login failed. Please register first.')
    }
  }

  async register(name: string, email: string, password: string, salary?: number) {
    try {
      const data = await this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, salary }),
      })
      this.setToken(data.token)
      return data
    } catch (error: any) {
      console.error('API register error:', error)
      // If API fails, create a local user
      const localUser = {
        id: Date.now().toString(),
        name,
        email,
        token: 'local-' + Date.now()
      }
      this.setToken(localUser.token)
      localStorage.setItem('user', JSON.stringify(localUser))
      return { token: localUser.token, user: localUser }
    }
  }

  // Expenses
  async getExpenses(filters?: any) {
    const params = new URLSearchParams(filters).toString()
    return this.request(`/expenses${params ? `?${params}` : ''}`)
  }

  async createExpense(expense: any) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    })
  }

  async updateExpense(id: string, expense: any) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    })
  }

  async deleteExpense(id: string) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    })
  }

  // Subscriptions
  async getSubscriptions() {
    return this.request('/subscriptions')
  }

  async detectSubscriptions() {
    return this.request('/subscriptions/detect', {
      method: 'POST',
    })
  }

  // Smart Score
  async getSmartScore(year: number, month: number) {
    return this.request(`/smart-score/monthly?year=${year}&month=${month}`)
  }

  async recalculateSmartScore(year: number, month: number) {
    return this.request('/smart-score/recalculate', {
      method: 'POST',
      body: JSON.stringify({ year, month }),
    })
  }

  // Chat
  async chatQuery(query: string) {
    return this.request('/chat/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
  }
}

export const api = new ApiClient()
