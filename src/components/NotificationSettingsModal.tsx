'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const { addNotification } = useNotification()
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    expenseAlerts: true,
    budgetWarnings: true,
    weeklyReports: false,
    monthlyReports: true,
    transactionUpdates: true,
    securityAlerts: true,
  })

  if (!isOpen) return null

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    // Here you would typically save the settings via API
    addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your notification preferences have been updated.',
      duration: 4000
    })
    onClose()
  }

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )

  const notificationSections = [
    {
      title: 'General',
      items: [
        { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive notifications on your device' },
        { key: 'emailNotifications', label: 'Email Notifications', description: 'Get updates via email' },
      ]
    },
    {
      title: 'Expense Tracking',
      items: [
        { key: 'expenseAlerts', label: 'Expense Alerts', description: 'Get notified when you add expenses' },
        { key: 'budgetWarnings', label: 'Budget Warnings', description: 'Alert when approaching budget limits' },
        { key: 'transactionUpdates', label: 'Transaction Updates', description: 'Updates on transaction status' },
      ]
    },
    {
      title: 'Reports',
      items: [
        { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly spending summaries' },
        { key: 'monthlyReports', label: 'Monthly Reports', description: 'Get detailed monthly reports' },
      ]
    },
    {
      title: 'Security',
      items: [
        { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications' },
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass w-full sm:max-w-lg rounded-3xl max-h-[85vh] flex flex-col border border-border shadow-premium-lg animate-scale-in">
        <div className="flex-shrink-0 glass-premium border-b border-border px-6 py-5 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zM15 7h5l-5-5v5zM9 17H4l5 5v-5z" />
              </svg>
            </div>
            <h2 className="heading-sub text-foreground">Notifications</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {notificationSections.map((section) => (
            <div key={section.title}>
              <h3 className="heading-card mb-4">{section.title}</h3>
              <div className="space-y-4">
                {section.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="nav-text text-foreground">{item.label}</p>
                      <p className="caption-text">{item.description}</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings[item.key as keyof typeof settings]}
                      onToggle={() => handleToggle(item.key as keyof typeof settings)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex space-x-4 pt-6">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl btn-text transition-all duration-200 hover:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-2xl btn-text transition-all duration-200 hover:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}