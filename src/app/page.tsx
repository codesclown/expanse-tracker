'use client'

import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'

export default function Home() {
  const { theme, toggleTheme, isTransitioning } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-premium-mesh relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[90px] animate-float"></div>
        <div 
          className="absolute bottom-1/4 -right-24 w-96 h-96 bg-accent/25 rounded-full blur-[110px] animate-float"
          style={{ animationDelay: '2s' }}
        ></div>
        <div 
          className="absolute top-[70%] left-1/3 w-64 h-64 bg-success/20 rounded-full blur-[120px] animate-float"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      {/* NAVBAR */}
      <header className="relative z-20">
        <nav className="flex items-center justify-between p-5 md:p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">FinanceTracker</span>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              disabled={isTransitioning}
              className={`theme-toggle-btn p-3 rounded-2xl glass border border-border transition-all hover:shadow-premium ${
                isTransitioning ? 'animate-theme-toggle' : ''
              } disabled:opacity-50`}
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <svg 
                  className={`absolute inset-0 w-5 h-5 text-foreground transition-all duration-300 ${
                    theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg 
                  className={`absolute inset-0 w-5 h-5 text-foreground transition-all duration-300 ${
                    theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </button>
          )}
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 md:px-6 lg:px-8 pt-10 pb-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full border border-border shadow-premium animate-slide-in">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
          <span className="text-xs sm:text-sm text-foreground/70 font-medium">AI-Powered Financial Insights</span>
        </div>

        {/* Heading */}
        <div className="mt-10 text-center max-w-5xl space-y-6 animate-slide-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[0.9] text-foreground tracking-tight">
            Master Your Money,
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mt-2">
              Shape Your Future
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
            AI-powered financial intelligence that transforms how you track, understand, and optimize your money.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href="/register"
            className="group btn-premium w-full sm:w-auto bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white flex items-center justify-center gap-3 hover:from-violet-700 hover:to-indigo-700 hover:scale-105 shadow-premium-lg hover:shadow-premium-lg px-8 py-4 text-lg font-semibold"
          >
            <span>Start Your Journey</span>
            <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="btn-premium w-full sm:w-auto glass border border-border text-foreground hover-lift px-8 py-4 text-lg font-semibold"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-md sm:max-w-xl mx-auto mt-14">
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '₹50M+', label: 'Tracked' },
            { value: '99.9%', label: 'Uptime' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-xl sm:text-3xl font-bold text-foreground">{item.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <section className="w-full max-w-7xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 md:px-8">
          {[
            {
              title: "Intelligent Analytics",
              desc: "Advanced AI algorithms analyze your spending patterns and provide actionable insights to optimize your financial health.",
              gradient: "from-violet-500 via-purple-600 to-indigo-600",
              icon: (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                />
              )
            },
            {
              title: "Smart Automation",
              desc: "Effortlessly categorize transactions, detect subscriptions, and track recurring expenses with zero manual input.",
              gradient: "from-emerald-500 via-teal-600 to-cyan-600",
              icon: (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              )
            },
            {
              title: "Personal AI Coach",
              desc: "Get personalized financial advice, budget recommendations, and investment suggestions tailored to your goals.",
              gradient: "from-rose-500 via-pink-600 to-fuchsia-600",
              icon: (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                />
              )
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="glass rounded-3xl p-8 flex flex-col group hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-2 border border-border"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-premium group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}