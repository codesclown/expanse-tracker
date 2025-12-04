'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { useNotification } from '@/contexts/NotificationContext'
import { exportToExcel, exportDetailedReport, getDateRangeFilters } from '@/lib/exportUtils'

interface ReportsModalProps {
  isOpen: boolean
  onClose: () => void
  expenses: any[]
  incomes: any[]
  categories: string[]
}

export default function ReportsModal({ isOpen, onClose, expenses, incomes, categories }: ReportsModalProps) {
  const [reportType, setReportType] = useState<'day' | 'month' | 'year'>('month')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [useCustomRange, setUseCustomRange] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotification()

  if (!isOpen) return null

  const getFilteredData = () => {
    let dateFrom: string, dateTo: string

    if (useCustomRange) {
      dateFrom = customDateFrom
      dateTo = customDateTo
    } else {
      const dateRange = getDateRangeFilters(reportType, new Date(selectedDate))
      dateFrom = dateRange.dateFrom
      dateTo = dateRange.dateTo
    }

    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date).toISOString().split('T')[0]
      const matchesDate = expenseDate >= dateFrom && expenseDate <= dateTo
      const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory
      return matchesDate && matchesCategory
    })

    const filteredIncomes = incomes.filter(income => {
      const incomeDate = new Date(income.date).toISOString().split('T')[0]
      return incomeDate >= dateFrom && incomeDate <= dateTo
    })

    return { filteredExpenses, filteredIncomes, dateFrom, dateTo }
  }

  const handleExportExpenses = () => {
    const { filteredExpenses, dateFrom, dateTo } = getFilteredData()
    
    if (filteredExpenses.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Data',
        message: 'No expenses found for the selected period.',
        duration: 3000
      })
      return
    }

    exportToExcel(filteredExpenses, 'expenses', { dateFrom, dateTo, category: selectedCategory, type: reportType })
    addNotification({
      type: 'success',
      title: 'Export Successful',
      message: `Exported ${filteredExpenses.length} expenses to Excel.`,
      duration: 4000
    })
  }

  const handleExportIncomes = () => {
    const { filteredIncomes, dateFrom, dateTo } = getFilteredData()
    
    if (filteredIncomes.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Data',
        message: 'No incomes found for the selected period.',
        duration: 3000
      })
      return
    }

    exportToExcel(filteredIncomes, 'incomes', { dateFrom, dateTo, type: reportType })
    addNotification({
      type: 'success',
      title: 'Export Successful',
      message: `Exported ${filteredIncomes.length} incomes to Excel.`,
      duration: 4000
    })
  }

  const handleExportDetailedReport = () => {
    const { filteredExpenses, filteredIncomes, dateFrom, dateTo } = getFilteredData()
    
    if (filteredExpenses.length === 0 && filteredIncomes.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Data',
        message: 'No transactions found for the selected period.',
        duration: 3000
      })
      return
    }

    exportDetailedReport(filteredExpenses, filteredIncomes, { dateFrom, dateTo, category: selectedCategory, type: reportType })
    addNotification({
      type: 'success',
      title: 'Report Generated',
      message: 'Detailed financial report exported successfully.',
      duration: 4000
    })
  }

  const handleEmailReport = async () => {
    setLoading(true)
    try {
      let dateFrom: string, dateTo: string

      if (useCustomRange) {
        dateFrom = customDateFrom
        dateTo = customDateTo
      } else {
        const dateRange = getDateRangeFilters(reportType, new Date(selectedDate))
        dateFrom = dateRange.dateFrom
        dateTo = dateRange.dateTo
      }

      const result = await api.sendEmailReport({
        dateFrom,
        dateTo,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        type: reportType
      })

      addNotification({
        type: 'success',
        title: 'Email Sent',
        message: 'Financial report has been sent to your email.',
        duration: 4000
      })

      onClose()
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Email Failed',
        message: error.message || 'Failed to send email report.',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const getPeriodDescription = () => {
    if (useCustomRange) {
      return `${customDateFrom} to ${customDateTo}`
    }

    const date = new Date(selectedDate)
    switch (reportType) {
      case 'day':
        return date.toLocaleDateString('en-IN')
      case 'month':
        return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      case 'year':
        return date.getFullYear().toString()
      default:
        return 'Selected period'
    }
  }

  const { filteredExpenses, filteredIncomes } = getFilteredData()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass rounded-2xl shadow-premium-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="heading-card">Export & Email Reports</h2>
              <p className="text-xs text-muted-foreground">Generate and share your financial reports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Period Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">📅 Select Period</h3>
            
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="customRange"
                checked={useCustomRange}
                onChange={(e) => setUseCustomRange(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="customRange" className="text-sm text-foreground">Use custom date range</label>
            </div>

            {useCustomRange ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">From Date</label>
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="input-premium w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">To Date</label>
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="input-premium w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as 'day' | 'month' | 'year')}
                    className="input-premium w-full"
                  >
                    <option value="day">Daily</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-premium w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">🏷️ Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-premium w-full"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-secondary/20 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">📊 Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Period:</span>
                <p className="font-medium text-foreground">{getPeriodDescription()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <p className="font-medium text-foreground">{selectedCategory}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Expenses:</span>
                <p className="font-medium text-foreground">{filteredExpenses.length} transactions</p>
              </div>
              <div>
                <span className="text-muted-foreground">Incomes:</span>
                <p className="font-medium text-foreground">{filteredIncomes.length} transactions</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">📤 Export Options</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleExportExpenses}
                className="btn-premium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center justify-center gap-2 py-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Expenses
              </button>

              <button
                onClick={handleExportIncomes}
                className="btn-premium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2 py-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Incomes
              </button>

              <button
                onClick={handleExportDetailedReport}
                className="btn-premium bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white flex items-center justify-center gap-2 py-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Detailed Report
              </button>

              <button
                onClick={handleEmailReport}
                disabled={loading}
                className="btn-premium bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white flex items-center justify-center gap-2 py-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                Email Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}