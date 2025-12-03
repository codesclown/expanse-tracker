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
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
    
    setTheme(initialTheme)
    
    // Apply theme immediately without transition on initial load
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
    document.documentElement.style.setProperty('--theme-transition', 'none')
    
    // Enable transitions after a brief delay
    setTimeout(() => {
      document.documentElement.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)')
    }, 100)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme)
      
      // Add transition class and update theme
      setIsTransitioning(true)
      document.documentElement.classList.add('theme-transitioning')
      document.documentElement.classList.toggle('dark', theme === 'dark')
      
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
