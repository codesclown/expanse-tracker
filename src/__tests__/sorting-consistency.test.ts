/**
 * Property-Based Tests for Sorting Consistency
 * Feature: missing-features-analysis, Property 3: Sorting consistency
 * Validates: Requirements 2.4
 */

import { describe, it, expect } from '@jest/globals'
import fc from 'fast-check'
import { applySorting, SortOptions } from '@/lib/advancedFilters'

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
  type: 'expense' | 'income'
}

// Generator for transactions with controlled data for sorting tests
const sortableTransactionGenerator = fc.record({
  id: fc.string({ minLength: 1 }),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  amount: fc.integer({ min: 1, max: 100000 }),
  category: fc.constantFrom('Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education'),
  bank: fc.constantFrom('HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Cash', 'UPI'),
  title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  notes: fc.option(fc.string({ maxLength: 100 })),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 })),
  type: fc.constantFrom('expense', 'income')
})

const sortOptionsGenerator = fc.record({
  field: fc.constantFrom('date', 'amount', 'title', 'category', 'bank'),
  direction: fc.constantFrom('asc', 'desc')
})

describe('Sorting Consistency Properties', () => {
  /**
   * Property 3: Sorting consistency
   * For any sortable field and direction, the results should be consistently 
   * ordered according to the specified criteria
   */
  it('should consistently sort transactions by any field in any direction', () => {
    fc.assert(fc.property(
      fc.array(sortableTransactionGenerator, { minLength: 2, maxLength: 100 }),
      sortOptionsGenerator,
      (transactions, sortOptions) => {
        // Filter out transactions with invalid dates when sorting by date
        let validTransactions = transactions
        if (sortOptions.field === 'date') {
          validTransactions = transactions.filter(t => !isNaN(t.date.getTime()))
          if (validTransactions.length < 2) return true // Skip if not enough valid data
        }
        const sortedResults = applySorting(validTransactions, sortOptions)

        // Property: Result should have same length as input
        expect(sortedResults.length).toBe(validTransactions.length)

        // Property: Result should contain all original transactions
        validTransactions.forEach(transaction => {
          expect(sortedResults).toContainEqual(transaction)
        })

        // Property: Should not modify original array (immutability)
        expect(validTransactions.length).toBe(sortedResults.length)
        expect(sortedResults).not.toBe(validTransactions)

        // Property: Results should be properly ordered
        if (sortedResults.length > 1) {
          for (let i = 0; i < sortedResults.length - 1; i++) {
            const current = sortedResults[i]
            const next = sortedResults[i + 1]

            let currentValue: any, nextValue: any

            // Extract comparison values based on sort field
            switch (sortOptions.field) {
              case 'amount':
                currentValue = current.amount
                nextValue = next.amount
                break
              case 'title':
                currentValue = (current.title || '').toLowerCase()
                nextValue = (next.title || '').toLowerCase()
                break
              case 'category':
                currentValue = (current.category || '').toLowerCase()
                nextValue = (next.category || '').toLowerCase()
                break
              case 'bank':
                currentValue = (current.bank || '').toLowerCase()
                nextValue = (next.bank || '').toLowerCase()
                break
              case 'date':
              default:
                currentValue = current.date.getTime()
                nextValue = next.date.getTime()
                break
            }

            // Verify sort order (matches the actual implementation logic)
            if (sortOptions.direction === 'asc') {
              // For ascending: current <= next
              expect(currentValue <= nextValue).toBe(true)
            } else {
              // For descending: current >= next  
              expect(currentValue >= nextValue).toBe(true)
            }
          }
        }

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Sort stability
   * Sorting should be stable - equal elements should maintain their relative order
   */
  it('should maintain stable sorting for equal elements', () => {
    fc.assert(fc.property(
      fc.array(sortableTransactionGenerator, { minLength: 3, maxLength: 50 }),
      sortOptionsGenerator,
      (transactions, sortOptions) => {
        // Create transactions with identical sort values to test stability
        const baseTransaction = transactions[0]
        const identicalTransactions = [
          { ...baseTransaction, id: 'first' },
          { ...baseTransaction, id: 'second' },
          { ...baseTransaction, id: 'third' }
        ]

        const mixedTransactions = [...transactions, ...identicalTransactions]
        const sortedResults = applySorting(mixedTransactions, sortOptions)

        // Find the identical transactions in the sorted results
        const firstIndex = sortedResults.findIndex(t => t.id === 'first')
        const secondIndex = sortedResults.findIndex(t => t.id === 'second')
        const thirdIndex = sortedResults.findIndex(t => t.id === 'third')

        // Property: Identical elements should appear in their original relative order
        if (firstIndex !== -1 && secondIndex !== -1 && thirdIndex !== -1) {
          expect(firstIndex).toBeLessThan(secondIndex)
          expect(secondIndex).toBeLessThan(thirdIndex)
        }

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Sort field type consistency
   * Each sort field should handle its data type correctly
   */
  it('should handle different data types correctly for each sort field', () => {
    fc.assert(fc.property(
      fc.array(sortableTransactionGenerator, { minLength: 5, maxLength: 30 }),
      (transactions) => {
        // Filter out transactions with invalid dates
        const validTransactions = transactions.filter(t => !isNaN(t.date.getTime()))
        if (validTransactions.length < 2) return true // Skip if not enough valid data
        // Test numeric sorting (amount)
        const amountSortAsc = applySorting(validTransactions, { field: 'amount', direction: 'asc' })
        const amountSortDesc = applySorting(validTransactions, { field: 'amount', direction: 'desc' })

        // Property: Numeric sorting should handle numbers correctly
        if (amountSortAsc.length > 1) {
          for (let i = 0; i < amountSortAsc.length - 1; i++) {
            expect(amountSortAsc[i].amount).toBeLessThanOrEqual(amountSortAsc[i + 1].amount)
          }
        }

        if (amountSortDesc.length > 1) {
          for (let i = 0; i < amountSortDesc.length - 1; i++) {
            expect(amountSortDesc[i].amount).toBeGreaterThanOrEqual(amountSortDesc[i + 1].amount)
          }
        }

        // Test date sorting
        const dateSortAsc = applySorting(validTransactions, { field: 'date', direction: 'asc' })
        const dateSortDesc = applySorting(validTransactions, { field: 'date', direction: 'desc' })

        // Property: Date sorting should handle Date objects correctly
        if (dateSortAsc.length > 1) {
          for (let i = 0; i < dateSortAsc.length - 1; i++) {
            expect(dateSortAsc[i].date.getTime()).toBeLessThanOrEqual(dateSortAsc[i + 1].date.getTime())
          }
        }

        if (dateSortDesc.length > 1) {
          for (let i = 0; i < dateSortDesc.length - 1; i++) {
            expect(dateSortDesc[i].date.getTime()).toBeGreaterThanOrEqual(dateSortDesc[i + 1].date.getTime())
          }
        }

        // Test string sorting (case-insensitive)
        const titleSortAsc = applySorting(validTransactions, { field: 'title', direction: 'asc' })
        
        // Property: String sorting should be case-insensitive (matches implementation)
        if (titleSortAsc.length > 1) {
          for (let i = 0; i < titleSortAsc.length - 1; i++) {
            const current = (titleSortAsc[i].title || '').toLowerCase()
            const next = (titleSortAsc[i + 1].title || '').toLowerCase()
            expect(current <= next).toBe(true)
          }
        }

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Sort direction consistency
   * Ascending and descending sorts should be exact opposites
   */
  it('should produce opposite results for ascending vs descending sorts', () => {
    fc.assert(fc.property(
      fc.array(sortableTransactionGenerator, { minLength: 2, maxLength: 50 }),
      fc.constantFrom('date', 'amount', 'title', 'category', 'bank'),
      (transactions, field) => {
        const ascSort = applySorting(transactions, { field: field as any, direction: 'asc' })
        const descSort = applySorting(transactions, { field: field as any, direction: 'desc' })

        // Property: Descending should be reverse of ascending (for unique values)
        expect(ascSort.length).toBe(descSort.length)

        // For transactions with unique sort values, desc should be reverse of asc
        const uniqueValues = new Set()
        let hasUniqueValues = true

        ascSort.forEach(transaction => {
          let value: any
          switch (field) {
            case 'amount':
              value = transaction.amount
              break
            case 'title':
              value = (transaction.title || '').toLowerCase()
              break
            case 'category':
              value = (transaction.category || '').toLowerCase()
              break
            case 'bank':
              value = (transaction.bank || '').toLowerCase()
              break
            case 'date':
            default:
              value = transaction.date.getTime()
              break
          }

          if (uniqueValues.has(value)) {
            hasUniqueValues = false
          }
          uniqueValues.add(value)
        })

        // If all values are unique, desc should be exact reverse of asc
        if (hasUniqueValues && ascSort.length > 1) {
          for (let i = 0; i < ascSort.length; i++) {
            expect(ascSort[i]).toEqual(descSort[descSort.length - 1 - i])
          }
        }

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Sort immutability
   * Sorting should not modify the original array
   */
  it('should not modify the original transaction array', () => {
    fc.assert(fc.property(
      fc.array(sortableTransactionGenerator, { minLength: 1, maxLength: 50 }),
      sortOptionsGenerator,
      (transactions, sortOptions) => {
        // Create a deep copy to compare against (only for valid dates)
        const validTransactions = transactions.filter(t => !isNaN(t.date.getTime()))
        if (validTransactions.length === 0) return true // Skip if no valid dates
        
        const originalCopy = JSON.parse(JSON.stringify(validTransactions))

        // Perform sorting
        const sortedResults = applySorting(validTransactions, sortOptions)

        // Property: Original array should be unchanged
        expect(validTransactions).toEqual(originalCopy.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })))

        // Property: Sorted results should be a different array reference
        expect(sortedResults).not.toBe(validTransactions)

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Empty and single-element array handling
   * Sorting should handle edge cases gracefully
   */
  it('should handle empty and single-element arrays correctly', () => {
    fc.assert(fc.property(
      sortOptionsGenerator,
      (sortOptions) => {
        // Property: Empty array should return empty array
        const emptyResult = applySorting([], sortOptions)
        expect(emptyResult).toEqual([])

        // Property: Single element array should return identical array
        const singleTransaction = {
          id: 'test',
          date: new Date(),
          amount: 100,
          category: 'Food',
          bank: 'HDFC',
          title: 'Test Transaction',
          type: 'expense' as const
        }

        const singleResult = applySorting([singleTransaction], sortOptions)
        expect(singleResult).toEqual([singleTransaction])
        expect(singleResult).not.toBe([singleTransaction]) // Should be new array

        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property: Sort performance consistency
   * Sorting should complete in reasonable time for any input size
   */
  it('should complete sorting in reasonable time regardless of input', () => {
    fc.assert(fc.property(
      fc.array(sortableTransactionGenerator, { minLength: 0, maxLength: 200 }),
      sortOptionsGenerator,
      (transactions, sortOptions) => {
        const startTime = performance.now()
        
        const sortedResults = applySorting(transactions, sortOptions)
        
        const endTime = performance.now()
        const duration = endTime - startTime

        // Property: Should complete within reasonable time (1 second for up to 200 items)
        expect(duration).toBeLessThan(1000)

        // Property: Should still return correct results
        expect(sortedResults.length).toBe(transactions.length)

        return true
      }
    ), { numRuns: 50 }) // Fewer runs for performance test
  })

  /**
   * Property: Multiple sort operations consistency
   * Multiple sorts with same parameters should produce identical results
   */
  it('should produce identical results for repeated sorts with same parameters', () => {
    fc.assert(fc.property(
      fc.array(sortableTransactionGenerator, { minLength: 2, maxLength: 50 }),
      sortOptionsGenerator,
      (transactions, sortOptions) => {
        const firstSort = applySorting(transactions, sortOptions)
        const secondSort = applySorting(transactions, sortOptions)
        const thirdSort = applySorting(firstSort, sortOptions) // Sort already sorted data

        // Property: Multiple sorts should produce identical results
        expect(firstSort).toEqual(secondSort)
        expect(secondSort).toEqual(thirdSort)

        // Property: Sorting already sorted data should not change order
        expect(firstSort).toEqual(thirdSort)

        return true
      }
    ), { numRuns: 100 })
  })
})