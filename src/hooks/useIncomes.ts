import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useIncomes() {
  const [incomes, setIncomes] = useLocalStorage<any[]>('incomes', [])
  const [loading, setLoading] = useState(false)

  const addIncome = async (income: any) => {
    const newIncome = { 
      ...income, 
      id: Date.now(), 
      createdAt: new Date().toISOString(),
      timestamp: Date.now() // Add timestamp for sorting
    }
    setIncomes([...incomes, newIncome])
  }

  const deleteIncome = async (id: string | number) => {
    setIncomes(incomes.filter(i => i.id !== id))
  }

  return { incomes, loading, addIncome, deleteIncome }
}
