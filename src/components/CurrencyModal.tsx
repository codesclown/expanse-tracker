'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface CurrencyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CurrencyModal({ isOpen, onClose }: CurrencyModalProps) {
  const { addNotification } = useNotification()
  const [selectedCurrency, setSelectedCurrency] = useState('INR')

  if (!isOpen) return null

  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  ]

  const handleSave = () => {
    // Here you would typically save the currency preference via API
    addNotification({
      type: 'success',
      title: 'Currency Updated',
      message: `Default currency changed to ${currencies.find(c => c.code === selectedCurrency)?.name}.`,
      duration: 4000
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass w-full sm:max-w-lg rounded-3xl max-h-[85vh] flex flex-col border border-border shadow-premium-lg animate-scale-in">
        <div className="flex-shrink-0 glass-premium border-b border-border px-6 py-5 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">₹</span>
            </div>
            <h2 className="heading-sub text-foreground">Currency Settings</h2>
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

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="heading-card mb-2">Select Default Currency</h3>
            <p className="caption-text">Choose your preferred currency for displaying amounts</p>
          </div>

          <div className="space-y-2">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() => setSelectedCurrency(currency.code)}
                className={`w-full p-4 rounded-2xl border transition-all duration-200 hover:scale-[0.98] ${
                  selectedCurrency === currency.code
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{currency.flag}</span>
                    <div className="text-left">
                      <p className="nav-text text-foreground">{currency.name}</p>
                      <p className="caption-text">{currency.code} • {currency.symbol}</p>
                    </div>
                  </div>
                  {selectedCurrency === currency.code && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl btn-text transition-all duration-200 hover:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl btn-text transition-all duration-200 hover:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              Save Currency
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}