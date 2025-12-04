/**
 * Property-Based Tests for Time-Based View Data Accuracy
 * Feature: missing-features-analysis, Property 1: Time-based view data accuracy
 * Validates: Requirements 1.2, 1.4
 */

import { describe, it, expect } from '@jest/globals'
import fc from 'fast-check'

// Mock data types
interface MockExpense {
  id: string
  date: Date
  amount: number
  category: string
  title: string
}

interface MockIncome {
  id: string
  date: Date
  amount: number
  source: string
}

// Time-based view functions (extracted from analytics page)
function generateDayViewData(expenses: MockExpense[], targetDate: Date) {
  const todayExpenses = expenses.filter(e => 
    e.date.toDateString() === targetDate.toDateString()
  )

  // Hourly timeline
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourExpenses = todayExpenses.filter(e => e.date.getHours() === hour)
    return {
      hour: `${hour}:00`,
      amount: hourExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: hourExpenses.length
    }
  })

  return {
    hourlyData,
    todayTotal: todayExpenses.reduce((sum, e) => sum + e.amount, 0),
    todayCount: todayExpenses.length
  }
}

function generateWeekViewData(expenses: MockExpense[], targetDate: Date) {
  const weekStart = new Date(targetDate)
  weekStart.setDate(targetDate.getDate() - targetDate.getDay())
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const weekExpenses = expenses.filter(e => 
    e.date >= weekStart && e.date <= weekEnd
  )

  const weeklyData = Array.from({ length: 7 }, (_, dayIndex) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + dayIndex)
    
    const dayExpenses = weekExpenses.filter(e => 
      e.date.toDateString() === date.toDateString()
    )

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: dayExpenses.length
    }
  })

  return {
    weeklyData,
    weekTotal: weekExpenses.reduce((sum, e) => sum + e.amount, 0)
  }
}

function generateCustomRangeData(
  expenses: MockExpense[], 
  incomes: MockIncome[], 
  fromDate: Date, 
  toDate: Date
) {
  const rangeExpenses = expenses.filter(e => 
    e.date >= fromDate && e.date <= toDate
  )
  
  const rangeIncomes = incomes.filter(i => 
    i.date >= fromDate && i.date <= toDate
  )

  return {
    totalExpenses: rangeExpenses.reduce((sum, e) => sum + e.amount, 0),
    totalIncome: rangeIncomes.reduce((sum, i) => sum + i.amount, 0),
    transactionCount: rangeExpenses.length + rangeIncomes.length
  }
}

// Generators for property-based testing
const expenseGenerator = fc.record({
  id: fc.string(),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  amount: fc.integer({ min: 1, max: 100000 }),
  category: fc.constantFrom('Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'),
  title: fc.string({ minLength: 1, maxLength: 50 })
})

const incomeGenerator = fc.record({
  id: fc.string(),
  date: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  amount: fc.integer({ min: 1, max: 200000 }),
  source: fc.constantFrom('Salary', 'Freelance', 'Investment', 'Bonus')
})

