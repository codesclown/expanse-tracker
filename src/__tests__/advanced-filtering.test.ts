/**
 * Property-Based Tests for Advanced Filtering Completeness
 * Feature: missing-features-analysis, Property 2: Advanced filtering completeness
 * Validates: Requirements 2.1, 2.2, 2.3, 2.5
 */

import { describe, it, expect } from '@jest/globals'
import fc from 'fast-check'
import { 
  applyAdvancedFilters, 
  searchTransactions, 
  fuzzyMatch,
  AdvancedExpenseFilters 
} from '@/lib/advancedFilters'

// Mock transaction type for testing
interface MockTransaction {
  id: string
  date: Date
  amount: number
  category: string
  bank: string
  title: string
  notes?: string
  tags?: string[]
  receiptUrl?: string
  type: 'expense' | 'income'
}

// Generators for property-based testing
const transactionGenerator = fc.record({
  id: fc.string({ minLength: 1 }),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  amount: fc.integer({ min: 1, max: 100000 }),
  category: fc.constantFrom('Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education'),
  bank: fc.constantFrom('HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'Cash', 'UPI'),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  notes: fc.option(fc.string({ maxLength: 100 })),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })),
  receiptUrl: fc.option(fc.string()),
  type: fc.constantFrom('expense', 'income')
})

const filterGenerator = fc.record({
  startDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') })),
  endDate: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })),
  category: fc.option(fc.constantFrom('Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health')),
  bank: fc.option(fc.constantFrom('HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'Cash')),
  minAmount: fc.option(fc.integer({ min: 0, max: 50000 })),
  maxAmount: fc.option(fc.integer({ min: 0, max: 100000 })),
  hasReceipt: fc.option(fc.boolean()),
  type: fc.option(fc.constantFrom('expense', 'income', 'all')),
  search: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 15 }), { maxLength: 3 }))
})

