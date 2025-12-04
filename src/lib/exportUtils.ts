// Export utilities for Excel and email reports

export interface ExportFilters {
  dateFrom?: string
  dateTo?: string
  category?: string
  type?: 'day' | 'month' | 'year'
}

export function exportToExcel(data: any[], filename: string, filters?: ExportFilters) {
  // Create CSV content
  let csvContent = ''
  
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // Determine data type and create appropriate headers
  const firstItem = data[0]
  let headers: string[] = []
  
  if (firstItem.category !== undefined) {
    // Expense data
    headers = ['Date', 'Title', 'Amount (₹)', 'Category', 'Bank', 'Payment Mode', 'Tags', 'Notes']
    csvContent = headers.join(',') + '\n'
    
    data.forEach(item => {
      const row = [
        new Date(item.date).toLocaleDateString('en-IN'),
        `"${item.title}"`,
        item.amount,
        item.category,
        item.bank || '',
        item.paymentMode || '',
        Array.isArray(item.tags) ? `"${item.tags.join(', ')}"` : `"${item.tags || ''}"`,
        `"${item.notes || ''}"`
      ]
      csvContent += row.join(',') + '\n'
    })
  } else if (firstItem.source !== undefined) {
    // Income data
    headers = ['Date', 'Source', 'Amount (₹)', 'Notes']
    csvContent = headers.join(',') + '\n'
    
    data.forEach(item => {
      const row = [
        new Date(item.date).toLocaleDateString('en-IN'),
        `"${item.source}"`,
        item.amount,
        `"${item.notes || ''}"`
      ]
      csvContent += row.join(',') + '\n'
    })
  } else {
    // Generic data
    headers = Object.keys(firstItem)
    csvContent = headers.join(',') + '\n'
    
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header]
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value || ''
      })
      csvContent += row.join(',') + '\n'
    })
  }

  // Add summary at the end
  if (firstItem.amount !== undefined) {
    const total = data.reduce((sum, item) => sum + (item.amount || 0), 0)
    csvContent += '\n'
    csvContent += `Total,₹${total.toLocaleString('en-IN')}\n`
    csvContent += `Count,${data.length} transactions\n`
    
    if (filters) {
      csvContent += `Period,${filters.dateFrom || 'All'} to ${filters.dateTo || 'All'}\n`
      if (filters.category && filters.category !== 'All') {
        csvContent += `Category,${filters.category}\n`
      }
    }
    csvContent += `Generated,${new Date().toLocaleString('en-IN')}\n`
  }

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function generateFinancialSummary(expenses: any[], incomes: any[], filters?: ExportFilters) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

  // Category breakdown
  const categoryBreakdown = expenses.reduce((acc: any, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)

  // Payment mode breakdown
  const paymentModeBreakdown = expenses.reduce((acc: any, e) => {
    const mode = e.paymentMode || 'Cash'
    acc[mode] = (acc[mode] || 0) + e.amount
    return acc
  }, {})

  return {
    summary: {
      totalExpenses,
      totalIncome,
      savings,
      savingsRate: Math.round(savingsRate * 100) / 100,
      expenseCount: expenses.length,
      incomeCount: incomes.length,
      period: filters ? `${filters.dateFrom || 'All'} to ${filters.dateTo || 'All'}` : 'All time'
    },
    categoryBreakdown: topCategories,
    paymentModeBreakdown: Object.entries(paymentModeBreakdown),
    recentExpenses: expenses.slice(0, 10),
    recentIncomes: incomes.slice(0, 10)
  }
}

export function exportDetailedReport(expenses: any[], incomes: any[], filters?: ExportFilters) {
  const report = generateFinancialSummary(expenses, incomes, filters)
  
  let csvContent = 'FINANCIAL REPORT\n'
  csvContent += `Generated on: ${new Date().toLocaleString('en-IN')}\n`
  csvContent += `Period: ${report.summary.period}\n\n`
  
  // Summary section
  csvContent += 'SUMMARY\n'
  csvContent += `Total Income,₹${report.summary.totalIncome.toLocaleString('en-IN')}\n`
  csvContent += `Total Expenses,₹${report.summary.totalExpenses.toLocaleString('en-IN')}\n`
  csvContent += `Net Savings,₹${report.summary.savings.toLocaleString('en-IN')}\n`
  csvContent += `Savings Rate,${report.summary.savingsRate}%\n`
  csvContent += `Total Transactions,${report.summary.expenseCount + report.summary.incomeCount}\n\n`
  
  // Category breakdown
  csvContent += 'EXPENSE BREAKDOWN BY CATEGORY\n'
  csvContent += 'Category,Amount (₹),Percentage\n'
  report.categoryBreakdown.forEach(([category, amount]: [string, any]) => {
    const percentage = report.summary.totalExpenses > 0 ? ((amount / report.summary.totalExpenses) * 100).toFixed(1) : '0'
    csvContent += `${category},₹${amount.toLocaleString('en-IN')},${percentage}%\n`
  })
  csvContent += '\n'
  
  // Payment mode breakdown
  csvContent += 'EXPENSE BREAKDOWN BY PAYMENT MODE\n'
  csvContent += 'Payment Mode,Amount (₹)\n'
  report.paymentModeBreakdown.forEach(([mode, amount]: [string, any]) => {
    csvContent += `${mode},₹${amount.toLocaleString('en-IN')}\n`
  })
  csvContent += '\n'
  
  // Recent transactions
  if (report.recentExpenses.length > 0) {
    csvContent += 'RECENT EXPENSES\n'
    csvContent += 'Date,Title,Amount (₹),Category\n'
    report.recentExpenses.forEach((expense: any) => {
      csvContent += `${new Date(expense.date).toLocaleDateString('en-IN')},"${expense.title}",₹${expense.amount.toLocaleString('en-IN')},${expense.category}\n`
    })
    csvContent += '\n'
  }
  
  if (report.recentIncomes.length > 0) {
    csvContent += 'RECENT INCOMES\n'
    csvContent += 'Date,Source,Amount (₹)\n'
    report.recentIncomes.forEach((income: any) => {
      csvContent += `${new Date(income.date).toLocaleDateString('en-IN')},"${income.source}",₹${income.amount.toLocaleString('en-IN')}\n`
    })
  }

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function getDateRangeFilters(type: 'day' | 'month' | 'year', date?: Date) {
  const targetDate = date || new Date()
  let dateFrom: string
  let dateTo: string

  switch (type) {
    case 'day':
      dateFrom = targetDate.toISOString().split('T')[0]
      dateTo = dateFrom
      break
    case 'month':
      const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
      const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0)
      dateFrom = startOfMonth.toISOString().split('T')[0]
      dateTo = endOfMonth.toISOString().split('T')[0]
      break
    case 'year':
      const startOfYear = new Date(targetDate.getFullYear(), 0, 1)
      const endOfYear = new Date(targetDate.getFullYear(), 11, 31)
      dateFrom = startOfYear.toISOString().split('T')[0]
      dateTo = endOfYear.toISOString().split('T')[0]
      break
  }

  return { dateFrom, dateTo }
}