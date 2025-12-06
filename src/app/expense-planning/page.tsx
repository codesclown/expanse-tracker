'use client'

import { useState, useEffect, useMemo } from 'react'
import BottomNav from '@/components/BottomNav'
import ExpensePlanningModal from '@/components/ExpensePlanningModal'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/contexts/NotificationContext'
import { useTheme } from '@/contexts/ThemeContext'

interface ExpensePlan {
  id: string
  title: string
  amount: number
  category: 'trip' | 'festival' | 'other' | 'monthly' | 'yearly'
  date: string
  description?: string
  actualAmount?: number
  isCompleted?: boolean
  createdAt: string
}

const categories = [
  { id: 'trip', label: 'Trip Expense', icon: '✈️', color: 'from-blue-500 to-cyan-600' },
  { id: 'festival', label: 'Festival Expense', icon: '🎉', color: 'from-purple-500 to-pink-600' },
  { id: 'other', label: 'Other Daily', icon: '📝', color: 'from-green-500 to-emerald-600' },
  { id: 'monthly', label: 'Monthly Expense', icon: '📅', color: 'from-orange-500 to-red-600' },
  { id: 'yearly', label: 'Yearly Expense', icon: '🗓️', color: 'from-red-500 to-rose-600' }
]

export default function ExpensePlanning() {
  const { user } = useAuth()
  const router = useRouter()
  const { addNotification } = useNotification()
  const { theme, toggleTheme, isTransitioning } = useTheme()
  
  const [expenses, setExpenses] = useState<ExpensePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [editingExpense, setEditingExpense] = useState<ExpensePlan | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadExpenses()
  }, [user, router])

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/expense-planning', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load expense plans. Please try again.',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (expenseData: any) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/expense-planning', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          title: expenseData.title,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date,
          description: expenseData.notes
        })
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Expense Planned',
          message: `₹${expenseData.amount.toLocaleString()} planned for ${expenseData.title}`,
          duration: 4000
        })
        loadExpenses()
        setShowAddModal(false)
      } else {
        throw new Error('Failed to save expense plan')
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save expense plan. Please try again.',
        duration: 4000
      })
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense plan?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/expense-planning/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Plan Deleted',
          message: 'Expense plan has been deleted successfully.',
          duration: 3000
        })
        loadExpenses()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete expense plan. Please try again.',
        duration: 4000
      })
    }
  }

  const handleMarkComplete = async (expense: ExpensePlan, actualAmount: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/expense-planning/${expense.id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          actualAmount,
          isCompleted: true
        })
      })

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Expense Completed',
          message: `Marked ${expense.title} as completed with ₹${actualAmount.toLocaleString()}`,
          duration: 4000
        })
        loadExpenses()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update expense. Please try again.',
        duration: 4000
      })
    }
  }

  // Filter and calculate stats
  const filteredExpenses = selectedCategory 
    ? expenses.filter(expense => expense.category === selectedCategory)
    : expenses

  const stats = useMemo(() => {
    const planned = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const actual = filteredExpenses.reduce((sum, expense) => sum + (expense.actualAmount || 0), 0)
    const completed = filteredExpenses.filter(e => e.isCompleted).length
    const pending = filteredExpenses.filter(e => !e.isCompleted).length
    
    return { planned, actual, completed, pending, total: filteredExpenses.length }
  }, [filteredExpenses])

  if (!user) return null

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-premium-mesh pt-16 pb-20 md:pt-0 md:pb-8 md:pl-64 lg:pl-72">
          <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 mt-16 md:-mt-12 pb-safe relative z-10 space-y-4 md:space-y-6">
            {/* Loading skeleton */}
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted/50 rounded-xl w-48"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-muted/50 rounded-xl"></div>
                ))}
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted/50 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-premium-mesh pt-16 pb-20 md:pt-0 md:pb-8 md:pl-64 lg:pl-72">
        {/* Desktop Header */}
        <header className="md:block hidden relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm text-white/80 font-medium bg-white/10 px-2 py-1 rounded-full">
                        Planning
                      </span>
                      <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                      <span className="text-xs text-white/60 flex items-center gap-1">
                        <span>{stats.total} plans •</span>
                        <span className="currency-symbol-large text-white/80">₹</span>
                        <span>{stats.planned.toLocaleString()} planned</span>
                      </span>
                    </div>
                    <h1 className="heading-page">Expense Planning</h1>
                  </div>
                </div>
                <p className="text-sm md:text-base text-white/80 max-w-md">
                  Plan your upcoming expenses and track expected vs actual costs
                </p>
              </div>

              <button
                onClick={toggleTheme}
                disabled={isTransitioning}
                aria-label="Toggle theme"
                className={`theme-toggle-btn flex-shrink-0 p-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isTransitioning ? 'animate-theme-toggle' : ''
                } disabled:opacity-50`}
              >
                <div className="relative w-6 h-6">
                  <svg
                    className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${
                      theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                  <svg
                    className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${
                      theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 px-3 py-2 bg-background/98 backdrop-blur-xl border-b border-border/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-foreground">Expense Planning</h1>
              <p className="text-xs text-muted-foreground">
                {stats.total} plans • ₹{stats.planned.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 mt-16 md:-mt-12 pb-safe relative z-10 space-y-4 md:space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-slide-in">
            {/* Planned Amount */}
            <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-medium">Planned</span>
              </div>
              <div>
                <p className="metric-value text-blue-600">
                  <span className="currency-symbol">₹</span>{stats.planned.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Planned</p>
              </div>
            </div>

            {/* Actual Amount */}
            <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded font-medium">Actual</span>
              </div>
              <div>
                <p className="metric-value text-emerald-600">
                  <span className="currency-symbol">₹</span>{stats.actual.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>

            {/* Completed */}
            <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">Done</span>
              </div>
              <div>
                <p className="metric-value text-purple-600">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>

            {/* Pending */}
            <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded font-medium">Pending</span>
              </div>
              <div>
                <p className="metric-value text-amber-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium animate-slide-in">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  !selectedCategory 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                All ({expenses.length})
              </button>
              {categories.map((category) => {
                const count = expenses.filter(e => e.category === category.id).length
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="hidden sm:inline">{category.label}</span>
                    <span className="sm:hidden">{category.id}</span>
                    <span className="opacity-60">({count})</span>
                  </button>
                )
              })}
            </div>
          </div>



          {/* Expenses List */}
          <div className="glass-premium rounded-xl md:rounded-2xl border border-border/20 shadow-premium overflow-hidden animate-slide-in">
            {filteredExpenses.length > 0 ? (
              <div className="divide-y divide-border/10">
                {filteredExpenses.map((expense, index) => {
                  const category = categories.find(c => c.id === expense.category)
                  const isOverBudget = expense.actualAmount && expense.actualAmount > expense.amount
                  const variance = expense.actualAmount ? expense.actualAmount - expense.amount : 0
                  
                  return (
                    <div
                      key={expense.id}
                      className="px-3 md:px-6 py-3 md:py-4 hover:bg-secondary/10 transition-all duration-200 group"
                      style={{ animationDelay: `${(index + 3) * 30}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Category Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-200 bg-gradient-to-br ${category?.color}`}>
                            <span className="text-lg text-white">{category?.icon}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Top Row: Title and Status */}
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 pr-2">
                              <h3 className="font-semibold text-sm md:text-base text-foreground truncate group-hover:text-primary transition-colors">
                                {expense.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-secondary text-secondary-foreground">
                                  {category?.label}
                                </span>
                                {expense.isCompleted && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                    ✓ Completed
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(expense.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          {/* Description */}
                          {expense.description && (
                            <p className="text-xs md:text-sm text-muted-foreground mb-2 line-clamp-2">
                              {expense.description}
                            </p>
                          )}

                          {/* Bottom Row: Amounts and Actions */}
                          <div className="flex items-center justify-between">
                            {/* Amounts */}
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-bold text-sm md:text-base text-blue-600 flex items-center gap-0.5">
                                  <span>₹{expense.amount.toLocaleString()}</span>
                                  <span className="text-xs text-muted-foreground font-normal">planned</span>
                                </p>
                                {expense.actualAmount && (
                                  <p className={`font-bold text-sm flex items-center gap-0.5 ${
                                    isOverBudget ? 'text-red-500' : 'text-emerald-500'
                                  }`}>
                                    <span>₹{expense.actualAmount.toLocaleString()}</span>
                                    <span className="text-xs text-muted-foreground font-normal">actual</span>
                                  </p>
                                )}
                              </div>
                              
                              {/* Variance Indicator */}
                              {expense.actualAmount && variance !== 0 && (
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  variance > 0 
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                }`}>
                                  {variance > 0 ? '+' : ''}₹{Math.abs(variance).toLocaleString()}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-70 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              {!expense.isCompleted && (
                                <button
                                  onClick={() => {
                                    const actualAmount = prompt(`Enter actual amount spent for "${expense.title}":`, expense.amount.toString())
                                    if (actualAmount && !isNaN(Number(actualAmount))) {
                                      handleMarkComplete(expense, Number(actualAmount))
                                    }
                                  }}
                                  className="p-1.5 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-all duration-200 hover:scale-110"
                                  title="Mark as completed"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200 hover:scale-110"
                                title="Delete plan"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="heading-card">
                    {selectedCategory ? 'No plans in this category' : 'No expense plans yet'}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                    {selectedCategory 
                      ? `No expense plans found for ${categories.find(c => c.id === selectedCategory)?.label}. Try a different category or create a new plan.`
                      : 'Start planning your upcoming expenses to better manage your budget and track spending.'
                    }
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center items-center mt-4 md:mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 active:scale-95 px-4 py-2 md:px-6 md:py-2.5 text-xs md:text-sm font-semibold group transition-all duration-200 rounded-xl inline-flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Plan Your First Expense
                  </button>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory('')}
                      className="px-3 py-1.5 md:px-4 md:py-2 text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-xl text-xs md:text-sm font-medium transition-all duration-200 active:scale-95"
                    >
                      View All Plans
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Premium Floating Action Button - Mobile Only */}
      <button
        onClick={() => setShowAddModal(true)}
        className="md:hidden fixed bottom-28 right-3 w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 text-white rounded-xl shadow-2xl hover:shadow-purple-500/25 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 group border border-white/10"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300"></div>
          <svg className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>

      <ExpensePlanningModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddExpense}
      />

      <BottomNav />
    </>
  )
}