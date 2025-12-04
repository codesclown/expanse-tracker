'use client'

import { useState, useMemo } from 'react'
import BottomNav from '@/components/BottomNav'
import AddExpenseModal from '@/components/AddExpenseModal'
import EditExpenseModal from '@/components/EditExpenseModal'
import ReportsModal from '@/components/ReportsModal'
import { 
  HeaderSkeleton, 
  CardSkeleton, 
  FilterSkeleton, 
  ListItemSkeleton 
} from '@/components/Skeleton'
import { useExpenses } from '@/hooks/useExpenses'
import { useIncomes } from '@/hooks/useIncomes'
import { InfoTooltip } from '@/components/Tooltip'
import { useTheme } from '@/contexts/ThemeContext'
import { useNotification } from '@/contexts/NotificationContext'

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense, loading } = useExpenses()
  const { incomes } = useIncomes()
  const { theme, toggleTheme, isTransitioning } = useTheme()
  const { addNotification } = useNotification()
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('All')
  const [amountFilter, setAmountFilter] = useState('All')
  const [bankFilter, setBankFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleAddExpense = async (expense: any) => {
    await addExpense(expense)
    setShowAddModal(false)
  }

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense)
    setShowEditModal(true)
  }

  const handleUpdateExpense = async (expense: any) => {
    await updateExpense(expense)
    setShowEditModal(false)
    setEditingExpense(null)
  }

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id)
        addNotification({
          type: 'success',
          title: 'Expense Deleted',
          message: 'The expense has been successfully deleted.',
          duration: 3000
        })
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete the expense. Please try again.',
          duration: 4000
        })
      }
    }
  }

  // Advanced filtering and sorting
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      // Category filter
      if (categoryFilter !== 'All' && expense.category !== categoryFilter) return false
      
      // Bank filter
      if (bankFilter !== 'All' && expense.bank !== bankFilter) return false
      
      // Date filter
      if (dateFilter !== 'All') {
        const expenseDate = new Date(expense.date)
        const now = new Date()
        
        switch (dateFilter) {
          case 'Today':
            if (expenseDate.toDateString() !== now.toDateString()) return false
            break
          case 'This Week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (expenseDate < weekAgo) return false
            break
          case 'This Month':
            if (expenseDate.getMonth() !== now.getMonth() || expenseDate.getFullYear() !== now.getFullYear()) return false
            break
          case 'This Year':
            if (expenseDate.getFullYear() !== now.getFullYear()) return false
            break
        }
      }
      
      // Amount filter
      if (amountFilter !== 'All') {
        const amount = expense.amount
        switch (amountFilter) {
          case 'Under ₹100':
            if (amount >= 100) return false
            break
          case '₹100-₹500':
            if (amount < 100 || amount > 500) return false
            break
          case '₹500-₹1000':
            if (amount < 500 || amount > 1000) return false
            break
          case 'Over ₹1000':
            if (amount <= 1000) return false
            break
        }
      }
      
      // Search filter
      if (search.trim()) {
        const searchTerm = search.toLowerCase().trim()
        return (
          expense.title.toLowerCase().includes(searchTerm) ||
          expense.category.toLowerCase().includes(searchTerm) ||
          (expense.bank && expense.bank.toLowerCase().includes(searchTerm)) ||
          (expense.tags && expense.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))) ||
          (expense.notes && expense.notes.toLowerCase().includes(searchTerm))
        )
      }
      
      return true
    })
    
    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'category':
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        case 'date':
        default:
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return filtered
  }, [expenses, categoryFilter, bankFilter, dateFilter, amountFilter, search, sortBy, sortOrder])

  // Get unique values for filters
  const categories = ['All', ...Array.from(new Set(expenses.map(e => e.category)))]
  const banks = ['All', ...Array.from(new Set(expenses.map(e => e.bank).filter(Boolean)))]
  
  // Statistics
  const stats = useMemo(() => {
    const total = filteredAndSortedExpenses.reduce((sum, e) => sum + e.amount, 0)
    const average = filteredAndSortedExpenses.length > 0 ? total / filteredAndSortedExpenses.length : 0
    const highest = filteredAndSortedExpenses.length > 0 ? Math.max(...filteredAndSortedExpenses.map(e => e.amount)) : 0
    
    return { total, average, highest, count: filteredAndSortedExpenses.length }
  }, [filteredAndSortedExpenses])

  // Reports function
  const handleOpenReports = () => {
    setShowReportsModal(true)
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-premium-mesh pt-16 pb-20 md:pt-0 md:pb-8 md:pl-64 lg:pl-72">
          {/* Header Skeleton */}
          <HeaderSkeleton />

          {/* Content Skeleton */}
          <main className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 mt-16 md:-mt-12 pb-safe relative z-10 space-y-4 md:space-y-6">
            {/* Statistics Cards Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-slide-in">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>

            {/* Search and Controls Skeleton */}
            <div className="glass-premium rounded-2xl p-4 border border-border/20 shadow-premium animate-pulse">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="w-full h-10 bg-muted/50 rounded-2xl animate-pulse"></div>
                </div>
                <div className="flex gap-3">
                  <div className="w-32 h-10 bg-muted/50 rounded-2xl animate-pulse"></div>
                  <div className="w-24 h-10 bg-muted/50 rounded-2xl animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Filters Skeleton */}
            <FilterSkeleton />

            {/* Expenses List Skeleton */}
            <div className="glass-premium rounded-2xl border border-border/20 shadow-premium overflow-hidden animate-pulse">
              <div className="divide-y divide-border/10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            </div>
          </main>
        </div>
        <BottomNav />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-premium-mesh pt-16 pb-20 md:pt-0 md:pb-8 md:pl-64 lg:pl-72">
        {/* Clean Mobile Header */}
        <header className="md:block hidden relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-600" />
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
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm text-white/80 font-medium bg-white/10 px-2 py-1 rounded-full">
                        Expenses
                      </span>
                      <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                      <span className="text-xs text-white/60 flex items-center gap-1">
                        <span>{stats.count} transactions •</span>
                        <span className="currency-symbol-large text-white/80">₹</span>
                        <span>{stats.total.toLocaleString()} total</span>
                      </span>
                    </div>
                    <h1 className="heading-page">
                      Expense Tracker
                    </h1>
                  </div>
                </div>
                <p className="text-sm md:text-base text-white/80 max-w-md">
                  Monitor and categorize your spending patterns with advanced filtering
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

        {/* Mobile Simple Header */}
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 px-3 py-2 bg-background/98 backdrop-blur-xl border-b border-border/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-foreground">Expenses</h1>
              <p className="text-xs text-muted-foreground">
                {stats.count} transactions • ₹{stats.total.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 mt-16 md:-mt-12 pb-safe relative z-10 space-y-4 md:space-y-6">
          {/* Mobile-Friendly Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-slide-in">
            {/* Total Spent */}
            <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-medium">Total</span>
                  <InfoTooltip 
                    content="Total amount spent across all expense transactions"
                    iconSize="w-2.5 h-2.5"
                  />
                </div>
              </div>
              <div>
                <p className="metric-value text-red-600">
                  <span className="currency-symbol">₹</span>{stats.total.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>

            {/* Count */}
            <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-medium">Count</span>
                  <InfoTooltip 
                    content="Total number of expense transactions recorded"
                    iconSize="w-2.5 h-2.5"
                  />
                </div>
              </div>
              <div>
                <p className="metric-value text-blue-600">{stats.count}</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
            </div>

            {/* Average */}
            <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded font-medium">Avg</span>
                  <InfoTooltip 
                    content="Average amount per expense transaction"
                    iconSize="w-2.5 h-2.5"
                  />
                </div>
              </div>
              <div>
                <p className="metric-value text-amber-600">
                  <span className="currency-symbol">₹</span>{Math.round(stats.average).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
            </div>

            {/* Highest */}
            <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded font-medium">Peak</span>
                  <InfoTooltip 
                    content="Highest single expense transaction amount"
                    iconSize="w-2.5 h-2.5"
                  />
                </div>
              </div>
              <div>
                <p className="metric-value text-rose-600">
                  <span className="currency-symbol">₹</span>{stats.highest.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Highest</p>
              </div>
            </div>
          </div>

          {/* Compact Search and Controls */}
          <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium animate-slide-in">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Compact Search */}
              <div className="flex-1 relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50 flex items-center justify-center"
                    aria-label="Clear search"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search expenses..."
                  className="input-premium w-full pl-10 pr-8 py-2.5 text-sm font-medium placeholder:text-muted-foreground/70"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 md:gap-4">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1 flex items-center justify-center gap-2 px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-semibold text-sm lg:text-base transition-all duration-300 border border-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">Add Expense</span>
                  </div>
                </button>
                
                <button
                  onClick={handleOpenReports}
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white shadow-2xl hover:shadow-emerald-500/25 hover:-translate-y-1 flex items-center justify-center gap-2 px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-semibold text-sm lg:text-base transition-all duration-300 border border-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">Reports</span>
                  </div>
                </button>
              </div>
            </div>
            
            {search && (
              <div className="mt-3 p-2 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-primary">
                    Found {stats.count} expense{stats.count !== 1 ? 's' : ''} matching "{search}"
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Filters - Responsive Design */}
          <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm md:text-base font-semibold text-foreground">Filters & Sorting</h3>
              <button
                onClick={() => {
                  setCategoryFilter('All')
                  setDateFilter('All')
                  setAmountFilter('All')
                  setBankFilter('All')
                  setSearch('')
                  setSortBy('date')
                  setSortOrder('desc')
                }}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-all duration-200"
              >
                Clear All
              </button>
            </div>

            {/* Desktop: Show all filters in a grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-premium w-full px-3 py-2.5 text-sm font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Time Period</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-premium w-full px-3 py-2.5 text-sm font-medium"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>

              {/* Amount Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Amount Range</label>
                <select
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                  className="input-premium w-full px-3 py-2.5 text-sm font-medium"
                >
                  <option value="All">All Amounts</option>
                  <option value="Under ₹100">Under ₹100</option>
                  <option value="₹100-₹500">₹100-₹500</option>
                  <option value="₹500-₹1000">₹500-₹1000</option>
                  <option value="Over ₹1000">Over ₹1000</option>
                </select>
              </div>

              {/* Bank Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Payment Method</label>
                <select
                  value={bankFilter}
                  onChange={(e) => setBankFilter(e.target.value)}
                  className="input-premium w-full px-3 py-2.5 text-sm font-medium"
                >
                  {banks.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-premium flex-1 px-3 py-2.5 text-sm font-medium"
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="title">Title</option>
                    <option value="category">Category</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile: Show only most important filters */}
            <div className="md:hidden grid grid-cols-1 gap-3">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-premium w-full px-3 py-2.5 text-sm font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Time Period</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-premium w-full px-3 py-2.5 text-sm font-medium"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>

              {/* Amount Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Amount Range</label>
                <select
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value)}
                  className="input-premium w-full px-3 py-2.5 text-sm font-medium"
                >
                  <option value="All">All Amounts</option>
                  <option value="Under ₹100">Under ₹100</option>
                  <option value="₹100-₹500">₹100-₹500</option>
                  <option value="₹500-₹1000">₹500-₹1000</option>
                  <option value="Over ₹1000">Over ₹1000</option>
                </select>
              </div>

              {/* Collapsible Advanced Filters for Mobile */}
              <details className="mt-2">
                <summary className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  More Filters
                </summary>
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/20">
                  {/* Bank Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Payment Method</label>
                    <select
                      value={bankFilter}
                      onChange={(e) => setBankFilter(e.target.value)}
                      className="input-premium w-full px-3 py-2 text-sm font-medium"
                    >
                      {banks.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">Sort Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="input-premium w-full px-3 py-2 text-sm font-medium"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Responsive Expenses List - Card layout for mobile, enhanced for desktop */}
          <div className="glass-premium rounded-xl md:rounded-2xl border border-border/20 shadow-premium overflow-hidden animate-slide-in">
            {filteredAndSortedExpenses.length > 0 ? (
              <div className="divide-y divide-border/10">
                {filteredAndSortedExpenses.map((expense, index) => (
                  <div
                    key={expense.id}
                    className="px-3 md:px-6 py-2.5 md:py-4 hover:bg-secondary/10 transition-all duration-200 group"
                    style={{ animationDelay: `${(index + 3) * 30}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Compact Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-all duration-200">
                          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Top Row: Title and Date */}
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-sm md:text-base text-foreground truncate group-hover:text-primary transition-colors pr-2">
                            {expense.title}
                          </h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {expense.createdAt
                              ? `${new Date(expense.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })} ${new Date(expense.createdAt).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}`
                              : `${new Date(expense.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })} ${new Date(expense.date).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}`
                            }
                          </span>
                        </div>

                        {/* Bottom Row: Category, Amount, and Actions */}
                        <div className="flex items-center justify-between">
                          {/* Left: Category and Payment Method */}
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
                              {expense.category}
                            </span>
                            
                            {/* Payment Method Icon - Hidden on mobile, shown on desktop */}
                            <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                              {(expense.paymentMode || 'Cash') === 'Cash' ? (
                                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                              )}
                              <span>{expense.paymentMode || 'Cash'}</span>
                            </div>

                            {/* Tags */}
                            {expense.tags && expense.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                {expense.tags.slice(0, 1).map((tag: string, i: number) => (
                                  <span key={i} className="inline-flex items-center gap-1 px-1 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded">
                                    <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                    {tag}
                                  </span>
                                ))}
                                {expense.tags.length > 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{expense.tags.length - 1}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right: Amount and Actions */}
                          <div className="flex items-center gap-2">
                            {/* Amount */}
                            <div className="text-right">
                              <p className="font-bold text-sm md:text-base text-red-500 flex items-center justify-end gap-0.5">
                                <span className="text-red-600">₹</span>
                                <span>{expense.amount.toLocaleString()}</span>
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-0.5 opacity-70 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditExpense(expense)}
                                className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-all duration-200 hover:scale-110"
                                title="Edit expense"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200 hover:scale-110"
                                title="Delete expense"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="heading-card">
                    {search || categoryFilter !== 'All' || dateFilter !== 'All' || amountFilter !== 'All' || bankFilter !== 'All'
                      ? 'No matching expenses found'
                      : 'No expenses yet'
                    }
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                    {search || categoryFilter !== 'All' || dateFilter !== 'All' || amountFilter !== 'All' || bankFilter !== 'All'
                      ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                      : 'Start tracking your expenses by adding your first transaction.'
                    }
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-premium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 px-6 py-2.5 text-sm font-semibold group transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    {search || categoryFilter !== 'All' || dateFilter !== 'All' || amountFilter !== 'All' || bankFilter !== 'All'
                      ? 'Add New Expense'
                      : 'Add Your First Expense'
                    }
                  </button>
                  {(search || categoryFilter !== 'All' || dateFilter !== 'All' || amountFilter !== 'All' || bankFilter !== 'All') && (
                    <button
                      onClick={() => {
                        setCategoryFilter('All')
                        setDateFilter('All')
                        setAmountFilter('All')
                        setBankFilter('All')
                        setSearch('')
                        setSortBy('date')
                        setSortOrder('desc')
                      }}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
                    >
                      Clear All Filters
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
        className="md:hidden fixed bottom-28 right-3 w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-600 text-white rounded-xl shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 group border border-white/10"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-lg group-hover:scale-110 transition-transform duration-300"></div>
          <svg className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>

      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddExpense}
      />

      <EditExpenseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateExpense}
        expense={editingExpense}
      />

      <ReportsModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        expenses={expenses}
        incomes={incomes}
        categories={categories}
      />

      <BottomNav />
    </>
  )
}