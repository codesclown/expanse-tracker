'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/lib/api'

interface DataContextType {
  refreshTrigger: number
  triggerRefresh: () => void
  financialSummary: any
  refreshFinancialSummary: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [financialSummary, setFinancialSummary] = useState<any>(null)

  const triggerRefresh = () => {
    console.log('🔄 Triggering global data refresh...')
    setRefreshTrigger(prev => prev + 1)
  }

  const refreshFinancialSummary = async () => {
    try {
      console.log('📊 Refreshing financial summary...')
      const summary = await api.getFinancialSummary()
      setFinancialSummary(summary)
      console.log('✅ Financial summary updated:', summary)
    } catch (error) {
      console.error('❌ Failed to fetch financial summary:', error)
    }
  }

  useEffect(() => {
    refreshFinancialSummary()
  }, [refreshTrigger])

  return (
    <DataContext.Provider value={{ 
      refreshTrigger, 
      triggerRefresh, 
      financialSummary, 
      refreshFinancialSummary 
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}