describe('Time-Based View Data Accuracy Properties', () => {
  /**
   * Property 1: Day view data accuracy
   * For any selected day, the displayed financial data should accurately reflect 
   * transactions within that day and calculations should be mathematically correct
   */
  it('should accurately calculate day view data for any given date', () => {
    fc.assert(fc.property(
      fc.array(expenseGenerator, { minLength: 0, maxLength: 100 }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
      (expenses, targetDate) => {
        const dayView = generateDayViewData(expenses, targetDate)
        
        // Property: Total should equal sum of all expenses for that day
        const expectedTotal = expenses
          .filter(e => e.date.toDateString() === targetDate.toDateString())
          .reduce((sum, e) => sum + e.amount, 0)
        
        expect(dayView.todayTotal).toBe(expectedTotal)
        
        // Property: Count should equal number of expenses for that day
        const expectedCount = expenses
          .filter(e => e.date.toDateString() === targetDate.toDateString())
          .length
        
        expect(dayView.todayCount).toBe(expectedCount)
        
        // Property: Hourly data should sum to total
        const hourlySum = dayView.hourlyData.reduce((sum, hour) => sum + hour.amount, 0)
        expect(hourlySum).toBe(dayView.todayTotal)
        
        // Property: Hourly counts should sum to total count
        const hourlyCountSum = dayView.hourlyData.reduce((sum, hour) => sum + hour.count, 0)
        expect(hourlyCountSum).toBe(dayView.todayCount)
        
        // Property: Each hour should have valid data (non-negative amounts and counts)
        dayView.hourlyData.forEach(hour => {
          expect(hour.amount).toBeGreaterThanOrEqual(0)
          expect(hour.count).toBeGreaterThanOrEqual(0)
          expect(Number.isInteger(hour.count)).toBe(true)
        })
      }
    ), { numRuns: 100 })
  })

  /**
   * Property 2: Week view data accuracy
   * For any selected week, the displayed data should accurately reflect 
   * all transactions within that week period
   */
  it('should accurately calculate week view data for any given date', () => {
    fc.assert(fc.property(
      fc.array(expenseGenerator, { minLength: 0, maxLength: 100 }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
      (expenses, targetDate) => {
        // Skip if target date is invalid
        if (isNaN(targetDate.getTime())) return true
        const weekView = generateWeekViewData(expenses, targetDate)
        
        // Calculate expected week boundaries
        const weekStart = new Date(targetDate)
        weekStart.setDate(targetDate.getDate() - targetDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        // Property: Week total should equal sum of all expenses in that week
        const expectedWeekTotal = expenses
          .filter(e => e.date >= weekStart && e.date <= weekEnd)
          .reduce((sum, e) => sum + e.amount, 0)
        
        expect(weekView.weekTotal).toBe(expectedWeekTotal)
        
        // Property: Daily data should sum to week total
        const dailySum = weekView.weeklyData.reduce((sum, day) => sum + day.amount, 0)
        expect(dailySum).toBe(weekView.weekTotal)
        
        // Property: Should have exactly 7 days
        expect(weekView.weeklyData).toHaveLength(7)
        
        // Property: Each day should have valid data
        weekView.weeklyData.forEach(day => {
          expect(day.amount).toBeGreaterThanOrEqual(0)
          expect(day.count).toBeGreaterThanOrEqual(0)
          expect(Number.isInteger(day.count)).toBe(true)
          expect(day.day).toMatch(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/)
        })
      }
    ), { numRuns: 100 })
  })

  /**
   * Property 3: Custom range data accuracy
   * For any custom date range, the displayed data should accurately reflect 
   * all transactions within that specific period
   */
  it('should accurately calculate custom range data for any date range', () => {
    fc.assert(fc.property(
      fc.array(expenseGenerator, { minLength: 0, maxLength: 50 }),
      fc.array(incomeGenerator, { minLength: 0, maxLength: 50 }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
      fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
      (expenses, incomes, date1, date2) => {
        // Ensure fromDate <= toDate
        const fromDate = date1 <= date2 ? date1 : date2
        const toDate = date1 <= date2 ? date2 : date1
        
        const rangeData = generateCustomRangeData(expenses, incomes, fromDate, toDate)
        
        // Property: Total expenses should equal sum of expenses in range
        const expectedExpenses = expenses
          .filter(e => e.date >= fromDate && e.date <= toDate)
          .reduce((sum, e) => sum + e.amount, 0)
        
        expect(rangeData.totalExpenses).toBe(expectedExpenses)
        
        // Property: Total income should equal sum of incomes in range
        const expectedIncome = incomes
          .filter(i => i.date >= fromDate && i.date <= toDate)
          .reduce((sum, i) => sum + i.amount, 0)
        
        expect(rangeData.totalIncome).toBe(expectedIncome)
        
        // Property: Transaction count should equal sum of expenses and incomes in range
        const expectedCount = expenses.filter(e => e.date >= fromDate && e.date <= toDate).length +
                             incomes.filter(i => i.date >= fromDate && i.date <= toDate).length
        
        expect(rangeData.transactionCount).toBe(expectedCount)
        
        // Property: All amounts should be non-negative
        expect(rangeData.totalExpenses).toBeGreaterThanOrEqual(0)
        expect(rangeData.totalIncome).toBeGreaterThanOrEqual(0)
        expect(rangeData.transactionCount).toBeGreaterThanOrEqual(0)
      }
    ), { numRuns: 100 })
  })

  /**
   * Property 4: Date filtering consistency
   * Date filtering should be consistent across all time-based views
   */
  it('should consistently filter dates across different time views', () => {
    fc.assert(fc.property(
      fc.array(expenseGenerator, { minLength: 1, maxLength: 50 }),
      (expenses) => {
        // Pick a random date that exists in the expenses
        if (expenses.length === 0) return true
        
        const randomExpense = expenses[Math.floor(Math.random() * expenses.length)]
        const targetDate = randomExpense.date
        
        // Get day view for that date
        const dayView = generateDayViewData(expenses, targetDate)
        
        // Manually filter expenses for the same date
        const manualFilter = expenses.filter(e => 
          e.date.toDateString() === targetDate.toDateString()
        )
        
        // Property: Day view should match manual filtering
        expect(dayView.todayCount).toBe(manualFilter.length)
        expect(dayView.todayTotal).toBe(manualFilter.reduce((sum, e) => sum + e.amount, 0))
        
        // Property: If there are expenses on that date, total should be > 0
        if (manualFilter.length > 0) {
          expect(dayView.todayTotal).toBeGreaterThan(0)
        }
        
        return true
      }
    ), { numRuns: 100 })
  })

  /**
   * Property 5: Mathematical consistency
   * All calculations should maintain mathematical consistency
   */
  it('should maintain mathematical consistency in all calculations', () => {
    fc.assert(fc.property(
      fc.array(expenseGenerator, { minLength: 0, maxLength: 30 }),
      fc.array(incomeGenerator, { minLength: 0, maxLength: 30 }),
      fc.date({ min: new Date('2023-01-01'), max: new Date('2023-12-31') }),
      (expenses, incomes, targetDate) => {
        // Test day view mathematical consistency
        const dayView = generateDayViewData(expenses, targetDate)
        
        // Property: Sum of hourly amounts equals total
        const hourlySum = dayView.hourlyData.reduce((sum, h) => sum + h.amount, 0)
        expect(hourlySum).toBe(dayView.todayTotal)
        
        // Property: Sum of hourly counts equals total count
        const hourlyCountSum = dayView.hourlyData.reduce((sum, h) => sum + h.count, 0)
        expect(hourlyCountSum).toBe(dayView.todayCount)
        
        // Test week view mathematical consistency
        const weekView = generateWeekViewData(expenses, targetDate)
        const dailySum = weekView.weeklyData.reduce((sum, d) => sum + d.amount, 0)
        expect(dailySum).toBe(weekView.weekTotal)
        
        // Test custom range mathematical consistency
        const fromDate = new Date(targetDate)
        fromDate.setDate(targetDate.getDate() - 7)
        const toDate = new Date(targetDate)
        toDate.setDate(targetDate.getDate() + 7)
        
        const rangeData = generateCustomRangeData(expenses, incomes, fromDate, toDate)
        
        // Property: Transaction count should equal individual counts
        const expenseCount = expenses.filter(e => e.date >= fromDate && e.date <= toDate).length
        const incomeCount = incomes.filter(i => i.date >= fromDate && i.date <= toDate).length
        expect(rangeData.transactionCount).toBe(expenseCount + incomeCount)
        
        return true
      }
    ), { numRuns: 100 })
  })
})