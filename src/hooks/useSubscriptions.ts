import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useNotification } from '@/contexts/NotificationContext'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await api.getSubscriptions()
      setSubscriptions(data)
    } catch (error: any) {
      console.error('Failed to fetch subscriptions:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch subscriptions',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const detectSubscriptions = async () => {
    try {
      const result = await api.detectSubscriptions()
      await fetchSubscriptions() // Refresh the list
      addNotification({
        type: 'success',
        title: 'Subscriptions Detected',
        message: `Found ${result.detected} potential subscriptions from your expenses.`,
        duration: 4000
      })
      return result
    } catch (error: any) {
      console.error('Failed to detect subscriptions:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to detect subscriptions',
        duration: 4000
      })
      throw error
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  return {
    subscriptions,
    loading,
    detectSubscriptions,
    refetch: fetchSubscriptions,
  }
}