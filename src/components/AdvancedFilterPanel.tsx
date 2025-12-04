'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdvancedExpenseFilters, SortOptions, getFilterSummary } from '@/lib/advancedFilters'

interface AdvancedFilterPanelProps {
  filters: AdvancedExpenseFilters
  sort: SortOptions
  onFiltersChange: (filters: AdvancedExpenseFilters) => void
  onSortChange: (sort: SortOptions) => void
  onClearAll: () => void
  categories: string[]
  banks: string[]
  resultCount: number
  totalCount: number
}

export default function AdvancedFilterPanel({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onClearAll,
  categories,
  banks,
  resultCount,
  totalCount
}: AdvancedFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localMinAmount, setLocalMinAmount] = useState(filters.minAmount?.toString() || '')
  const [localMaxAmount, setLocalMaxAmount] = useState(filters.maxAmount?.toString() || '')
  const [amountDebounceTimer, setAmountDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Debounced amount filter updates
  const updateAmountFilters = useCallback((min: string, max: string) => {
    const minAmount = min ? parseFloat(min) : undefined
    const maxAmount = max ? parseFloat(max) : undefined
    
    onFiltersChange({
      ...filters,
      minAmount: minAmount && !isNaN(minAmount) ? minAmount : undefined,
      maxAmount: maxAmount && !isNaN(maxAmount) ? maxAmount : undefined
    })
  }, [filters, onFiltersChange])

  useEffect(() => {
    if (amountDebounceTimer) {
      clearTimeout(amountDebounceTimer)
    }
    
    const timer = setTimeout(() => {
      updateAmountFilters(localMinAmount, localMaxAmount)
    }, 500)
    
    setAmountDebounceTimer(timer)
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [localMinAmount, localMaxAmount, updateAmountFilters])

  const handleFilterChange = (key: keyof AdvancedExpenseFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleSortChange = (field: SortOptions['field']) => {
    if (sort.field === field) {
      // Toggle direction if same field
      onSortChange({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc'
      })
    } else {
      // New field, default to desc
      onSortChange({
        field,
        direction: 'desc'
      })
    }
  }

  const activeFiltersCount = getFilterSummary(filters).length
  const hasActiveFilters = activeFiltersCount > 0

  return (
    <div className="glass-premium rounded-xl md:rounded-2xl p-3 md:p-4 border border-border/20 shadow-premium animate-slide-in">
      {/* Header with Results Count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm md:text-base font-semibold text-foreground">Advanced Filters</h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg">
              {resultCount} of {totalCount}
            </span>
            {hasActiveFilters && (
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-lg">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary rounded-lg transition-all duration-200 flex items-center gap-1"
          >
            <span>{isExpanded ? 'Less' : 'More'} Filters</span>
            <svg 
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Basic Filters - Always Visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Type Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Type</label>
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value === 'all' ? undefined : e.target.value)}
            className="input-premium w-full px-3 py-2.5 text-sm font-medium"
          >
            <option value="all">All</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Category</label>
          <select
            value={filters.category || 'All'}
            onChange={(e) => handleFilterChange('category', e.target.value === 'All' ? undefined : e.target.value)}
            className="input-premium w-full px-3 py-2.5 text-sm font-medium"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Bank Filter */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Payment Method</label>
          <select
            value={filters.bank || 'All'}
            onChange={(e) => handleFilterChange('bank', e.target.value === 'All' ? undefined : e.target.value)}
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
              value={sort.field}
              onChange={(e) => handleSortChange(e.target.value as SortOptions['field'])}
              className="input-premium flex-1 px-3 py-2.5 text-sm font-medium"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="bank">Bank</option>
            </select>
            <button
              onClick={() => onSortChange({ ...sort, direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
              className="px-3 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
              title={`Sort ${sort.direction === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <svg className={`w-4 h-4 transition-transform ${sort.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-border/20 animate-slide-in">
          {/* Amount Range Sliders */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-foreground">Amount Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Min Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <input
                    type="number"
                    value={localMinAmount}
                    onChange={(e) => setLocalMinAmount(e.target.value)}
                    placeholder="0"
                    className="input-premium w-full pl-8 pr-3 py-2.5 text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Max Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <input
                    type="number"
                    value={localMaxAmount}
                    onChange={(e) => setLocalMaxAmount(e.target.value)}
                    placeholder="No limit"
                    className="input-premium w-full pl-8 pr-3 py-2.5 text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Receipt Status</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('hasReceipt', undefined)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  filters.hasReceipt === undefined
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('hasReceipt', true)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
                  filters.hasReceipt === true
                    ? 'bg-emerald-500 text-white'
                    : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                With Receipt
              </button>
              <button
                onClick={() => handleFilterChange('hasReceipt', false)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
                  filters.hasReceipt === false
                    ? 'bg-amber-500 text-white'
                    : 'bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Without Receipt
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <label className="text-xs font-medium text-foreground">Custom Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">From Date</label>
                <input
                  type="date"
                  value={filters.startDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="input-premium w-full px-3 py-2.5 text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">To Date</label>
                <input
                  type="date"
                  value={filters.endDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value ? new Date(e.target.value) : undefined)}
                  className="input-premium w-full px-3 py-2.5 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border/20">
          <div className="flex flex-wrap gap-2">
            {getFilterSummary(filters).map((summary, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg"
              >
                {summary}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}