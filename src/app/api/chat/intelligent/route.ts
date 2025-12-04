import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { getFinancialSummary, getExpenses, getIncomes } from '@/lib/database'

export const POST = withAuth(async (request: NextRequest, { userId }) => {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Get user's financial data
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    const [summary, expenses, incomes] = await Promise.all([
      getFinancialSummary(userId, currentYear, currentMonth),
      getExpenses(userId, { limit: 100 }),
      getIncomes(userId, { limit: 50 })
    ])

    // Calculate additional insights
    const categoryBreakdown = expenses.reduce((acc: any, expense: any) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {})

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)

    const avgExpensePerDay = summary.totalExpenses / new Date().getDate()
    const savingsRate = summary.totalIncome > 0 ? (summary.savings / summary.totalIncome) * 100 : 0

    // Prepare context for OpenAI
    const financialContext = {
      totalExpenses: summary.totalExpenses,
      totalIncome: summary.totalIncome,
      savings: summary.savings,
      savingsRate: Math.round(savingsRate),
      expenseCount: summary.expenseCount,
      incomeCount: summary.incomeCount,
      topCategories: topCategories.map(([cat, amt]) => ({ category: cat, amount: amt })),
      avgExpensePerDay: Math.round(avgExpensePerDay),
      recentExpenses: expenses.slice(0, 5).map(e => ({
        title: e.title,
        amount: e.amount,
        category: e.category,
        date: e.date
      }))
    }

    // Use OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a helpful financial assistant for a personal finance app. The user's current financial data is:
                
                Monthly Summary:
                - Total Expenses: ₹${financialContext.totalExpenses.toLocaleString()}
                - Total Income: ₹${financialContext.totalIncome.toLocaleString()}
                - Savings: ₹${financialContext.savings.toLocaleString()}
                - Savings Rate: ${financialContext.savingsRate}%
                - Number of Expenses: ${financialContext.expenseCount}
                - Average Daily Spending: ₹${financialContext.avgExpensePerDay.toLocaleString()}
                
                Top Spending Categories:
                ${financialContext.topCategories.map((cat: any) => `- ${cat.category}: ₹${cat.amount.toLocaleString()}`).join('\n')}
                
                Recent Expenses:
                ${financialContext.recentExpenses.map((exp: any) => `- ${exp.title}: ₹${exp.amount.toLocaleString()} (${exp.category})`).join('\n')}
                
                Provide helpful, personalized financial advice and insights. Use Indian Rupee (₹) currency format. Be conversational and encouraging. If asked about specific data, use the exact numbers provided above.`
              },
              {
                role: 'user',
                content: query
              }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        })

        if (openaiResponse.ok) {
          const data = await openaiResponse.json()
          const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response right now.'
          
          return NextResponse.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
            source: 'openai'
          })
        }
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        // Fall back to rule-based responses
      }
    }

    // Fallback to enhanced rule-based responses with real data
    const lowerQuery = query.toLowerCase()
    let response = ''

    if (lowerQuery.includes('spend') || lowerQuery.includes('expense')) {
      if (lowerQuery.includes('month')) {
        response = `This month you've spent ₹${summary.totalExpenses.toLocaleString()} across ${summary.expenseCount} transactions. Your average daily spending is ₹${Math.round(avgExpensePerDay).toLocaleString()}.`
      } else if (lowerQuery.includes('category') || lowerQuery.includes('categories')) {
        const topCatsText = topCategories.slice(0, 3).map(([cat, amt]) => `${cat}: ₹${(amt as number).toLocaleString()}`).join(', ')
        response = `Your top spending categories are: ${topCatsText}. Would you like to see a detailed breakdown?`
      } else {
        response = `Your total spending this month is ₹${summary.totalExpenses.toLocaleString()}. ${summary.expenseCount > 0 ? `Your largest expense category is ${topCategories[0]?.[0]} with ₹${(topCategories[0]?.[1] as number)?.toLocaleString()}.` : ''}`
      }
    } else if (lowerQuery.includes('income') || lowerQuery.includes('earn')) {
      response = `Your total income this month is ₹${summary.totalIncome.toLocaleString()} from ${summary.incomeCount} sources. ${summary.totalIncome > 0 ? `That's an average of ₹${Math.round(summary.totalIncome / Math.max(summary.incomeCount, 1)).toLocaleString()} per income source.` : ''}`
    } else if (lowerQuery.includes('saving') || lowerQuery.includes('save')) {
      const savingsStatus = summary.savings >= 0 ? 'saving' : 'overspending by'
      response = `You're ${savingsStatus} ₹${Math.abs(summary.savings).toLocaleString()} this month. Your savings rate is ${Math.round(savingsRate)}%. ${savingsRate >= 20 ? 'Excellent job!' : savingsRate >= 10 ? 'Good progress, try to save a bit more.' : 'Consider reducing expenses to improve your savings.'}`
    } else if (lowerQuery.includes('budget') || lowerQuery.includes('limit')) {
      response = `Based on your current spending of ₹${summary.totalExpenses.toLocaleString()}, you're spending about ₹${Math.round(avgExpensePerDay).toLocaleString()} per day. ${avgExpensePerDay > 1000 ? 'Consider setting daily spending limits to control expenses.' : 'Your daily spending looks reasonable.'}`
    } else if (lowerQuery.includes('advice') || lowerQuery.includes('tip') || lowerQuery.includes('help')) {
      if (savingsRate < 10) {
        response = `Here are some tips to improve your finances: 1) Your top expense is ${topCategories[0]?.[0]} (₹${(topCategories[0]?.[1] as number)?.toLocaleString()}), try to reduce it by 10%. 2) Set a daily spending limit of ₹${Math.round(avgExpensePerDay * 0.9).toLocaleString()}. 3) Track small expenses - they add up quickly!`
      } else {
        response = `You're doing well with a ${Math.round(savingsRate)}% savings rate! To optimize further: 1) Continue monitoring your ${topCategories[0]?.[0]} expenses. 2) Consider investing your savings of ₹${summary.savings.toLocaleString()}. 3) Set up automatic savings to maintain this good habit.`
      }
    } else {
      response = `I can help you analyze your spending patterns, savings, income, and provide financial advice. Try asking: "How much did I spend this month?", "What's my savings rate?", or "Give me financial advice based on my data."`
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      source: 'rule-based',
      context: financialContext
    })
  } catch (error: any) {
    console.error('Chat query error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process query' },
      { status: 500 }
    )
  }
})