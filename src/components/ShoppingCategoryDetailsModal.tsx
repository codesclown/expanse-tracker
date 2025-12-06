'use client'

import { useState } from 'react'
import { useNotification } from '@/contexts/NotificationContext'

interface ShoppingCategoryDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  category: any
  items: any[]
  onDeleteItem: (id: string) => void
  onEditItem: (item: any) => void
  onMarkBought: (item: any) => void
  onExport: (format: 'pdf' | 'excel' | 'email') => void
}

export default function ShoppingCategoryDetailsModal({
  isOpen,
  onClose,
  category,
  items,
  onDeleteItem,
  onEditItem,
  onMarkBought,
  onExport
}: ShoppingCategoryDetailsModalProps) {
  const { addNotification } = useNotification()
  const [showExportMenu, setShowExportMenu] = useState(false)

  if (!isOpen || !category) return null

  const variance = category.realCost - category.expectedCost
  const progress = category.expectedCost > 0 ? (category.realCost / category.expectedCost) * 100 : 0

  const boughtItems = items.filter(item => item.isBought)
  const pendingItems = items.filter(item => !item.isBought)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="glass-premium w-full sm:max-w-3xl rounded-2xl sm:rounded-3xl max-h-[94vh] sm:max-h-[88vh] flex flex-col border border-white/10 shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative flex-shrink-0 px-3 py-2.5 sm:px-4 sm:py-3 border-b border-white/10 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-green-600/5"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} rounded-lg blur-md opacity-50`}></div>
                  <div className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-lg sm:text-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] brightness-150 contrast-125 saturate-150">
                      {category.icon}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground">{category.name}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded-full font-medium">{items.length} items</span>
                    {category.isActive && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                        ● Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onClose} 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary/50 hover:bg-secondary/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 hover:rotate-90 border border-border/50"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Export Actions */}
            <div className="flex justify-end">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-green-500/15 to-teal-500/15 hover:from-emerald-500/25 hover:via-green-500/25 hover:to-teal-500/25 border border-emerald-400/30 dark:border-emerald-500/30 backdrop-blur-sm text-emerald-600 dark:text-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                  title="Export"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-[10px] font-bold">Export</span>
                </button>
                
                {showExportMenu && (
                  <div className="absolute top-full right-0 mt-1.5 w-36 glass-premium rounded-lg border border-border shadow-premium-lg overflow-hidden z-10 animate-scale-in">
                    <button
                      onClick={() => { onExport('pdf'); setShowExportMenu(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-secondary/50 transition-all flex items-center gap-2 group"
                    >
                      <div className="w-5 h-5 rounded bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-semibold">PDF</span>
                    </button>
                    <button
                      onClick={() => { onExport('excel'); setShowExportMenu(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-secondary/50 transition-all flex items-center gap-2 group"
                    >
                      <div className="w-5 h-5 rounded bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-semibold">Excel</span>
                    </button>
                    <button
                      onClick={() => { onExport('email'); setShowExportMenu(false); }}
                      className="w-full px-3 py-2 text-left hover:bg-secondary/50 transition-all flex items-center gap-2 group"
                    >
                      <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-semibold">Email</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3 custom-scrollbar">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-premium rounded-lg p-2 border border-border/20">
              <p className="text-[10px] text-muted-foreground mb-0.5">Expected Cost</p>
              <p className="text-sm sm:text-base font-bold text-blue-600">₹{category.expectedCost.toLocaleString()}</p>
            </div>
            <div className="glass-premium rounded-lg p-2 border border-border/20">
              <p className="text-[10px] text-muted-foreground mb-0.5">Actual Cost</p>
              <p className="text-sm sm:text-base font-bold text-emerald-600">₹{category.realCost.toLocaleString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {category.expectedCost > 0 && (
            <div className="glass-premium rounded-lg p-2.5 border border-border/20">
              <div className="flex justify-between text-[10px] sm:text-xs mb-1.5">
                <span className="text-muted-foreground font-medium">Budget Progress</span>
                <span className="font-bold">{Math.min(progress, 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              {variance !== 0 && (
                <p className={`text-[10px] sm:text-xs mt-1.5 font-medium ${variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {variance > 0 ? 'Over budget by' : 'Saved'} ₹{Math.abs(variance).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Items List */}
          <div>
            {/* Pending Items */}
            {pendingItems.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  To Buy ({pendingItems.length})
                </h3>
                <div className="space-y-1.5">
                  {pendingItems.map((item) => (
                    <div key={item.id} className="glass-premium rounded-lg p-2.5 border border-border/20 hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <button
                            onClick={() => onMarkBought(item)}
                            className="mt-0.5 w-5 h-5 border-2 border-border rounded-md flex items-center justify-center hover:border-emerald-500 transition-all duration-200 hover:scale-110 flex-shrink-0"
                          >
                            {item.isBought && (
                              <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm text-foreground truncate">{item.name}</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {item.quantity} {item.unit}
                            </p>
                            {item.notes && (
                              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{item.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-bold text-blue-600">₹{item.expectedPrice.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditItem(item)}
                              className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all hover:scale-110"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all hover:scale-110"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bought Items */}
            {boughtItems.length > 0 && (
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Bought ({boughtItems.length})
                </h3>
                <div className="space-y-1.5">
                  {boughtItems.map((item) => (
                    <div key={item.id} className="glass-premium rounded-lg p-2.5 border border-border/20 bg-secondary/20 opacity-75 group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <button
                            onClick={() => onMarkBought(item)}
                            className="mt-0.5 w-5 h-5 bg-emerald-500 rounded-md flex items-center justify-center text-white hover:scale-110 transition-all duration-200 flex-shrink-0"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground line-through truncate">{item.name}</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-bold text-emerald-600">₹{item.actualPrice?.toLocaleString() || item.expectedPrice.toLocaleString()}</p>
                            {item.actualPrice && item.actualPrice !== item.expectedPrice && (
                              <p className="text-[10px] text-muted-foreground line-through">₹{item.expectedPrice.toLocaleString()}</p>
                            )}
                          </div>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all hover:scale-110 opacity-70 md:opacity-0 group-hover:opacity-100"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-xs">No items yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
