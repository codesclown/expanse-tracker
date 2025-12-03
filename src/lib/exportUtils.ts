// Excel export utilities
export const exportToExcel = (data: any[], filename: string = 'expenses') => {
  // Create CSV content
  const headers = [
    'Date',
    'Title', 
    'Amount',
    'Category',
    'Bank',
    'Payment Mode',
    'Tags',
    'Notes',
    'Created At'
  ]
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.date || '',
      `"${(item.title || '').replace(/"/g, '""')}"`,
      item.amount || 0,
      item.category || '',
      item.bank || '',
      item.paymentMode || '',
      `"${(item.tags || []).join(', ')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      item.createdAt ? new Date(item.createdAt).toLocaleString() : ''
    ].join(','))
  ].join('\n')
  
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

export const exportExpensesSummary = (expenses: any[]) => {
  // Calculate summary data
  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const categoryTotals = expenses.reduce((acc, exp) => {
    const category = exp.category || 'Other'
    acc[category] = (acc[category] || 0) + (exp.amount || 0)
    return acc
  }, {} as Record<string, number>)
  
  const monthlyTotals = expenses.reduce((acc, exp) => {
    const month = new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    acc[month] = (acc[month] || 0) + (exp.amount || 0)
    return acc
  }, {} as Record<string, number>)
  
  // Create summary data
  const summaryData = [
    ['EXPENSE SUMMARY REPORT'],
    ['Generated on:', new Date().toLocaleString()],
    [''],
    ['OVERVIEW'],
    ['Total Expenses:', totalAmount.toLocaleString()],
    ['Number of Transactions:', expenses.length],
    ['Average Transaction:', Math.round(totalAmount / expenses.length || 0).toLocaleString()],
    [''],
    ['CATEGORY BREAKDOWN'],
    ...Object.entries(categoryTotals).map(([category, amount]) => [category, amount.toLocaleString()]),
    [''],
    ['MONTHLY BREAKDOWN'],
    ...Object.entries(monthlyTotals).map(([month, amount]) => [month, amount.toLocaleString()]),
    [''],
    ['DETAILED TRANSACTIONS'],
    ['Date', 'Title', 'Amount', 'Category', 'Bank', 'Payment Mode', 'Tags', 'Notes'],
    ...expenses.map(exp => [
      exp.date,
      exp.title,
      exp.amount,
      exp.category,
      exp.bank,
      exp.paymentMode,
      (exp.tags || []).join(', '),
      exp.notes || ''
    ])
  ]
  
  const csvContent = summaryData.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `expense_summary_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}