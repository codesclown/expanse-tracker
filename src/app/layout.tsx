'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { DataProvider } from '@/contexts/DataContext'
import ExpiryCheckerInitializer from '@/components/ExpiryCheckerInitializer'

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
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Expense Tracker" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Expense Tracker" />
        <meta name="description" content="Track expenses, plan budgets, manage shopping lists and control your finances with smart insights" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#3b82f6" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icon-152.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192.svg" />

        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icon-32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icon-16.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icon-192.svg" color="#3b82f6" />
        <link rel="shortcut icon" href="/favicon.ico" />
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

                // Register service worker for PWA
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
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
                <ExpiryCheckerInitializer />
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
