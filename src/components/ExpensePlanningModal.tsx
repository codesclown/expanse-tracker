'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface ExpensePlanningModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (expense: any) => void
}

const categories = [
  { id: 'trip', label: 'Trip Expense', icon: '✈️' },
  { id: 'festival', label: 'Festival Expense', icon: '🎉' },
  { id: 'other', label: 'Other Daily', icon: '📝' },
  { id: 'monthly', label: 'Monthly Expense', icon: '📅' },
  { id: 'yearly', label: 'Yearly Expense', icon: '🗓️' }
]

export default function ExpensePlanningModal({ isOpen, onClose, onSave }: ExpensePlanningModalProps) {
  const { addNotification } = useNotification()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    amount: '',
    category: 'trip',
    description: '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.amount) {
      addNotification({
        type: 'error',
        title: 'Missing Fields',
        message: 'Please fill all required fields',
        duration: 3000
      })
      return
    }

    const expense = {
      ...formData,
      amount: parseFloat(formData.amount),
      notes: formData.description
    }
    
    onSave(expense)
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      amount: '',
      category: 'trip',
      description: '',
    })
  }

  const handleClose = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      amount: '',
      category: 'trip',
      description: '',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="glass w-full sm:max-w-lg rounded-xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col border border-border shadow-premium-lg animate-scale-in">
        <div className="flex-shrink-0 glass-premium border-b border-border px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Plan Expense</h2>
          </div>
          <button 
            onClick={handleClose} 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Expense Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-premium w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base"
              placeholder="Enter expense title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Expected Amount *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-premium w-full pl-7 pr-3 py-2.5 sm:py-3 text-sm sm:text-base"
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Expected Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-premium w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Category</label>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.id })}
                  className={`flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 ${
                    formData.category === category.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-secondary/50'
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium flex-1 text-left">{category.label}</span>
                  {formData.category === category.id && (
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-premium w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base resize-none"
              placeholder="Add description (optional)"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 sm:py-3 border border-border text-muted-foreground rounded-xl font-medium hover:bg-secondary transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              Plan Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}