'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (expense: any) => void
}

export default function AddExpenseModal({ isOpen, onClose, onSave }: AddExpenseModalProps) {
  const { addNotification } = useNotification()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    amount: '',
    category: 'Food',
    bank: 'Cash',
    paymentMode: 'Cash',
    tags: '',
    notes: '',
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const expense = {
      ...formData,
      amount: parseInt(formData.amount),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    

    onSave(expense)
    
    // Show success notification
    addNotification({
      type: 'success',
      title: 'Expense Added',
      message: `₹${expense.amount.toLocaleString()} expense for ${expense.title} has been recorded.`,
      duration: 4000
    })
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      amount: '',
      category: 'Food',
      bank: 'Cash',
      paymentMode: 'Cash',
      tags: '',
      notes: '',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="glass w-full sm:max-w-lg rounded-xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col border border-border shadow-premium-lg animate-scale-in">
        <div className="flex-shrink-0 glass-premium border-b border-border px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Add Expense</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Amount *</label>
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
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-premium w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base"
              placeholder="e.g., Lunch at restaurant"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-premium w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Entertainment</option>
                <option>Bills</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-premium w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Bank</label>
              <select
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="input-premium w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                <option>Cash</option>
                <option>HDFC</option>
                <option>ICICI</option>
                <option>Axis</option>
                <option>SBI</option>
                <option>Kotak</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="input-premium w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base"
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Wallet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input-premium w-full px-3 py-2.5 sm:py-3 text-sm sm:text-base"
              placeholder="e.g., work, lunch, team"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-premium w-full px-3 py-2.5 sm:py-3 resize-none text-sm sm:text-base"
              rows={3}
              placeholder="Add any additional details..."
            />
          </div>

          <div className="flex space-x-3 pt-4 sm:pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 hover:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 hover:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
