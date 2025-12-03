'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { theme, toggleTheme, isTransitioning } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSubmitted(true)
    } catch (err: any) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
    } catch (err) {
      setError('Failed to resend email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-premium-mesh relative overflow-hidden flex items-center justify-center p-4 pb-8">
      {/* Background Orbs - Same as landing page */}
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

      {/* Back to Login Link */}
      <Link 
        href="/login"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Back to Login</span>
      </Link>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        disabled={isTransitioning}
        aria-label="Toggle theme"
        className={`absolute top-6 right-6 z-20 theme-toggle-btn p-3 rounded-2xl glass border border-border transition-all hover:shadow-premium ${
          isTransitioning ? 'animate-theme-toggle' : ''
        } disabled:opacity-50`}
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <svg
            className={`absolute inset-0 w-5 h-5 text-foreground transition-all duration-300 ${
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

      {/* Forgot Password Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl shadow-premium-lg p-6 md:p-8 border border-border backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-6 md:mb-8 animate-slide-in">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-premium">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-foreground">FinanceTracker</span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Forgot Password?
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-slide-in">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 text-base bg-background/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all duration-300 placeholder:text-muted-foreground"
                      placeholder="Enter your email address"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll send password reset instructions to this email address.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-premium w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-premium hover:shadow-premium-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group py-3 text-base font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Reset Link...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      Send Reset Link
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-4 text-center">
                <p className="text-muted-foreground text-sm">
                  Remember your password?{' '}
                  <Link 
                    href="/login" 
                    className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center animate-slide-in">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-premium animate-pulse">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Check Your Email
                </h1>
                <p className="text-muted-foreground text-sm md:text-base mb-4">
                  We've sent password reset instructions to:
                </p>
                <div className="glass rounded-xl p-3 mb-4 border border-border">
                  <p className="font-semibold text-foreground text-base">{email}</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Check your inbox</p>
                      <p className="text-xs text-muted-foreground">Look for an email from FinanceTracker</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Click the reset link</p>
                      <p className="text-xs text-muted-foreground">Follow the instructions in the email</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Create new password</p>
                      <p className="text-xs text-muted-foreground">Choose a strong, secure password</p>
                    </div>
                  </div>
                </div>

                {/* Resend Button */}
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="btn-premium w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-premium hover:shadow-premium-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resending...
                    </span>
                  ) : (
                    'Resend Email'
                  )}
                </button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link 
                    href="/login" 
                    className="text-muted-foreground hover:text-foreground font-medium transition-colors text-sm"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>


      </div>
    </div>
  )
}