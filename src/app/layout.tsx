'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { DataProvider } from '@/contexts/DataContext'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Get saved theme or system preference
                  var theme = null;
                  try {
                    theme = localStorage.getItem('theme');
                  } catch (e) {
                    // localStorage might not be available (private browsing, etc.)
                  }
                  
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var actualTheme = theme || (prefersDark ? 'dark' : 'light');
                  
                  // Apply theme immediately
                  var root = document.documentElement;
                  if (actualTheme === 'dark') {
                    root.classList.add('dark');
                  } else {
                    root.classList.remove('dark');
                  }
                  
                  // Set color scheme for better browser integration
                  root.style.colorScheme = actualTheme;
                  
                  // Disable transitions initially to prevent flash
                  root.style.setProperty('--theme-transition', 'none');
                  
                  // Listen for system theme changes (only if no saved preference)
                  if (window.matchMedia && !theme) {
                    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
                      try {
                        if (!localStorage.getItem('theme')) {
                          var newTheme = e.matches ? 'dark' : 'light';
                          if (newTheme === 'dark') {
                            root.classList.add('dark');
                          } else {
                            root.classList.remove('dark');
                          }
                          root.style.colorScheme = newTheme;
                        }
                      } catch (err) {
                        // Ignore localStorage errors
                      }
                    });
                  }
                } catch (e) {
                  // Fallback to light theme if there's an error
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <DataProvider>
                <div className="min-h-screen transition-colors duration-300">
                  {children}
                </div>
              </DataProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
