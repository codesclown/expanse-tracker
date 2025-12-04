'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isTransitioning?: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from what's already applied by the script
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if we're on client-side and get the current theme from DOM
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark')
      return isDark ? 'dark' : 'light'
    }
    return 'light' // Default for SSR
  })
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Sync with the actual DOM state (set by the script in layout)
    const isDark = document.documentElement.classList.contains('dark')
    const actualTheme = isDark ? 'dark' : 'light'
    
    // Update state to match DOM if different
    if (actualTheme !== theme) {
      setTheme(actualTheme)
    }
    
    // Mark as hydrated and enable smooth transitions after initial load
    setTimeout(() => {
      document.documentElement.classList.add('hydrated')
      document.documentElement.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)')
    }, 100)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Save theme preference (with error handling)
      try {
        localStorage.setItem('theme', theme)
      } catch (e) {
        // localStorage might not be available (private browsing, etc.)
        console.warn('Could not save theme preference:', e)
      }
      
      // Apply theme with smooth transition
      setIsTransitioning(true)
      document.documentElement.classList.add('theme-transitioning')
      
      // Update DOM class and color scheme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      document.documentElement.style.colorScheme = theme
      
      // Remove transition class after animation completes
      setTimeout(() => {
        setIsTransitioning(false)
        document.documentElement.classList.remove('theme-transitioning')
      }, 300)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    if (!isTransitioning) {
      setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }
  }

  // Always provide the context, even during hydration
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
