'use client'

import { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useTheme } from '@/contexts/ThemeContext'

export default function Chat() {
  const [expenses] = useLocalStorage<any[]>('expenses', [])
  const [incomes] = useLocalStorage<any[]>('incomes', [])
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const { theme, toggleTheme, isTransitioning } = useTheme()

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input, id: Date.now() }
    setMessages([...messages, userMessage])
    setInput('')
    setIsTyping(true)

    const response = generateResponse(input.toLowerCase())
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: response, id: Date.now() + 1 }])
      setIsTyping(false)
    }, 800)
  }

  const generateResponse = (query: string) => {
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const savings = totalIncome - totalExpense
    const smartScore = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0

    if (query.includes('spend') || query.includes('spent')) {
      if (query.includes('month')) {
        return `You've spent ₹${totalExpense.toLocaleString()} this month across ${expenses.length} transactions.`
      }
      if (query.includes('food')) {
        const foodExpenses = expenses.filter(e => e.category === 'Food')
        const foodTotal = foodExpenses.reduce((sum, e) => sum + e.amount, 0)
        return `You've spent ₹${foodTotal.toLocaleString()} on Food this month.`
      }
      return `Your total spending is ₹${totalExpense.toLocaleString()}.`
    }

    if (query.includes('category') || query.includes('categories')) {
      const categoryData = expenses.reduce((acc: any, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount
        return acc
      }, {})
      const breakdown = Object.entries(categoryData)
        .map(([cat, amt]: [string, any]) => `${cat}: ₹${amt.toLocaleString()}`)
        .join('\n')
      return `Here's your spending by category:\n\n${breakdown}`
    }

    if (query.includes('score') || query.includes('smart')) {
      return `Your Smart Spending Score is ${smartScore}/100. ${
        smartScore >= 70 ? 'Great job! You\'re saving well.' :
        smartScore >= 40 ? 'You\'re doing okay, but there\'s room for improvement.' :
        'Try to reduce expenses and increase savings.'
      }`
    }

    if (query.includes('saving') || query.includes('save')) {
      return `You've saved ₹${savings.toLocaleString()} this month. ${
        savings > 0 ? 'Keep it up!' : 'Try to reduce expenses.'
      }`
    }

    if (query.includes('income')) {
      return `Your total income is ₹${totalIncome.toLocaleString()}.`
    }

    return "I can help you with questions about your spending, categories, savings, and Smart Score. Try asking 'How much did I spend this month?' or 'What's my Smart Score?'"
  }

  const quickQuestions = [
    'How much did I spend this month?',
    'Show my spending by category',
    "What's my Smart Score?",
    'How much did I save?'
  ]

  return (
    <div className="h-screen bg-premium-mesh overflow-hidden md:pl-64 lg:pl-72 flex flex-col">
      {/* Modern Header */}
      <header className="relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="text-white space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <svg
                    className="w-5 h-5 md:w-7 md:h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs md:text-sm text-white/80 font-medium bg-white/10 px-2 py-1 rounded-full">
                      AI Assistant
                    </span>
                    <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                    <span className="text-xs text-white/60">
                      Smart & Helpful
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
                    Financial Assistant
                  </h1>
                </div>
              </div>
              <p className="text-sm md:text-base text-white/80 max-w-md">
                Get personalized insights about your spending and financial health
              </p>
            </div>

            <button
              onClick={toggleTheme}
              disabled={isTransitioning}
              aria-label="Toggle theme"
              className={`theme-toggle-btn flex-shrink-0 p-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl ${
                isTransitioning ? 'animate-theme-toggle' : ''
              } disabled:opacity-50`}
            >
              <div className="relative w-5 h-5 md:w-6 md:h-6">
                <svg
                  className={`absolute inset-0 w-5 h-5 md:w-6 md:h-6 text-white transition-all duration-300 ${
                    theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <svg
                  className={`absolute inset-0 w-5 h-5 md:w-6 md:h-6 text-white transition-all duration-300 ${
                    theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto px-4 md:px-6 lg:px-8 -mt-8 relative z-10 w-full min-h-0 pb-32 md:pb-8">
        <div className="glass rounded-3xl border border-border shadow-premium h-full flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto min-h-0">
              {messages.length === 0 ? (
                <div className="text-center py-8 animate-slide-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-premium">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-3">Hi! I'm your AI assistant</p>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">Ask me anything about your spending and finances. I'm here to help you make smarter financial decisions.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(q); setTimeout(handleSend, 100) }}
                        className="glass rounded-2xl p-4 text-left hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-1 group border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{q}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
                    >
                      <div className={`max-w-[85%] md:max-w-[70%] px-5 py-4 rounded-2xl shadow-premium ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white' 
                          : 'glass text-foreground border border-border'
                      }`}>
                        <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start animate-slide-in">
                      <div className="glass border border-border px-5 py-4 rounded-2xl shadow-premium">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          {/* Input Area */}
          <div className="flex-shrink-0 p-4 md:p-6 border-t border-border glass backdrop-blur-sm">
            <div className="flex space-x-3 md:space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about your finances..."
                className="flex-1 px-4 py-3 text-base bg-background/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all duration-300 placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-premium hover:shadow-premium-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-105 transition-all duration-300 rounded-2xl"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}