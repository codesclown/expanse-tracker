import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getExpenses, getIncomes, getUserById } from '@/lib/database'
import { sendEmail, emailTemplates } from '@/lib/email'

export const POST = withAuth(async (request: NextRequest, { userId }) => {
  try {
    const { dateFrom, dateTo, category, type, reportType } = await request.json()

    // Get user info
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Build filters
    const filters: any = {}
    if (dateFrom) filters.dateFrom = dateFrom
    if (dateTo) filters.dateTo = dateTo
    if (category && category !== 'All') filters.category = category

    // Get data
    const [expenses, incomes] = await Promise.all([
      getExpenses(userId, filters),
      getIncomes(userId, filters)
    ])

    // Calculate summary
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
      .slice(0, 5)

    // Determine period description
    let periodDescription = 'All time'
    if (type === 'day') {
      periodDescription = `Daily report for ${new Date(dateFrom).toLocaleDateString('en-IN')}`
    } else if (type === 'month') {
      periodDescription = `Monthly report for ${new Date(dateFrom).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`
    } else if (type === 'year') {
      periodDescription = `Yearly report for ${new Date(dateFrom).getFullYear()}`
    } else if (dateFrom && dateTo) {
      periodDescription = `Report from ${new Date(dateFrom).toLocaleDateString('en-IN')} to ${new Date(dateTo).toLocaleDateString('en-IN')}`
    }

    // Create email content
    const emailContent = {
      subject: `Financial Report - ${periodDescription}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📊 Financial Report</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${periodDescription}</p>
          </div>
          
          <div style="padding: 0 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${user.name}! 👋</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📈 Summary</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
                <div style="background: #00b894; color: white; padding: 15px; border-radius: 8px; text-align: center;">
                  <h4 style="margin: 0 0 5px 0; font-size: 14px;">Total Income</h4>
                  <p style="margin: 0; font-size: 20px; font-weight: bold;">₹${totalIncome.toLocaleString('en-IN')}</p>
                </div>
                <div style="background: #e17055; color: white; padding: 15px; border-radius: 8px; text-align: center;">
                  <h4 style="margin: 0 0 5px 0; font-size: 14px;">Total Expenses</h4>
                  <p style="margin: 0; font-size: 20px; font-weight: bold;">₹${totalExpenses.toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              <div style="background: ${savings >= 0 ? '#00b894' : '#e17055'}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0;">
                <h4 style="margin: 0 0 5px 0; font-size: 16px;">${savings >= 0 ? 'Net Savings' : 'Net Deficit'}</h4>
                <p style="margin: 0; font-size: 24px; font-weight: bold;">₹${Math.abs(savings).toLocaleString('en-IN')}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;">Savings Rate: ${savingsRate.toFixed(1)}%</p>
              </div>
            </div>
            
            ${topCategories.length > 0 ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">🏷️ Top Spending Categories</h3>
              ${topCategories.map(([category, amount]: [string, any]) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e1e5e9;">
                  <span style="color: #666;">${category}</span>
                  <span style="font-weight: bold; color: #333;">₹${amount.toLocaleString('en-IN')}</span>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">📊 Transaction Summary</h3>
              <p style="margin: 5px 0; color: #666;"><strong>Total Transactions:</strong> ${expenses.length + incomes.length}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Expenses:</strong> ${expenses.length} transactions</p>
              <p style="margin: 5px 0; color: #666;"><strong>Incomes:</strong> ${incomes.length} transactions</p>
              <p style="margin: 5px 0; color: #666;"><strong>Average Expense:</strong> ₹${expenses.length > 0 ? Math.round(totalExpenses / expenses.length).toLocaleString('en-IN') : '0'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Full Dashboard
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              Generated on ${new Date().toLocaleString('en-IN')} | FinanceTracker
            </p>
          </div>
        </div>
      `
    }

    // Send email
    const result = await sendEmail({
      to: user.email,
      ...emailContent
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Financial report sent to your email successfully',
        summary: {
          totalExpenses,
          totalIncome,
          savings,
          savingsRate: Math.round(savingsRate * 100) / 100,
          transactionCount: expenses.length + incomes.length,
          period: periodDescription
        }
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send email report' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Email report error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate email report' },
      { status: 500 }
    )
  }
})