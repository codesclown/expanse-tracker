'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, salary?: number) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password)
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } catch (error: any) {
      // Clear any existing user data on login failure
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      throw error
    }
  }

  const register = async (name: string, email: string, password: string, salary?: number) => {
    try {
      const data = await api.register(name, email, password, salary)
      setUser(data.user)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } catch (error: any) {
      // Clear any existing user data on registration failure
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      throw error
    }
  }

  const logout = () => {
    api.clearToken()
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
