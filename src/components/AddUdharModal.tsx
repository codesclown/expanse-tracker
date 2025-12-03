'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface AddUdharModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (udhar: any) => void
}

export default function AddUdharModal({ isOpen, onClose, onSave }: AddUdharModalProps) {
  const { addNotification } = useNotification()
  const [formData, setFormData] = useState({
    person: '',
    reason: '',
    total: '',
    direction: 'given',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const udhar = {
      ...formData,
      total: parseInt(formData.total),
      remaining: parseInt(formData.total),
    }
    
    onSave(udhar)
    
    // Show success notification
    addNotification({
      type: 'success',
      title: 'Loan Added',
      message: `₹${udhar.total.toLocaleString()} loan ${udhar.direction === 'given' ? 'given to' : 'taken from'} ${udhar.person} has been recorded.`,
      duration: 4000
    })
    
    setFormData({
      person: '',
      reason: '',
      total: '',
      direction: 'given',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="glass w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto border border-border shadow-premium-lg animate-scale-in">
        <div className="sticky top-0 glass-premium border-b border-border px-6 py-5 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Add Loan</h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, direction: 'given' })}
                className={`py-4 rounded-2xl font-semibold transition-all duration-200 ${
                  formData.direction === 'given'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                }`}
              >
                Given (Lent)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, direction: 'taken' })}
                className={`py-4 rounded-2xl font-semibold transition-all duration-200 ${
                  formData.direction === 'taken'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg'
                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                }`}
              >
                Taken (Borrowed)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Person *</label>
            <input
              type="text"
              value={formData.person}
              onChange={(e) => setFormData({ ...formData, person: e.target.value })}
              className="input-premium w-full px-4 py-4"
              placeholder="Name of person"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Amount *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <input
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                className="input-premium w-full pl-8 pr-4 py-4 text-lg font-semibold"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Reason</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-premium w-full px-4 py-4"
              placeholder="e.g., Emergency, Business, Personal"
            />
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl font-semibold transition-all duration-200 hover:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl font-semibold transition-all duration-200 hover:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Save Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
