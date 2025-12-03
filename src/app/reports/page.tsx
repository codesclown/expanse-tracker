'use client'

import BottomNav from '@/components/BottomNav'
import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'

export default function Reports() {
  const { theme, toggleTheme, isTransitioning } = useTheme()
  const [selectedPeriod, setSelectedPeriod] = useState('This Month')
  const [generating, setGenerating] = useState(false)

  const handleGenerateReport = (type: 'pdf' | 'excel') => {
    setGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setGenerating(false)
      alert(`${type.toUpperCase()} report generated successfully!`)
    }, 2000)
  }

  const reportTypes = [
    {
      title: 'Expense Summary',
      description: 'Detailed breakdown of all expenses',
      icon: '📊',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Category Analysis',
      description: 'Spending patterns by category',
      icon: '🎯',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Monthly Trends',
      description: 'Month-over-month comparison',
      icon: '📈',
      color: 'from-emerald-500 to-emerald-600'
    }
  ]

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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm text-white/80 font-medium bg-white/10 px-2 py-1 rounded-full">
                        Analytics
                      </span>
                      <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                      <span className="text-xs text-white/60">
                        Export & Analyze
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                      Financial Reports
                    </h1>
                  </div>
                </div>
                <p className="text-sm md:text-base text-white/80 max-w-md">
                  Generate detailed reports and export your financial data
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

        <main className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 -mt-12 pb-safe relative z-10 space-y-8">
          {/* Report Generator */}
          <div className="glass rounded-2xl p-6 border border-border shadow-lg mb-6 animate-slide-in">
            <h2 className="text-xl font-bold text-foreground mb-4">Generate Report</h2>
            
            {/* Period Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2">Select Period</label>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-premium w-full"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
                <option>Last Year</option>
                <option>Custom Range</option>
              </select>
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleGenerateReport('pdf')}
                disabled={generating}
                className="btn-premium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate PDF</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleGenerateReport('excel')}
                disabled={generating}
                className="btn-premium bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <span>Export Excel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Report Types */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Report Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportTypes.map((report, index) => (
                <div
                  key={report.title}
                  className="card-premium hover-lift p-4 group animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{report.icon}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="glass rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Recent Reports</h2>
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">No reports generated yet</p>
                <p className="text-muted-foreground text-sm">
                  Generate your first report to see it here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  )
}