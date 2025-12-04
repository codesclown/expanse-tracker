'use client'

import { useState } from 'react'
import BottomNav from '@/components/BottomNav'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { HeaderSkeleton, CardSkeleton, ListItemSkeleton } from '@/components/Skeleton'
import { detectSubscriptions } from '@/lib/subscriptionDetector'
import { useTheme } from '@/contexts/ThemeContext'

export default function Subscriptions() {
  const [expenses] = useLocalStorage<any[]>('expenses', [])
  const [subscriptions, setSubscriptions] = useLocalStorage<any[]>('subscriptions', [])
  const [detecting, setDetecting] = useState(false)
  const { theme, toggleTheme, isTransitioning } = useTheme()

  const handleDetect = () => {
    setDetecting(true)
    setTimeout(() => {
      const detected = detectSubscriptions(expenses)
      const newSubs = detected.filter(d => 
        !subscriptions.some(s => s.name === d.name && s.amount === d.amount)
      )
      if (newSubs.length > 0) {
        setSubscriptions([...subscriptions, ...newSubs.map(s => ({ ...s, id: Date.now() + Math.random() }))])
      }
      setDetecting(false)
    }, 1500)
  }

  const handleDelete = (id: number) => {
    if (confirm('Remove this subscription?')) {
      setSubscriptions(subscriptions.filter(s => s.id !== id))
    }
  }

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.amount, 0)

  return (
    <>
      <div className="min-h-screen bg-premium-mesh pb-32 md:pb-8 md:pl-64 lg:pl-72">
        {/* Modern Header */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm text-white/80 font-medium bg-white/10 px-2 py-1 rounded-full">
                        Recurring
                      </span>
                      <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                      <span className="text-xs text-white/60">
                        {subscriptions.length} active
                      </span>
                    </div>
                    <h1 className="heading-page">
                      Subscriptions
                    </h1>
                  </div>
                </div>
                <p className="text-sm md:text-base text-white/80 max-w-md">
                  Track and manage all your recurring payments and subscriptions
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
                <div className="relative w-6 h-6">
                  <svg
                    className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${
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
                    className={`absolute inset-0 w-6 h-6 text-white transition-all duration-300 ${
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

        <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-12 pb-safe relative z-10 space-y-8">
          {/* Stats Card */}
          <div className="glass rounded-3xl p-6 border border-border shadow-premium animate-slide-in">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Total Monthly Spending</p>
                    <p className="metric-value-large text-gradient-primary"><span className="currency-symbol-large">₹</span>{totalMonthly.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  {subscriptions.length} active subscription{subscriptions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Yearly Cost</p>
                <p className="metric-value text-gradient-primary"><span className="currency-symbol">₹</span>{(totalMonthly * 12).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Auto-Detect Button */}
          <div>
            <button
              onClick={handleDetect}
              disabled={detecting}
              className="btn-premium w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-premium hover:shadow-premium-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group py-4 btn-text-lg"
            >
              {detecting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Detecting Subscriptions...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Auto-Detect Subscriptions</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Subscriptions List */}
          <div className="glass rounded-3xl border border-border shadow-premium overflow-hidden">
            {subscriptions.length > 0 ? (
              <div className="divide-y divide-border">
                {subscriptions.map((sub, index) => (
                  <div
                    key={sub.id}
                    className="p-6 hover:bg-secondary/50 transition-all duration-300 animate-slide-in group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                          {sub.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="metric-value text-foreground">{sub.name}</p>
                            <span className="text-xs bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full font-semibold border border-amber-200/50 dark:border-amber-800/50">
                              {sub.interval}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Next due: {new Date(sub.nextDueDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sub.expenseIds.length} transaction{sub.expenseIds.length !== 1 ? 's' : ''} detected
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="metric-value-large text-gradient-primary"><span className="currency-symbol-large">₹</span>{sub.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">per {sub.interval}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all duration-300 hover:scale-110"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <p className="metric-value-large text-foreground mb-3">No subscriptions found</p>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Add recurring expenses and click detect to find your subscriptions automatically
                </p>
                <button
                  onClick={handleDetect}
                  className="btn-premium bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-premium hover:shadow-premium-lg px-8 py-4 btn-text-lg"
                >
                  Detect Subscriptions
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  )
}