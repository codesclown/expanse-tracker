'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import ProfileModal from '@/components/ProfileModal'
import NotificationSettingsModal from '@/components/NotificationSettingsModal'
import SecurityModal from '@/components/SecurityModal'
import CurrencyModal from '@/components/CurrencyModal'
import CategoriesModal from '@/components/CategoriesModal'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useNotification } from '@/contexts/NotificationContext'

export default function Settings() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme, isTransitioning } = useTheme()
  const { addNotification } = useNotification()
  const router = useRouter()
  
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const handleLogout = () => {
    logout()
    addNotification({
      type: 'success',
      title: 'Logged Out',
      message: 'You have been successfully logged out.',
      duration: 3000
    })
    router.push('/login')
  }

  const openModal = (modalName: string) => {
    setActiveModal(modalName)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const menuItems = [
    {
      title: 'Account',
      items: [
        { icon: '👤', label: 'Profile', description: 'Manage your personal information', action: () => openModal('profile') },
        { icon: '🔔', label: 'Notifications', description: 'Configure alerts and reminders', action: () => openModal('notifications') },
        { icon: '🔒', label: 'Security', description: 'Password and authentication', action: () => openModal('security') },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: '💳', label: 'Bank Sync', description: 'Connect your bank accounts', badge: 'Beta', action: () => {
          addNotification({
            type: 'info',
            title: 'Coming Soon',
            message: 'Bank sync feature is currently in development.',
            duration: 4000
          })
        }},
        { icon: '💰', label: 'Currency', description: 'Change default currency', action: () => openModal('currency') },
        { icon: '📊', label: 'Categories', description: 'Customize expense categories', action: () => openModal('categories') },
      ]
    },
    {
      title: 'App Settings',
      items: [
        { icon: '🌙', label: 'Theme', description: `Current: ${theme === 'dark' ? 'Dark' : 'Light'} mode`, action: () => {
          toggleTheme()
          addNotification({
            type: 'success',
            title: 'Theme Changed',
            message: `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode.`,
            duration: 3000
          })
        }},
        { icon: '🗄️', label: 'Data Export', description: 'Export your financial data', action: () => {
          addNotification({
            type: 'info',
            title: 'Export Started',
            message: 'Your data export will be ready shortly.',
            duration: 4000
          })
        }},
        { icon: '🗑️', label: 'Clear Data', description: 'Reset all app data', action: () => {
          if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.clear()
            addNotification({
              type: 'success',
              title: 'Data Cleared',
              message: 'All app data has been cleared.',
              duration: 4000
            })
          }
        }},
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: '❓', label: 'Help & Support', description: 'Get help and contact us', action: () => {
          addNotification({
            type: 'info',
            title: 'Support',
            message: 'Contact us at support@financetracker.com',
            duration: 5000
          })
        }},
        { icon: 'ℹ️', label: 'About', description: 'App version and information', action: () => {
          addNotification({
            type: 'info',
            title: 'About FinanceTracker',
            message: 'Version 1.0.0 - Built with Next.js and TypeScript',
            duration: 5000
          })
        }},
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
          <div className="relative max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-white space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-md">
                    <svg
                      className="w-5 h-5 text-white"
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
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-white/70 bg-white/10 px-2 py-0.5 rounded-md">
                        Preferences
                      </span>
                      <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                      <span className="text-xs text-white/50">
                        Account & Privacy
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold">
                      Settings
                    </h1>
                  </div>
                </div>
                <p className="text-sm text-white/70 max-w-md">
                  Manage your account, preferences, and app settings
                </p>
              </div>

              <button
                onClick={toggleTheme}
                disabled={isTransitioning}
                aria-label="Toggle theme"
                className={`theme-toggle-btn flex-shrink-0 p-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-300 shadow-md hover:shadow-lg ${
                  isTransitioning ? 'animate-theme-toggle' : ''
                } disabled:opacity-50`}
              >
                <div className="relative w-5 h-5">
                  <svg
                    className={`absolute inset-0 w-5 h-5 text-white transition-all duration-300 ${
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
                    className={`absolute inset-0 w-5 h-5 text-white transition-all duration-300 ${
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

        <main className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 -mt-12 pb-safe relative z-10 space-y-6">
          {/* Slick Profile Card */}
          <div className="glass-premium rounded-2xl p-6 border border-border/50 shadow-premium mb-6 animate-slide-in relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-3">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-indigo-500/20" />
            </div>
            
            <div className="relative flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-foreground mb-1 truncate">
                  {user?.name || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground mb-2 truncate">
                  {user?.email || 'user@example.com'}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full border border-emerald-200/30 dark:border-emerald-800/30">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-full border border-violet-200/30 dark:border-violet-800/30">
                    <svg className="w-2.5 h-2.5 text-violet-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                      Pro
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Since {new Date().getFullYear()}
                  </span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-sm font-medium">Premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slick Menu Sections */}
          {menuItems.map((section, sectionIndex) => (
            <div key={section.title} className="mb-6 animate-slide-in" style={{ animationDelay: `${(sectionIndex + 1) * 80}ms` }}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{section.title}</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent"></div>
              </div>
              
              <div className="glass rounded-2xl border border-border/30 shadow-lg overflow-hidden">
                {section.items.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-purple-50/30 dark:hover:from-violet-900/10 dark:hover:to-purple-900/10 transition-all duration-200 border-b border-border/20 last:border-0 group relative"
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100/80 to-purple-100/80 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center text-lg group-hover:scale-105 transition-all duration-200 shadow-sm">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {item.label}
                          </p>
                          {item.badge && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-700 dark:text-amber-300 rounded-md text-xs font-medium border border-amber-200/30 dark:border-amber-800/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/70 transition-colors">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative z-10 flex items-center">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500/5 to-purple-500/5 dark:from-violet-400/5 dark:to-purple-400/5 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-violet-500/10 group-hover:to-purple-500/10 transition-all duration-200">
                        <svg className="w-3 h-3 text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Slick Logout Button */}
          <div className="relative animate-slide-in" style={{ animationDelay: '320ms' }}>
            <button
              onClick={handleLogout}
              className="w-full p-4 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-2xl shadow-lg hover:shadow-xl hover:shadow-red-500/20 flex items-center gap-3 transition-all duration-200 hover:scale-[0.99] group relative overflow-hidden"
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:scale-105 transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">Sign Out</p>
                <p className="text-xs text-white/70">End your current session</p>
              </div>
              
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-200">
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProfileModal isOpen={activeModal === 'profile'} onClose={closeModal} />
      <NotificationSettingsModal isOpen={activeModal === 'notifications'} onClose={closeModal} />
      <SecurityModal isOpen={activeModal === 'security'} onClose={closeModal} />
      <CurrencyModal isOpen={activeModal === 'currency'} onClose={closeModal} />
      <CategoriesModal isOpen={activeModal === 'categories'} onClose={closeModal} />

      <BottomNav />
    </>
  )
}