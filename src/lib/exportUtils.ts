// Enhanced Export utilities for Excel, PDF, JSON, and sharing
import jsPDF from 'jspdf'
import 'jspdf-autotable'

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

// Enhanced Export Functions for Phase 1

/**
 * Export data to PDF format with charts and rich formatting
 */
export async function exportToPDF(
  expenses: any[], 
  incomes: any[], 
  analyticsData?: any,
  options: {
    includeCharts?: boolean
    includeSmartScore?: boolean
    includeSubscriptions?: boolean
    title?: string
  } = {}
) {
  const { 
    includeCharts = true, 
    includeSmartScore = true, 
    includeSubscriptions = true,
    title = 'Financial Report'
  } = options

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let yPosition = 20

  // Title and Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 15

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 20

  // Financial Summary
  const report = generateFinancialSummary(expenses, incomes)
  
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Financial Summary', 20, yPosition)
  yPosition += 10

  const summaryData = [
    ['Total Income', `₹${report.summary.totalIncome.toLocaleString('en-IN')}`],
    ['Total Expenses', `₹${report.summary.totalExpenses.toLocaleString('en-IN')}`],
    ['Net Savings', `₹${report.summary.savings.toLocaleString('en-IN')}`],
    ['Savings Rate', `${report.summary.savingsRate}%`],
    ['Total Transactions', `${report.summary.expenseCount + report.summary.incomeCount}`]
  ]

  ;(doc as any).autoTable({
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 20, right: 20 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 20

  // Smart Score (if available and requested)
  if (includeSmartScore && analyticsData?.healthScore) {
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Financial Health Score', 20, yPosition)
    yPosition += 15

    // Health score with color coding
    const healthScore = analyticsData.healthScore
    const scoreColor = healthScore >= 80 ? [34, 197, 94] : 
                     healthScore >= 60 ? [251, 191, 36] : [239, 68, 68]
    
    doc.setFontSize(24)
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2])
    doc.text(`${healthScore}%`, 20, yPosition)
    
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('Overall Financial Health', 60, yPosition - 5)
    
    const healthDescription = healthScore >= 80 ? 'Excellent financial health!' :
                            healthScore >= 60 ? 'Good financial management' :
                            'Room for improvement'
    doc.text(healthDescription, 60, yPosition + 5)
    yPosition += 25
  }

  // Category Breakdown
  if (yPosition > pageHeight - 100) {
    doc.addPage()
    yPosition = 20
  }

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Expense Breakdown by Category', 20, yPosition)
  yPosition += 10

  const categoryData = report.categoryBreakdown.map(([category, amount]: [string, any]) => {
    const percentage = report.summary.totalExpenses > 0 ? 
      ((amount / report.summary.totalExpenses) * 100).toFixed(1) : '0'
    return [category, `₹${amount.toLocaleString('en-IN')}`, `${percentage}%`]
  })

  ;(doc as any).autoTable({
    startY: yPosition,
    head: [['Category', 'Amount', 'Percentage']],
    body: categoryData,
    theme: 'striped',
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 20, right: 20 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 20

  // Recent Transactions
  if (expenses.length > 0) {
    if (yPosition > pageHeight - 100) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Recent Expenses', 20, yPosition)
    yPosition += 10

    const recentExpensesData = expenses.slice(0, 10).map((expense: any) => [
      new Date(expense.date).toLocaleDateString('en-IN'),
      expense.title,
      expense.category,
      `₹${expense.amount.toLocaleString('en-IN')}`
    ])

    ;(doc as any).autoTable({
      startY: yPosition,
      head: [['Date', 'Title', 'Category', 'Amount']],
      body: recentExpensesData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 }
      }
    })
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, pageHeight - 10, { align: 'right' })
    doc.text('Generated by ExpenseTracker', 20, pageHeight - 10)
  }

  // Download the PDF
  const filename = `financial_report_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

/**
 * Export data to JSON format for backup/restore
 */
export function exportToJSON(expenses: any[], incomes: any[], subscriptions?: any[], options: {
  includeMetadata?: boolean
  filename?: string
} = {}) {
  const { includeMetadata = true, filename = 'financial_data_backup' } = options

  const exportData: any = {
    expenses,
    incomes,
    ...(subscriptions && { subscriptions }),
    ...(includeMetadata && {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
        totalIncome: incomes.reduce((sum, i) => sum + i.amount, 0),
        expenseCount: expenses.length,
        incomeCount: incomes.length,
        dateRange: {
          earliest: expenses.length > 0 ? 
            new Date(Math.min(...expenses.map(e => new Date(e.date).getTime()))).toISOString() : null,
          latest: expenses.length > 0 ? 
            new Date(Math.max(...expenses.map(e => new Date(e.date).getTime()))).toISOString() : null
        }
      }
    })
  }

  const jsonString = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

/**
 * Generate WhatsApp share summary
 */
export function generateWhatsAppSummary(expenses: any[], incomes: any[], period: string = 'this month') {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0'

  // Top 3 categories
  const categoryBreakdown = expenses.reduce((acc: any, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([category, amount]) => `${category}: ₹${(amount as number).toLocaleString('en-IN')}`)

  const message = `💰 My Financial Summary (${period})

