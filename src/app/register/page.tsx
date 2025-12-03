'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [salary, setSalary] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const salaryValue = salary ? parseInt(salary) : undefined
      console.log('Registering with:', { name, email, salary: salaryValue })
      await register(name, email, password, salaryValue)
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Registration error:', err)
      if (err.message?.includes('Database not configured')) {
        setError('Database not available. The app will work in local storage mode. Redirecting to dashboard...')
      } else {
        setError(err.message || 'Registration failed. Using local storage mode.')
      }
      // Even if API fails, we can still use local storage
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
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

      {/* Back to Home Link */}
      <Link 
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl shadow-premium-lg p-6 md:p-8 border border-border backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8 animate-slide-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-premium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">FinanceTracker</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Join FinanceTracker
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Begin your journey to financial freedom
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-premium w-full"
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium w-full"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-premium w-full"
                placeholder="Create a strong password"
                required
                minLength={6}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters long
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Monthly Salary <span className="text-muted-foreground font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="input-premium w-full pl-8"
                  placeholder="50000"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This helps us provide better financial insights
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-premium hover:shadow-premium-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group mt-4 py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Create Account
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-4 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>


      </div>
    </div>
  )
}