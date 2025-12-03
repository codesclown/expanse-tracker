'use client'

import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

export default function Settings() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isTransitioning } = useTheme()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const menuItems = [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Profile', description: 'Manage your personal information' },
        { icon: '🔔', label: 'Notifications', description: 'Configure alerts and reminders' },
        { icon: '🔒', label: 'Security', description: 'Password and authentication' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: '💳', label: 'Bank Sync', description: 'Connect your bank accounts', badge: 'Beta' },
        { icon: '💰', label: 'Currency', description: 'Change default currency' },
        { icon: '📊', label: 'Categories', description: 'Customize expense categories' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: '❓', label: 'Help & Support', description: 'Get help and contact us' },
        { icon: 'ℹ️', label: 'About', description: 'App version and information' },
      ]
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm text-white/80 font-medium bg-white/10 px-2 py-1 rounded-full">
                        Preferences
                      </span>
                      <span className="w-1 h-1 bg-white/60 rounded-full"></span>
                      <span className="text-xs text-white/60">
                        Account & Privacy
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                      Settings
                    </h1>
                  </div>
                </div>
                <p className="text-sm md:text-base text-white/80 max-w-md">
                  Manage your account, preferences, and app settings
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
          {/* Profile Card */}
          <div className="glass rounded-2xl p-6 border border-border shadow-lg mb-6 animate-slide-in">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-xl md:text-2xl text-foreground">{user?.name || 'User'}</p>
                <p className="text-muted-foreground text-sm">{user?.email || 'user@example.com'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-muted-foreground text-xs">Member since {new Date().getFullYear()}</span>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-medium">
                    Pro
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          {menuItems.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6 animate-slide-in" style={{ animationDelay: `${(sectionIndex + 1) * 100}ms` }}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">{section.title}</h2>
              <div className="glass rounded-2xl border border-border shadow-lg overflow-hidden">
                {section.items.map((item, index) => (
                  <button
                    key={item.label}
                    className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 border-b border-border last:border-0 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          {item.label}
                          {item.badge && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                              {item.badge}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="btn-premium w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg flex items-center justify-center gap-2 animate-slide-in"
            style={{ animationDelay: '400ms' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </main>
      </div>
      <BottomNav />
    </>
  )
}