📊 Overview:
• Income: ₹${totalIncome.toLocaleString('en-IN')}
• Expenses: ₹${totalExpenses.toLocaleString('en-IN')}
• ${savings >= 0 ? 'Savings' : 'Deficit'}: ₹${Math.abs(savings).toLocaleString('en-IN')}
• Savings Rate: ${savingsRate}%

🏆 Top Spending Categories:
${topCategories.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}

📱 Tracked with ExpenseTracker`

  return message
}

/**
 * Share via WhatsApp
 */
export function shareViaWhatsApp(expenses: any[], incomes: any[], period: string = 'this month') {
  const message = generateWhatsAppSummary(expenses, incomes, period)
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
  
  window.open(whatsappUrl, '_blank')
}

/**
 * Share via Email
 */
export function shareViaEmail(
  expenses: any[], 
  incomes: any[], 
  options: {
    subject?: string
    recipient?: string
    includeAttachment?: boolean
  } = {}
) {
  const { 
    subject = 'Financial Report', 
    recipient = '',
    includeAttachment = false 
  } = options

  const report = generateFinancialSummary(expenses, incomes)
  
  const emailBody = `Hi,

Here's my financial summary:

📊 Financial Overview:
• Total Income: ₹${report.summary.totalIncome.toLocaleString('en-IN')}
• Total Expenses: ₹${report.summary.totalExpenses.toLocaleString('en-IN')}
• Net Savings: ₹${report.summary.savings.toLocaleString('en-IN')}
• Savings Rate: ${report.summary.savingsRate}%
• Total Transactions: ${report.summary.expenseCount + report.summary.incomeCount}

🏆 Top Expense Categories:
${report.categoryBreakdown.slice(0, 5).map(([category, amount]: [string, any], i: number) => 
  `${i + 1}. ${category}: ₹${amount.toLocaleString('en-IN')}`
).join('\n')}

Generated on: ${new Date().toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

Best regards,
ExpenseTracker User`

  const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`
  window.open(mailtoUrl)
}

/**
 * Generate secure public share link (placeholder - would need backend implementation)
 */
export function generatePublicShareLink(
  expenses: any[], 
  incomes: any[], 
  options: {
    expiresIn?: number // hours
    password?: string
    allowedViews?: number
  } = {}
) {
  // This would typically involve:
  // 1. Sending data to backend
  // 2. Generating secure token
  // 3. Storing data with expiration
  // 4. Returning public URL
  
  // For now, return a placeholder implementation
  const token = btoa(JSON.stringify({
    timestamp: Date.now(),
    dataHash: btoa(JSON.stringify({ expenses: expenses.length, incomes: incomes.length })),
    ...options
  }))
  
  const baseUrl = window.location.origin
  const shareUrl = `${baseUrl}/share/${token}`
  
  // Copy to clipboard
  navigator.clipboard.writeText(shareUrl).then(() => {
    alert('Share link copied to clipboard!\n\nNote: This is a demo implementation. In production, this would create a secure, time-limited share link.')
  })
  
  return shareUrl
}

