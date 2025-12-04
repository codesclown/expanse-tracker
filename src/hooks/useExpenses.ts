import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useNotification } from '@/contexts/NotificationContext'
import { useData } from '@/contexts/DataContext'

export function useExpenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()
  const { triggerRefresh } = useData()

  const fetchExpenses = async (filters?: any) => {
    try {
      setLoading(true)
      const data = await api.getExpenses(filters)
      setExpenses(data)
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch expenses',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (expense: any) => {
    try {
      const newExpense = await api.createExpense(expense)
      setExpenses(prev => [newExpense, ...prev])
      triggerRefresh() // Trigger global data refresh
      addNotification({
        type: 'success',
        title: 'Expense Added',
        message: `₹${expense.amount.toLocaleString()} expense has been recorded.`,
        duration: 4000
      })
      return newExpense
    } catch (error: any) {
      console.error('Failed to add expense:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to add expense',
        duration: 4000
      })
      throw error
    }
  }

  const updateExpense = async (expense: any) => {
    try {
      const updatedExpense = await api.updateExpense(expense.id, expense)
      setExpenses(prev => prev.map(e => e.id === expense.id ? updatedExpense : e))
      triggerRefresh() // Trigger global data refresh
      addNotification({
        type: 'success',
        title: 'Expense Updated',
        message: 'Expense has been successfully updated.',
        duration: 4000
      })
      return updatedExpense
    } catch (error: any) {
      console.error('Failed to update expense:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update expense',
        duration: 4000
      })
      throw error
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(id)
      setExpenses(prev => prev.filter(e => e.id !== id))
      triggerRefresh() // Trigger global data refresh
      addNotification({
        type: 'success',
        title: 'Expense Deleted',
        message: 'Expense has been successfully deleted.',
        duration: 4000
      })
    } catch (error: any) {
      console.error('Failed to delete expense:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete expense',
        duration: 4000
      })
      throw error
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}