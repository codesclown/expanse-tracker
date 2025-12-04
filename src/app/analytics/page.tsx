'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useExpenses } from '@/hooks/useExpenses'
import { useIncomes } from '@/hooks/useIncomes'
import BottomNav from '@/components/BottomNav'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, RadialBarChart, RadialBar
} from 'recharts'
import { exportToExcel, generateFinancialSummary } from '@/lib/exportUtils'
import { calculateFinancialHealthScore } from '@/lib/healthScore'
import { InfoTooltip, TipTooltip } from '@/components/Tooltip'

export default function Analytics() {
  const { theme, toggleTheme, isTransitioning } = useTheme()
  const { addNotification } = useNotification()
  const { summary, loading: analyticsLoading } = useAnalytics()
  const { expenses, loading: expensesLoading } = useExpenses()
  const { incomes, loading: incomesLoading } = useIncomes()
  
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [exportLoading, setExportLoading] = useState(false)

  // Calculate comprehensive analytics data
  const analyticsData = {
    // Monthly trend data
    monthlyTrend: generateMonthlyTrend(),
    // Category breakdown
    categoryData: generateCategoryData(),
    // Income vs Expense comparison
    incomeExpenseData: generateIncomeExpenseData(),
    // Daily spending pattern
    dailyPattern: generateDailyPattern(),
    // Payment method distribution
    paymentMethods: generatePaymentMethodData(),
    // Savings rate over time
    savingsRate: generateSavingsRateData(),
    // Top spending categories
    topCategories: generateTopCategories(),
    // Budget vs actual
    budgetComparison: generateBudgetComparison(),
    // Expense growth rate
    growthRate: calculateGrowthRate(),
    // Financial health score
    healthScore: calculateFinancialHealthScore(expenses, incomes)
  }

  function generateMonthlyTrend() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, index) => {
      const monthExpenses = expenses.filter(e => new Date(e.date).getMonth() === index)
      const monthIncomes = incomes.filter(i => new Date(i.date).getMonth() === index)
      return {
        month,
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
        income: monthIncomes.reduce((sum, i) => sum + i.amount, 0),
        savings: monthIncomes.reduce((sum, i) => sum + i.amount, 0) - monthExpenses.reduce((sum, e) => sum + e.amount, 0)
      }
    })
  }

  function generateCategoryData() {
    const categories = {}
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount
    })
    return Object.entries(categories).map(([name, value]) => ({ name, value }))
  }

  function generateIncomeExpenseData() {
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      const monthExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date)
        return expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear()
      })
      
      const monthIncomes = incomes.filter(i => {
        const incomeDate = new Date(i.date)
        return incomeDate.getMonth() === date.getMonth() && incomeDate.getFullYear() === date.getFullYear()
      })

      last6Months.push({
        month: monthName,
        income: monthIncomes.reduce((sum, i) => sum + i.amount, 0),
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
      })
    }
    return last6Months
  }

  function generateDailyPattern() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day, index) => {
      const dayExpenses = expenses.filter(e => new Date(e.date).getDay() === (index + 1) % 7)
      return {
        day,
        amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0) / (dayExpenses.length || 1)
      }
    })
  }

  function generatePaymentMethodData() {
    const methods = {}
    expenses.forEach(expense => {
      const method = expense.paymentMode || 'Cash'
      methods[method] = (methods[method] || 0) + expense.amount
    })
    return Object.entries(methods).map(([name, value]) => ({ name, value }))
  }

  function generateSavingsRateData() {
    return generateMonthlyTrend().map(item => ({
      month: item.month,
      rate: item.income > 0 ? ((item.savings / item.income) * 100).toFixed(1) : 0
    }))
  }

  function generateTopCategories() {
    return generateCategoryData()
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }

  function generateBudgetComparison() {
    const budgets = {
      'Food': 15000,
      'Transport': 8000,
      'Shopping': 10000,
      'Entertainment': 5000,
      'Bills': 12000
    }
    
    return Object.entries(budgets).map(([category, budget]) => {
      const actual = expenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0)
      return {
        category,
        budget,
        actual,
        percentage: (actual / budget) * 100
      }
    })
  }

  function calculateGrowthRate() {
    const thisMonth = expenses.filter(e => {
      const date = new Date(e.date)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).reduce((sum, e) => sum + e.amount, 0)

    const lastMonth = expenses.filter(e => {
      const date = new Date(e.date)
      const lastMonthDate = new Date()
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear()
    }).reduce((sum, e) => sum + e.amount, 0)

    return lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0
  }



  const handleExport = async (type: 'excel') => {
    setExportLoading(true)
    try {
      const report = generateFinancialSummary(expenses, incomes)
      exportToExcel([report], 'financial-analytics')
      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: 'Analytics data exported to Excel successfully.',
        duration: 4000
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export analytics data. Please try again.',
        duration: 4000
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Financial Analytics Report',
          text: `My financial summary: Income: ₹${incomes.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}, Expenses: ₹${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to clipboard
      const shareText = `Financial Analytics Report\nIncome: ₹${incomes.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}\nExpenses: ₹${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}\nSavings: ₹${(incomes.reduce((sum, i) => sum + i.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}`
      
      navigator.clipboard.writeText(shareText)
      addNotification({
        type: 'success',
        title: 'Copied to Clipboard',
        message: 'Analytics summary copied to clipboard.',
        duration: 3000
      })
    }
  }

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1']

  const loading = analyticsLoading || expensesLoading || incomesLoading

  return (
    <>
      <div className="min-h-screen bg-premium-mesh pt-20 pb-20 md:pt-0 md:pb-8 md:pl-64 lg:pl-72">
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
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm text-white/80 font-medium bg-white/10 px-2 py-1 rounded-full">
                        Insights
                      </span>
                      <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                      <span className="text-xs text-white/60 flex items-center gap-1">
                        <span>Health Score:</span>
                        <span className="currency-symbol-large text-white/80">{analyticsData.healthScore}%</span>
                      </span>
                    </div>
                    <h1 className="heading-page">Financial Analytics</h1>
                  </div>
                </div>
                <p className="text-sm md:text-base text-white/80 max-w-md">
                  Comprehensive insights and detailed analysis of your financial data
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Export & Share Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={exportLoading}
                    className="p-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                    title="Export to Excel"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
                    title="Share Report"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <svg
                      className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${
                        theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Simple Header */}
        <div className="md:hidden fixed top-12 left-0 right-0 z-40 px-4 py-3 bg-background/95 backdrop-blur-xl border-b border-border/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">Analytics</h1>
              <p className="text-xs text-muted-foreground">
                Health Score: {analyticsData.healthScore}% • {expenses.length + incomes.length} transactions
              </p>
            </div>
            <button
              onClick={() => handleExport('excel')}
              disabled={exportLoading}
              className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-4 md:-mt-12 pb-safe relative z-10 space-y-8">
          {/* Mobile-Friendly Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-in">
            {/* Health Score - Most Important */}
            <div className="md:col-span-2 lg:col-span-1 glass-premium rounded-2xl p-6 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-105 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold text-violet-600 mb-1">{analyticsData.healthScore}%</p>
              <p className="text-sm text-muted-foreground">Financial Health</p>
            </div>

            {/* Income */}
            <div className="glass-premium rounded-2xl p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-lg">₹</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-emerald-600">₹{incomes.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Income</p>
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="glass-premium rounded-2xl p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-red-600">₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Expenses</p>
                </div>
              </div>
            </div>

            {/* Savings */}
            <div className="glass-premium rounded-2xl p-4 border border-border/20 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-blue-600">₹{(incomes.reduce((sum, i) => sum + i.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0)).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Net Savings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Trend Chart */}
            <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Monthly Trend</h3>
                  <p className="text-sm text-muted-foreground">Income vs Expenses over time</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={analyticsData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="month" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: '1px solid ' + (theme === 'dark' ? '#374151' : '#E5E7EB'),
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="savings" stroke="#8B5CF6" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown Pie Chart */}
            <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Expense Categories</h3>
                  <p className="text-sm text-muted-foreground">Spending distribution by category</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: '1px solid ' + (theme === 'dark' ? '#374151' : '#E5E7EB'),
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* More Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income vs Expense Comparison */}
            <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Income vs Expenses</h3>
                  <p className="text-sm text-muted-foreground">Last 6 months comparison</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.incomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="month" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: '1px solid ' + (theme === 'dark' ? '#374151' : '#E5E7EB'),
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Methods Distribution */}
            <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Payment Methods</h3>
                  <p className="text-sm text-muted-foreground">How you spend your money</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={analyticsData.paymentMethods}>
                  <RadialBar
                    minAngle={15}
                    label={{ position: 'insideStart', fill: '#fff' }}
                    background
                    clockWise
                    dataKey="value"
                    fill="#8884d8"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: '1px solid ' + (theme === 'dark' ? '#374151' : '#E5E7EB'),
                      borderRadius: '8px'
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Spending Pattern & Savings Rate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Daily Spending Pattern */}
            <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Daily Spending Pattern</h3>
                  <p className="text-sm text-muted-foreground">Average spending by day of week</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.dailyPattern}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="day" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: '1px solid ' + (theme === 'dark' ? '#374151' : '#E5E7EB'),
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#EC4899" fill="#EC4899" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Savings Rate Trend */}
            <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Savings Rate Trend</h3>
                  <p className="text-sm text-muted-foreground">Monthly savings percentage</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.savingsRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="month" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: '1px solid ' + (theme === 'dark' ? '#374151' : '#E5E7EB'),
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#06B6D4" strokeWidth={3} dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget vs Actual Comparison */}
          <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">Budget vs Actual Spending</h3>
                <p className="text-sm text-muted-foreground">How well you're sticking to your budget</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData.budgetComparison} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis type="number" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <YAxis dataKey="category" type="category" stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: '1px solid ' + (theme === 'dark' ? '#374151' : '#E5E7EB'),
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="budget" fill="#94A3B8" radius={[0, 4, 4, 0]} />
                <Bar dataKey="actual" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Growth Rate</h3>
              <p className="text-3xl font-bold text-emerald-600 mb-2">{analyticsData.growthRate}%</p>
              <p className="text-sm text-muted-foreground">Month over month change</p>
            </div>

            <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Transactions</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">{expenses.length + incomes.length}</p>
              <p className="text-sm text-muted-foreground">Total recorded transactions</p>
            </div>

            <div className="glass-premium rounded-2xl p-6 border border-border/20 shadow-premium text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Health Score</h3>
              <p className="text-3xl font-bold text-violet-600 mb-2">{analyticsData.healthScore}%</p>
              <p className="text-sm text-muted-foreground">Financial wellness indicator</p>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  )
}