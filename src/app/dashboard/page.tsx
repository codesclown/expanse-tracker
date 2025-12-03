'use client'

import { useState, useMemo } from 'react'
import BottomNav from '@/components/BottomNav'
import AddExpenseModal from '@/components/AddExpenseModal'
import AddIncomeModal from '@/components/AddIncomeModal'
import { useExpenses } from '@/hooks/useExpenses'
import { useIncomes } from '@/hooks/useIncomes'
import { useTheme } from '@/contexts/ThemeContext'

export default function Dashboard() {
  const { expenses, addExpense, loading: expensesLoading } = useExpenses()
  const { incomes, addIncome, loading: incomesLoading } = useIncomes()
  const { theme, toggleTheme, isTransitioning } = useTheme()

  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('month')

  // Calculate financial metrics
  const totalExpense = expenses.reduce((sum: number, e: any) => sum + e.amount, 0)
  const totalIncome = incomes.reduce((sum: number, i: any) => sum + i.amount, 0)
  const savings = totalIncome - totalExpense
  const smartScore = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0

  // Category breakdown
  const categoryData = useMemo(() => {
    return expenses.reduce((acc: any, e: any) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
  }, [expenses])

  // Monthly trend data (last 6 months)
  const monthlyTrends = useMemo(() => {
    const months = []
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const monthExpenses = expenses.filter((e: any) => {
        const expenseDate = new Date(e.date)
        return expenseDate.getFullYear() === date.getFullYear() && 
               expenseDate.getMonth() === date.getMonth()
      }).reduce((sum: number, e: any) => sum + e.amount, 0)

      const monthIncomes = incomes.filter((i: any) => {
        const incomeDate = new Date(i.date)
        return incomeDate.getFullYear() === date.getFullYear() && 
               incomeDate.getMonth() === date.getMonth()
      }).reduce((sum: number, i: any) => sum + i.amount, 0)

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        expenses: monthExpenses,
        income: monthIncomes,
        savings: monthIncomes - monthExpenses
      })
    }
    return months
  }, [expenses, incomes])

  // Recent transactions
  const recentTransactions = useMemo(() => {
    return [...expenses, ...incomes.map((i: any) => ({ ...i, type: 'income' }))]
      .sort((a, b) => {
        // Sort by timestamp first (most recently added), then by date
        const aTime = a.timestamp || new Date(a.createdAt || a.date).getTime()
        const bTime = b.timestamp || new Date(b.createdAt || b.date).getTime()
        return bTime - aTime
      })
      .slice(0, 8)
  }, [expenses, incomes])

  // Top categories
  const topCategories = useMemo(() => {
    return Object.entries(categoryData)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
  }, [categoryData])

  const handleAddExpense = async (expense: any) => {
    await addExpense(expense)
    setShowExpenseModal(false)
  }

  const handleAddIncome = async (income: any) => {
    await addIncome(income)
    setShowIncomeModal(false)
  }

  // Chart component for category breakdown
  const CategoryChart = ({ data }: { data: [string, number][] }) => {
    const total = data.reduce((sum, [, amount]) => sum + amount, 0)
    const colors = ['from-violet-500 to-purple-600', 'from-indigo-500 to-blue-600', 'from-purple-500 to-violet-600', 'from-blue-500 to-indigo-600', 'from-slate-500 to-gray-600']
    
    return (
      <div className="space-y-3">
        {data.map(([category, amount], index) => {
          const percentage = total > 0 ? (amount / total) * 100 : 0
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{category}</span>
                <span className="text-muted-foreground">₹{amount.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-1000 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {percentage.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Simple line chart for trends
  const TrendChart = ({ data }: { data: any[] }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.income, d.expenses)))
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
            <span className="text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full"></div>
            <span className="text-muted-foreground">Expenses</span>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2 h-32">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center justify-end space-y-1">
              <div className="flex flex-col justify-end items-center space-y-1 h-24 w-full">
                <div 
                  className="w-3 bg-gradient-to-t from-emerald-500 to-teal-600 rounded-t-sm transition-all duration-1000"
                  style={{ height: `${maxValue > 0 ? (item.income / maxValue) * 100 : 0}%` }}
                />
                <div 
                  className="w-3 bg-gradient-to-t from-rose-500 to-pink-600 rounded-t-sm transition-all duration-1000"
                  style={{ height: `${maxValue > 0 ? (item.expenses / maxValue) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Show loading state to prevent hydration issues
  if (expensesLoading || incomesLoading) {
    return (
      <div className="min-h-screen bg-premium-mesh pb-32 md:pb-8 md:pl-64 lg:pl-72 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-premium-mesh pb-32 md:pb-8 md:pl-64 lg:pl-72">
        {/* Header */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-white space-y-2">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm text-white/80 font-medium bg-white/10 px-2 py-1 rounded-full">
                        Dashboard
                      </span>
                      <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                      <span className="text-xs text-white/60">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Financial Overview</h1>
                  </div>
                </div>
                <p className="text-sm md:text-base text-white/80 max-w-md">
                  Track your spending, monitor your savings, and achieve your financial goals.
                </p>
              </div>

              {/* THEME TOGGLE */}
              <button
                onClick={toggleTheme}
                disabled={isTransitioning}
                aria-label="Toggle theme"
                className={`theme-toggle-btn flex-shrink-0 p-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl ${
                  isTransitioning ? 'animate-theme-toggle' : ''
                } disabled:opacity-50`}
              >
                <div className="relative w-5 h-5 md:w-6 md:h-6">
                  <svg
                    className={`absolute inset-0 w-5 h-5 md:w-6 md:h-6 text-white transition-all duration-300 ${
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
                    className={`absolute inset-0 w-5 h-5 md:w-6 md:h-6 text-white transition-all duration-300 ${
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

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-8 pb-safe relative z-10 space-y-6">
          {/* BALANCE CARD */}
          <section className="glass rounded-3xl border border-border shadow-premium p-6 md:p-8 animate-slide-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/30 dark:to-cyan-900/30 border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="relative">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse block" />
                    <span className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Current Balance
                  </span>
                </div>
                <div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {savings >= 0
                      ? 'Available funds for your spending and investments.'
                      : 'You are currently over your budget limit.'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${savings >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-muted-foreground">
                      {savings >= 0 ? 'Healthy financial status' : 'Budget exceeded'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <div className="space-y-2">
                  <p
                    className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${
                      savings >= 0
                        ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent'
                        : 'bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent'
                    }`}
                  >
                    ₹{Math.abs(savings).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-center lg:justify-end gap-2">
                    <span className={`text-sm font-medium ${
                      savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                    }`}>
                      {savings >= 0 ? 'Available' : 'Over budget'}
                    </span>
                    <svg className={`w-4 h-4 ${
                      savings >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={savings >= 0 ? "M7 11l5-5m0 0l5 5m-5-5v12" : "M17 13l-5 5m0 0l-5-5m5 5V6"} />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TOP METRIC CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* INCOME */}
            <div className="glass rounded-3xl p-6 border border-border shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                  Income
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  ₹{totalIncome.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">This month</span>
                  <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+12.5%</span>
                </div>
              </div>
            </div>

            {/* EXPENSES */}
            <div className="glass rounded-3xl p-6 border border-border shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 13l-5 5m0 0l-5-5m5 5V6"
                    />
                  </svg>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200/50 dark:border-rose-800/50">
                  Expenses
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  ₹{totalExpense.toLocaleString()}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">This month</span>
                  <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                  <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">-8.3%</span>
                </div>
              </div>
            </div>

            {/* SMART SCORE */}
            <div className="glass rounded-3xl p-6 border border-border shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                    smartScore >= 70
                      ? 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600'
                      : smartScore >= 40
                      ? 'bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600'
                      : 'bg-gradient-to-br from-red-500 via-rose-600 to-pink-600'
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                    smartScore >= 70
                      ? 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 border-violet-200/50 dark:border-violet-800/50'
                      : smartScore >= 40
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/50'
                  }`}
                >
                  Health Score
                </span>
              </div>
              <div className="space-y-2">
                <p
                  className={`text-3xl font-bold ${
                    smartScore >= 70
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'
                      : smartScore >= 40
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'
                  }`}
                >
                  {smartScore}%
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Financial health</span>
                  <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                  <span className={`text-xs font-medium ${
                    smartScore >= 70 ? 'text-violet-600 dark:text-violet-400' : 
                    smartScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {smartScore >= 70 ? 'Excellent' : smartScore >= 40 ? 'Good' : 'Needs attention'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setShowExpenseModal(true)}
              className="group w-full rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-600 text-white p-6 md:p-8 flex items-center justify-between shadow-premium-lg hover:shadow-premium-lg hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-lg md:text-xl font-bold mb-1">
                    Add Expense
                  </p>
                  <p className="text-sm md:text-base text-white/90">
                    Track your spending
                  </p>
                </div>
              </div>
              <svg
                className="w-7 h-7 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>

            <button
              onClick={() => setShowIncomeModal(true)}
              className="group w-full rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white p-6 md:p-8 flex items-center justify-between shadow-premium-lg hover:shadow-premium-lg hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-lg md:text-xl font-bold mb-1">
                    Add Income
                  </p>
                  <p className="text-sm md:text-base text-white/90">
                    Record earnings
                  </p>
                </div>
              </div>
              <svg
                className="w-7 h-7 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </section>

          {/* ANALYTICS + RECENT ACTIVITY */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CATEGORY BREAKDOWN */}
            <div className="glass rounded-2xl p-5 md:p-6 border border-border shadow-premium-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h2 className="text-base md:text-lg font-semibold text-foreground">
                  Spending by Category
                </h2>
                <div className="flex items-center gap-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 px-1 py-1">
                  {(['day', 'week', 'month', 'year'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setView(v)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        view === v
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-300 shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {Object.keys(categoryData).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(categoryData).map(
                    ([category, amount]: [string, any]) => {
                      const percentage =
                        totalExpense > 0 ? (amount / totalExpense) * 100 : 0
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">
                              {category}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              ₹{amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-right text-muted-foreground">
                            {percentage.toFixed(1)}% of total spending
                          </p>
                        </div>
                      )
                    }
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 mx-auto flex items-center justify-center mb-3">
                    <svg
                      className="w-7 h-7 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    No expenses yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your first expense to start seeing insights.
                  </p>
                </div>
              )}
            </div>

            {/* RECENT ACTIVITY */}
            <div className="glass rounded-2xl p-5 md:p-6 border border-border shadow-premium-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base md:text-lg font-semibold text-foreground">
                  Recent Activity
                </h2>
                <span className="text-xs text-muted-foreground">
                  Last {recentTransactions.length || 0} expenses
                </span>
              </div>

              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        transaction.type === 'income' 
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' 
                          : 'bg-gradient-to-br from-red-400 to-red-600'
                      }`}>
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={transaction.type === 'income' 
                              ? "M7 11l5-5m0 0l5 5m-5-5v12" 
                              : "M17 13l-5 5m0 0l-5-5m5 5V6"
                            }
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {transaction.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {transaction.category} •{' '}
                          {transaction.createdAt 
                            ? new Date(transaction.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : new Date(transaction.date).toLocaleDateString()
                          }
                        </p>
                      </div>
                      <p className={`text-sm font-bold ${
                        transaction.type === 'income' 
                          ? 'text-emerald-500 dark:text-emerald-400' 
                          : 'text-red-500 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 mx-auto flex items-center justify-center mb-3">
                    <svg
                      className="w-7 h-7 text-slate-400"
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
                  <p className="text-sm font-medium text-foreground">
                    No transactions yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your latest expenses will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      {/* MODALS + BOTTOM NAV (MOBILE) */}
      <AddExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={handleAddExpense}
      />

      <AddIncomeModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSave={handleAddIncome}
      />

      <BottomNav />
    </>
  )
}
