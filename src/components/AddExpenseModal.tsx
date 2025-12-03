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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="glass w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto border border-border shadow-premium-lg animate-scale-in">
        <div className="sticky top-0 glass-premium border-b border-border px-6 py-5 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Add Expense</h2>
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
            <label className="block text-sm font-semibold text-foreground mb-3">Amount *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-premium w-full pl-8 pr-4 py-4 text-lg font-semibold"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-premium w-full px-4 py-4"
              placeholder="e.g., Lunch at restaurant"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-premium w-full px-4 py-4"
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
              <label className="block text-sm font-semibold text-foreground mb-3">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-premium w-full px-4 py-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Bank</label>
              <select
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="input-premium w-full px-4 py-4"
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
              <label className="block text-sm font-semibold text-foreground mb-3">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="input-premium w-full px-4 py-4"
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Wallet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input-premium w-full px-4 py-4"
              placeholder="e.g., work, lunch, team"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-premium w-full px-4 py-4 resize-none"
              rows={3}
              placeholder="Add any additional details..."
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
              className="flex-1 py-4 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl font-semibold transition-all duration-200 hover:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
