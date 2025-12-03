import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useLocalStorage } from './useLocalStorage'

export function useExpenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [useApi, setUseApi] = useLocalStorage('useApi', false)
  const [localExpenses, setLocalExpenses] = useLocalStorage<any[]>('expenses', [])

  useEffect(() => {
    if (useApi) {
      loadFromApi()
    } else {
      setExpenses(localExpenses)
      setLoading(false)
    }
  }, [useApi]) // Remove localExpenses from dependency to avoid infinite loops

  // Separate effect to sync with local storage changes
  useEffect(() => {
    if (!useApi) {
      setExpenses(localExpenses)
    }
  }, [localExpenses, useApi])

  const loadFromApi = async () => {
    try {
      const data = await api.getExpenses()
      setExpenses(data.expenses || [])
    } catch (error) {
      console.error('Failed to load expenses:', error)
      setExpenses(localExpenses)
    } finally {
      setLoading(false)
    }
  }

  const addExpense = async (expense: any) => {
    if (useApi) {
      try {
        const data = await api.createExpense(expense)
        setExpenses([...expenses, data.expense])
      } catch (error) {
        console.error('Failed to create expense:', error)
        throw error
      }
    } else {
      const newExpense = { 
        ...expense, 
        id: Date.now(), 
        createdAt: new Date().toISOString(),
        timestamp: Date.now() // Add timestamp for sorting
      }

      const updated = [...localExpenses, newExpense]
      setLocalExpenses(updated)
      setExpenses(updated)
    }
  }

  const updateExpense = async (updatedExpense: any) => {
    if (useApi) {
      try {
        const data = await api.updateExpense(updatedExpense.id, updatedExpense)
        setExpenses(expenses.map(e => e.id === updatedExpense.id ? data.expense : e))
      } catch (error) {
        console.error('Failed to update expense:', error)
        throw error
      }
    } else {
      const updated = localExpenses.map(e => 
        e.id === updatedExpense.id ? { ...updatedExpense, updatedAt: new Date().toISOString() } : e
      )
      setLocalExpenses(updated)
      setExpenses(updated)
    }
  }

  const deleteExpense = async (id: string | number) => {
    if (useApi) {
      try {
        await api.deleteExpense(String(id))
        setExpenses(expenses.filter(e => e.id !== id))
      } catch (error) {
        console.error('Failed to delete expense:', error)
        throw error
      }
    } else {
      const updated = localExpenses.filter(e => e.id !== id)
      setLocalExpenses(updated)
      setExpenses(updated)
    }
  }

  return { expenses, loading, addExpense, updateExpense, deleteExpense, useApi, setUseApi }
}
