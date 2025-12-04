import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useNotification } from '@/contexts/NotificationContext'
import { useData } from '@/contexts/DataContext'

export function useIncomes() {
  const [incomes, setIncomes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()
  const { triggerRefresh } = useData()

  const fetchIncomes = async (filters?: any) => {
    try {
      setLoading(true)
      const data = await api.getIncomes(filters)
      setIncomes(data)
    } catch (error: any) {
      console.error('Failed to fetch incomes:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch incomes',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const addIncome = async (income: any) => {
    try {
      const newIncome = await api.createIncome(income)
      setIncomes(prev => [newIncome, ...prev])
      triggerRefresh() // Trigger global data refresh
      addNotification({
        type: 'success',
        title: 'Income Added',
        message: `₹${income.amount.toLocaleString()} income has been recorded.`,
        duration: 4000
      })
      return newIncome
    } catch (error: any) {
      console.error('Failed to add income:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to add income',
        duration: 4000
      })
      throw error
    }
  }

  const updateIncome = async (income: any) => {
    try {
      const updatedIncome = await api.updateIncome(income.id, income)
      setIncomes(prev => prev.map(i => i.id === income.id ? updatedIncome : i))
      triggerRefresh() // Trigger global data refresh
      addNotification({
        type: 'success',
        title: 'Income Updated',
        message: `Income has been successfully updated.`,
        duration: 4000
      })
      return updatedIncome
    } catch (error: any) {
      console.error('Failed to update income:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update income',
        duration: 4000
      })
      throw error
    }
  }

  const deleteIncome = async (id: string) => {
    try {
      await api.deleteIncome(id)
      setIncomes(prev => prev.filter(i => i.id !== id))
      triggerRefresh() // Trigger global data refresh
      addNotification({
        type: 'success',
        title: 'Income Deleted',
        message: 'Income has been successfully deleted.',
        duration: 4000
      })
    } catch (error: any) {
      console.error('Failed to delete income:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete income',
        duration: 4000
      })
      throw error
    }
  }

  useEffect(() => {
    fetchIncomes()
  }, [])

  return {
    incomes,
    loading,
    addIncome,
    updateIncome,
    deleteIncome,
    refetch: fetchIncomes,
  }
}