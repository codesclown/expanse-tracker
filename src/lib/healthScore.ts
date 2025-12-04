// Shared Financial Health Score Calculation
export function calculateFinancialHealthScore(
  expenses: any[], 
  incomes: any[]
): number {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  
  // If no income or expenses, return low score
  if (totalIncome === 0 && totalExpenses === 0) return 25
  if (totalIncome === 0) return 15 // Only expenses, no income
  
  const savingsRate = (totalIncome - totalExpenses) / totalIncome
  let score = 0
  
  // Savings Rate Score (0-40 points)
  if (savingsRate >= 0.3) score += 40      // Excellent: 30%+ savings
  else if (savingsRate >= 0.2) score += 35 // Very Good: 20-29% savings  
  else if (savingsRate >= 0.1) score += 25 // Good: 10-19% savings
  else if (savingsRate >= 0.05) score += 15 // Fair: 5-9% savings
  else if (savingsRate >= 0) score += 10   // Poor but positive: 0-4% savings
  else score += 0                          // Negative savings (overspending)
  
  // Income Stability Score (0-20 points)
  const incomeCount = incomes.length
  if (incomeCount >= 12) score += 20       // Monthly income for a year
  else if (incomeCount >= 6) score += 15   // Regular income
  else if (incomeCount >= 3) score += 10   // Some income records
  else if (incomeCount >= 1) score += 5    // At least one income
  
  // Expense Tracking Score (0-20 points)
  const expenseCount = expenses.length
  if (expenseCount >= 50) score += 20      // Very active tracking
  else if (expenseCount >= 30) score += 15 // Good tracking
  else if (expenseCount >= 15) score += 10 // Regular tracking
  else if (expenseCount >= 5) score += 5   // Basic tracking
  
  // Budget Adherence Score (0-10 points)
  const budgets = {
    'Food': 15000, 'Transport': 8000, 'Shopping': 10000, 
    'Entertainment': 5000, 'Bills': 12000
  }
  let budgetScore = 0
  
  Object.entries(budgets).forEach(([category, budget]) => {
    const actual = expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0)
    
    if (actual > 0) {
      if (actual <= budget) budgetScore += 2 // Within budget
      else if (actual <= budget * 1.2) budgetScore += 1 // 20% over budget
    }
  })
  
  score += budgetScore
  
  // Spending Diversity Score (0-10 points)
  const uniqueCategories = new Set(expenses.map(e => e.category)).size
  if (uniqueCategories >= 5) score += 10
  else if (uniqueCategories >= 3) score += 6
  else if (uniqueCategories >= 2) score += 3
  
  return Math.min(100, Math.max(0, Math.round(score)))
}

// Get health score status text and color
export function getHealthScoreStatus(score: number): {
  text: string
  colorClass: string
  bgClass: string
  badgeClass: string
  metricClass: string
} {
  if (score >= 80) {
    return {
      text: 'Excellent',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-gradient-to-br from-emerald-500 via-teal-600 to-green-600',
      badgeClass: 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/50',
      metricClass: 'text-gradient-success'
    }
  } else if (score >= 70) {
    return {
      text: 'Very Good',
      colorClass: 'text-violet-600 dark:text-violet-400',
      bgClass: 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600',
      badgeClass: 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 border-violet-200/50 dark:border-violet-800/50',
      metricClass: 'text-gradient-primary'
    }
  } else if (score >= 50) {
    return {
      text: 'Good',
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-600',
      badgeClass: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/50',
      metricClass: 'text-gradient-info'
    }
  } else if (score >= 30) {
    return {
      text: 'Fair',
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600',
      badgeClass: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50',
      metricClass: 'text-gradient-warning'
    }
  } else {
    return {
      text: 'Needs Attention',
      colorClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-gradient-to-br from-red-500 via-rose-600 to-pink-600',
      badgeClass: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/50',
      metricClass: 'text-gradient-danger'
    }
  }
}