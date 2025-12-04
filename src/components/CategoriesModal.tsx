'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface CategoriesModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CategoriesModal({ isOpen, onClose }: CategoriesModalProps) {
  const { addNotification } = useNotification()
  const [categories, setCategories] = useState([
    { id: 1, name: 'Food', icon: '🍽️', color: 'from-orange-500 to-red-500', enabled: true },
    { id: 2, name: 'Transport', icon: '🚗', color: 'from-blue-500 to-indigo-500', enabled: true },
    { id: 3, name: 'Shopping', icon: '🛍️', color: 'from-pink-500 to-rose-500', enabled: true },
    { id: 4, name: 'Entertainment', icon: '🎬', color: 'from-purple-500 to-violet-500', enabled: true },
    { id: 5, name: 'Bills', icon: '📄', color: 'from-yellow-500 to-amber-500', enabled: true },
    { id: 6, name: 'Healthcare', icon: '🏥', color: 'from-green-500 to-emerald-500', enabled: true },
    { id: 7, name: 'Education', icon: '📚', color: 'from-indigo-500 to-blue-500', enabled: true },
    { id: 8, name: 'Travel', icon: '✈️', color: 'from-cyan-500 to-teal-500', enabled: false },
    { id: 9, name: 'Fitness', icon: '💪', color: 'from-lime-500 to-green-500', enabled: false },
    { id: 10, name: 'Gifts', icon: '🎁', color: 'from-rose-500 to-pink-500', enabled: false },
  ])
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📝' })
  const [showAddForm, setShowAddForm] = useState(false)

  if (!isOpen) return null

  const toggleCategory = (id: number) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, enabled: !cat.enabled } : cat
    ))
  }

  const addCategory = () => {
    if (!newCategory.name.trim()) return

    const newCat = {
      id: Date.now(),
      name: newCategory.name,
      icon: newCategory.icon,
      color: 'from-gray-500 to-slate-500',
      enabled: true
    }

    setCategories(prev => [...prev, newCat])
    setNewCategory({ name: '', icon: '📝' })
    setShowAddForm(false)

    addNotification({
      type: 'success',
      title: 'Category Added',
      message: `${newCategory.name} category has been created.`,
      duration: 3000
    })
  }

  const deleteCategory = (id: number) => {
    setCategories(prev => prev.filter(cat => cat.id !== id))
    addNotification({
      type: 'success',
      title: 'Category Deleted',
      message: 'Category has been removed.',
      duration: 3000
    })
  }

  const handleSave = () => {
    // Here you would typically save the categories via API
    addNotification({
      type: 'success',
      title: 'Categories Updated',
      message: 'Your expense categories have been saved.',
      duration: 4000
    })
    onClose()
  }

  const emojiOptions = ['📝', '💼', '🏠', '🎯', '⚡', '🔧', '🎨', '🌟', '💡', '🚀']

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="glass w-full sm:max-w-lg rounded-xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col border border-border shadow-premium-lg animate-scale-in">
        <div className="flex-shrink-0 glass-premium border-b border-border px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Categories</h2>
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Expense Categories</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Customize your expense categories</p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Add New
              </button>
            </div>

            {showAddForm && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-border rounded-lg sm:rounded-xl bg-secondary/20">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Category Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="input-premium w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base"
                      placeholder="Enter category name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">Icon</label>
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setNewCategory({ ...newCategory, icon: emoji })}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg transition-colors ${
                            newCategory.icon === emoji ? 'bg-primary text-white' : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addCategory}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-secondary text-foreground rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:bg-secondary/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 ${
                  category.enabled ? 'border-border bg-background' : 'border-border bg-secondary/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg`}>
                    <span className="text-base sm:text-lg">{category.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-medium text-foreground">{category.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{category.enabled ? 'Active' : 'Disabled'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none ${
                      category.enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        category.enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  {category.id > 7 && (
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-1 sm:p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 pt-4 sm:pt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 hover:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 hover:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Save Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}