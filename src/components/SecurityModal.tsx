'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface SecurityModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  const { addNotification } = useNotification()
  const [activeTab, setActiveTab] = useState<'password' | 'twofa' | 'sessions'>('password')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  if (!isOpen) return null

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addNotification({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New passwords do not match.',
        duration: 4000
      })
      return
    }

    // Here you would typically update the password via API
    addNotification({
      type: 'success',
      title: 'Password Updated',
      message: 'Your password has been successfully changed.',
      duration: 4000
    })
    
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    onClose()
  }

  const tabs = [
    { id: 'password', label: 'Password', icon: '🔒' },
    { id: 'twofa', label: '2FA', icon: '🛡️' },
    { id: 'sessions', label: 'Sessions', icon: '📱' },
  ]

  const activeSessions = [
    { id: 1, device: 'iPhone 14 Pro', location: 'New York, US', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'MacBook Pro', location: 'New York, US', lastActive: '1 hour ago', current: false },
    { id: 3, device: 'Chrome Browser', location: 'California, US', lastActive: '2 days ago', current: false },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass w-full sm:max-w-lg rounded-3xl max-h-[85vh] flex flex-col border border-border shadow-premium-lg animate-scale-in">
        <div className="flex-shrink-0 glass-premium border-b border-border px-6 py-5 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="heading-sub text-foreground">Security</h2>
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

        {/* Tabs */}
        <div className="flex-shrink-0 border-b border-border">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 btn-text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block label-text text-foreground mb-3">Current Password *</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-premium w-full px-4 py-4 nav-text"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="block label-text text-foreground mb-3">New Password *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-premium w-full px-4 py-4 nav-text"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="block label-text text-foreground mb-3">Confirm New Password *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input-premium w-full px-4 py-4 nav-text"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl btn-text transition-all duration-200 hover:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl btn-text transition-all duration-200 hover:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          {activeTab === 'twofa' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="heading-card mb-2">Two-Factor Authentication</h3>
                <p className="caption-text mb-6">Add an extra layer of security to your account</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-2xl">
                  <div>
                    <p className="nav-text text-foreground">Authenticator App</p>
                    <p className="caption-text">Use Google Authenticator or similar</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white rounded-xl btn-text-sm hover:bg-primary/90 transition-colors">
                    Enable
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-2xl">
                  <div>
                    <p className="nav-text text-foreground">SMS Verification</p>
                    <p className="caption-text">Receive codes via text message</p>
                  </div>
                  <button className="px-4 py-2 bg-secondary text-foreground rounded-xl btn-text-sm hover:bg-secondary/80 transition-colors">
                    Setup
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="heading-card mb-2">Active Sessions</h3>
                <p className="caption-text">Manage your active login sessions</p>
              </div>

              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="nav-text text-foreground flex items-center gap-2">
                        {session.device}
                        {session.current && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full caption-text font-medium">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="caption-text">{session.location} • {session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <button className="px-3 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg btn-text-sm transition-colors">
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}