/**
 * Enhanced CSV export with better formatting
 */
export function exportToCSV(
  data: any[], 
  filename: string, 
  options: {
    includeHeaders?: boolean
    customHeaders?: string[]
    includeMetadata?: boolean
  } = {}
) {
  const { includeHeaders = true, customHeaders, includeMetadata = true } = options
  
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  let csvContent = ''
  
  // Add metadata header if requested
  if (includeMetadata) {
    csvContent += `# Financial Data Export\n`
    csvContent += `# Generated: ${new Date().toLocaleString('en-IN')}\n`
    csvContent += `# Records: ${data.length}\n`
    csvContent += `# \n`
  }

  const firstItem = data[0]
  let headers: string[] = customHeaders || []
  
  if (!customHeaders) {
    if (firstItem.category !== undefined) {
      // Expense data
      headers = ['Date', 'Title', 'Amount', 'Category', 'Bank', 'Payment Mode', 'Tags', 'Notes']
    } else if (firstItem.source !== undefined) {
      // Income data
      headers = ['Date', 'Source', 'Amount', 'Notes']
    } else {
      // Generic data
      headers = Object.keys(firstItem)
    }
  }
  
  if (includeHeaders) {
    csvContent += headers.join(',') + '\n'
  }
  
  data.forEach(item => {
    const row = headers.map(header => {
      let value = item[header.toLowerCase()] || item[header] || ''
      
      // Special formatting for different data types
      if (header.toLowerCase() === 'date' && value) {
        value = new Date(value).toLocaleDateString('en-IN')
      } else if (header.toLowerCase() === 'amount' && typeof value === 'number') {
        value = value.toString()
      } else if (Array.isArray(value)) {
        value = value.join('; ')
      } else if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`
      }
      
      return value
    })
    csvContent += row.join(',') + '\n'
  })

  // Add summary if it's financial data
  if (includeMetadata && firstItem.amount !== undefined) {
    const total = data.reduce((sum, item) => sum + (item.amount || 0), 0)
    csvContent += '\n'
    csvContent += `# Summary\n`
    csvContent += `Total Amount,₹${total.toLocaleString('en-IN')}\n`
    csvContent += `Transaction Count,${data.length}\n`
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

/**
 * Copy financial summary to clipboard
 */
export async function copyToClipboard(expenses: any[], incomes: any[], format: 'text' | 'markdown' = 'text') {
  const report = generateFinancialSummary(expenses, incomes)
  
  let content = ''
  
  if (format === 'markdown') {
    content = `# Financial Summary

## Overview
- **Total Income:** ₹${report.summary.totalIncome.toLocaleString('en-IN')}
- **Total Expenses:** ₹${report.summary.totalExpenses.toLocaleString('en-IN')}
- **Net Savings:** ₹${report.summary.savings.toLocaleString('en-IN')}
- **Savings Rate:** ${report.summary.savingsRate}%

## Top Categories
${report.categoryBreakdown.slice(0, 5).map(([category, amount]: [string, any], i: number) => 
  `${i + 1}. **${category}:** ₹${amount.toLocaleString('en-IN')}`
).join('\n')}

*Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*`
  } else {
    content = `Financial Summary

Total Income: ₹${report.summary.totalIncome.toLocaleString('en-IN')}
Total Expenses: ₹${report.summary.totalExpenses.toLocaleString('en-IN')}
Net Savings: ₹${report.summary.savings.toLocaleString('en-IN')}
Savings Rate: ${report.summary.savingsRate}%

Top Categories:
${report.categoryBreakdown.slice(0, 5).map(([category, amount]: [string, any], i: number) => 
  `${i + 1}. ${category}: ₹${amount.toLocaleString('en-IN')}`
).join('\n')}

Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
  }

  try {
    await navigator.clipboard.writeText(content)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}