describe('Advanced Filtering Completeness Properties', () => {
  /**
   * Property 2: Advanced filtering completeness
   * For any combination of filters, the results should include all and only 
   * transactions that match ALL applied criteria
   */
  it('should include all and only transactions that match ALL applied filter criteria', () => {
    fc.assert(fc.property(
      fc.array(transactionGenerator, { minLength: 0, maxLength: 100 }),
      filterGenerator,
      (transactions, filters) => {
        // Ensure date range is valid (startDate <= endDate)
        if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
          const temp = filters.startDate
          filters.startDate = filters.endDate
          filters.endDate = temp
        }
        
        // Ensure amount range is valid (minAmount <= maxAmount)
        if (filters.minAmount !== undefined && filters.maxAmount !== undefined && filters.minAmount > filters.maxAmount) {
          const temp = filters.minAmount
          filters.minAmount = filters.maxAmount
          filters.maxAmount = temp
        }

        const filteredResults = applyAdvancedFilters(transactions, filters)

        // Property: Every result should match ALL applied filters
        filteredResults.forEach(transaction => {
          // Type filter
          if (filters.type && filters.type !== 'all') {
            expect(transaction.type).toBe(filters.type)
          }

          // Category filter
          if (filters.category) {
            expect(transaction.category).toBe(filters.category)
          }

          // Bank filter
          if (filters.bank) {
            expect(transaction.bank).toBe(filters.bank)
          }

          // Date range filter
          if (filters.startDate) {
            expect(transaction.date.getTime()).toBeGreaterThanOrEqual(filters.startDate.getTime())
          }
          if (filters.endDate) {
            expect(transaction.date.getTime()).toBeLessThanOrEqual(filters.endDate.getTime())
          }

          // Amount range filter
          if (filters.minAmount !== undefined) {
            expect(transaction.amount).toBeGreaterThanOrEqual(filters.minAmount)
          }
          if (filters.maxAmount !== undefined) {
            expect(transaction.amount).toBeLessThanOrEqual(filters.maxAmount)
          }

          // Receipt filter
          if (filters.hasReceipt !== undefined) {
            const hasReceipt = !!(transaction.receiptUrl)
            expect(hasReceipt).toBe(filters.hasReceipt)
          }

          // Tags filter
          if (filters.tags && filters.tags.length > 0) {
            const transactionTags = transaction.tags || []
            const hasMatchingTag = filters.tags.some(filterTag => 
              transactionTags.some(transactionTag => 
                transactionTag.toLowerCase().includes(filterTag.toLowerCase())
              )
            )
            expect(hasMatchingTag).toBe(true)
          }

          // Search filter
          if (filters.search) {
            const searchFields = [
              transaction.title || '',
              transaction.category || '',
              transaction.bank || '',
              transaction.notes || '',
              ...(transaction.tags || [])
            ]
            const matchesSearch = searchFields.some(field => fuzzyMatch(field, filters.search!))
            expect(matchesSearch).toBe(true)
          }
        })

        // Property: Every transaction that matches all filters should be included
        transactions.forEach(transaction => {
          let shouldBeIncluded = true

          // Check each filter condition
          if (filters.type && filters.type !== 'all' && transaction.type !== filters.type) {
            shouldBeIncluded = false
          }
          if (filters.category && transaction.category !== filters.category) {
            shouldBeIncluded = false
          }
          if (filters.bank && transaction.bank !== filters.bank) {
            shouldBeIncluded = false
          }
          if (filters.startDate && transaction.date < filters.startDate) {
            shouldBeIncluded = false
          }
          if (filters.endDate && transaction.date > filters.endDate) {
            shouldBeIncluded = false
          }
          if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) {
            shouldBeIncluded = false
          }
          if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) {
            shouldBeIncluded = false
          }
          if (filters.hasReceipt !== undefined) {
            const hasReceipt = !!(transaction.receiptUrl)
            if (hasReceipt !== filters.hasReceipt) {
              shouldBeIncluded = false
            }
          }
          if (filters.tags && filters.tags.length > 0) {
            const transactionTags = transaction.tags || []
            const hasMatchingTag = filters.tags.some(filterTag => 
              transactionTags.some(transactionTag => 
                transactionTag.toLowerCase().includes(filterTag.toLowerCase())
              )
            )
            if (!hasMatchingTag) {
              shouldBeIncluded = false
            }
          }
          if (filters.search) {
            const searchFields = [
              transaction.title || '',
              transaction.category || '',
              transaction.bank || '',
              transaction.notes || '',
              ...(transaction.tags || [])
            ]
            const matchesSearch = searchFields.some(field => fuzzyMatch(field, filters.search!))
            if (!matchesSearch) {
              shouldBeIncluded = false
            }
          }

          if (shouldBeIncluded) {
            expect(filteredResults).toContainEqual(transaction)
          }
        })

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Fuzzy search accuracy
   * Fuzzy matching should correctly identify partial matches and handle typos
   */
  it('should correctly perform fuzzy matching for search queries', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 30 }),
      fc.string({ minLength: 1, maxLength: 20 }),
      (text, query) => {
        const result = fuzzyMatch(text, query)

        // Property: Exact substring matches should always return true
        if (text.toLowerCase().includes(query.toLowerCase())) {
          expect(result).toBe(true)
        }

        // Property: Empty query should always return true
        if (query.trim() === '') {
          expect(fuzzyMatch(text, '')).toBe(true)
        }

        // Property: Query longer than text should use fuzzy logic
        if (query.length > text.length) {
          // Should handle this gracefully (may be true or false)
          expect(typeof result).toBe('boolean')
        }

        // Property: Identical strings should match
        expect(fuzzyMatch(text, text)).toBe(true)

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Multi-field search consistency
   * Search should consistently work across all searchable fields
   */
  it('should consistently search across all specified fields', () => {
    fc.assert(fc.property(
      fc.array(transactionGenerator, { minLength: 1, maxLength: 50 }),
      fc.constantFrom('Food', 'Transport', 'HDFC', 'SBI', 'expense', 'income', 'a', 'e', 'o'),
      (transactions, searchQuery) => {
        const searchResults = searchTransactions(transactions, searchQuery)

        // Property: Every result should match the search query in at least one field
        searchResults.forEach(transaction => {
          const searchFields = [
            transaction.title || '',
            transaction.category || '',
            transaction.bank || '',
            transaction.notes || '',
            ...(transaction.tags || [])
          ]

          const hasMatch = searchFields.some(field => fuzzyMatch(field, searchQuery))
          expect(hasMatch).toBe(true)
        })

        // Property: Every transaction with a matching field should be included
        transactions.forEach(transaction => {
          const searchFields = [
            transaction.title || '',
            transaction.category || '',
            transaction.bank || '',
            transaction.notes || '',
            ...(transaction.tags || [])
          ]

          const hasMatch = searchFields.some(field => fuzzyMatch(field, searchQuery))
          if (hasMatch) {
            expect(searchResults).toContainEqual(transaction)
          }
        })

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Filter combination logic (AND operation)
   * Multiple filters should be combined with AND logic, not OR
   */
  it('should combine multiple filters with AND logic', () => {
    fc.assert(fc.property(
      fc.array(transactionGenerator, { minLength: 10, maxLength: 50 }),
      (transactions) => {
        // Create a filter with multiple conditions
        const multiFilter: AdvancedExpenseFilters = {
          type: 'expense',
          minAmount: 100,
          maxAmount: 5000,
          category: 'Food'
        }

        const results = applyAdvancedFilters(transactions, multiFilter)

        // Property: ALL results must satisfy ALL filter conditions
        results.forEach(transaction => {
          expect(transaction.type).toBe('expense')
          expect(transaction.amount).toBeGreaterThanOrEqual(100)
          expect(transaction.amount).toBeLessThanOrEqual(5000)
          expect(transaction.category).toBe('Food')
        })

        // Property: Result count should be <= individual filter counts
        const typeOnlyResults = applyAdvancedFilters(transactions, { type: 'expense' })
        const amountOnlyResults = applyAdvancedFilters(transactions, { minAmount: 100, maxAmount: 5000 })
        const categoryOnlyResults = applyAdvancedFilters(transactions, { category: 'Food' })

        expect(results.length).toBeLessThanOrEqual(typeOnlyResults.length)
        expect(results.length).toBeLessThanOrEqual(amountOnlyResults.length)
        expect(results.length).toBeLessThanOrEqual(categoryOnlyResults.length)

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Filter result count accuracy
   * The number of filtered results should be mathematically consistent
   */
  it('should return accurate result counts for any filter combination', () => {
    fc.assert(fc.property(
      fc.array(transactionGenerator, { minLength: 0, maxLength: 100 }),
      filterGenerator,
      (transactions, filters) => {
        // Normalize filters
        if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
          [filters.startDate, filters.endDate] = [filters.endDate, filters.startDate]
        }
        if (filters.minAmount !== undefined && filters.maxAmount !== undefined && filters.minAmount > filters.maxAmount) {
          [filters.minAmount, filters.maxAmount] = [filters.maxAmount, filters.minAmount]
        }

        const filteredResults = applyAdvancedFilters(transactions, filters)

        // Property: Result count should never exceed original count
        expect(filteredResults.length).toBeLessThanOrEqual(transactions.length)

        // Property: Result count should be non-negative
        expect(filteredResults.length).toBeGreaterThanOrEqual(0)

        // Property: If no filters applied, should return all transactions
        const emptyFilters: AdvancedExpenseFilters = {}
        const noFilterResults = applyAdvancedFilters(transactions, emptyFilters)
        expect(noFilterResults.length).toBe(transactions.length)

        // Property: More restrictive filters should return fewer or equal results
        if (filters.category) {
          const lessRestrictiveFilters = { ...filters }
          delete lessRestrictiveFilters.category
          const lessRestrictiveResults = applyAdvancedFilters(transactions, lessRestrictiveFilters)
          expect(filteredResults.length).toBeLessThanOrEqual(lessRestrictiveResults.length)
        }

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Date range filtering accuracy
   * Date filtering should correctly handle edge cases and boundary conditions
   */
  it('should accurately filter by date ranges including boundary conditions', () => {
    fc.assert(fc.property(
      fc.array(transactionGenerator, { minLength: 5, maxLength: 30 }),
      fc.date({ min: new Date('2022-01-01'), max: new Date('2024-12-31') }),
      fc.date({ min: new Date('2022-01-01'), max: new Date('2024-12-31') }),
      (transactions, date1, date2) => {
        // Filter out transactions with invalid dates
        const validTransactions = transactions.filter(t => !isNaN(t.date.getTime()))
        if (validTransactions.length === 0) return true // Skip if no valid dates
        
        // Skip if filter dates are invalid
        if (isNaN(date1.getTime()) || isNaN(date2.getTime())) return true
        
        const startDate = date1 <= date2 ? date1 : date2
        const endDate = date1 <= date2 ? date2 : date1

        const dateFilter: AdvancedExpenseFilters = { startDate, endDate }
        const results = applyAdvancedFilters(validTransactions, dateFilter)

        // Property: All results should be within the date range (inclusive)
        results.forEach(transaction => {
          expect(transaction.date.getTime()).toBeGreaterThanOrEqual(startDate.getTime())
          expect(transaction.date.getTime()).toBeLessThanOrEqual(endDate.getTime())
        })

        // Property: Transactions exactly on boundary dates should be included
        const boundaryTransactions = validTransactions.filter(t => 
          t.date.getTime() === startDate.getTime() || t.date.getTime() === endDate.getTime()
        )
        boundaryTransactions.forEach(transaction => {
          expect(results).toContainEqual(transaction)
        })

        return true
      }
    ), { numRuns: 100 })
  })
})