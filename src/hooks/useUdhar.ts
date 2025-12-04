import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useNotification } from '@/contexts/NotificationContext'

export function useUdhar() {
  const [udhars, setUdhars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  const fetchUdhars = async () => {
    try {
      setLoading(true)
      const data = await api.getUdhars()
      setUdhars(data)
    } catch (error: any) {
      console.error('Failed to fetch udhars:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch udhar records',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const addUdhar = async (udhar: any) => {
    try {
      const newUdhar = await api.createUdhar(udhar)
      setUdhars(prev => [newUdhar, ...prev])
      addNotification({
        type: 'success',
        title: 'Udhar Added',
        message: `₹${udhar.total.toLocaleString()} udhar record has been created.`,
        duration: 4000
      })
      return newUdhar
    } catch (error: any) {
      console.error('Failed to add udhar:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to add udhar',
        duration: 4000
      })
      throw error
    }
  }

  const updateUdhar = async (udhar: any) => {
    try {
      const updatedUdhar = await api.updateUdhar(udhar.id, udhar)
      setUdhars(prev => prev.map(u => u.id === udhar.id ? updatedUdhar : u))
      addNotification({
        type: 'success',
        title: 'Udhar Updated',
        message: 'Udhar record has been successfully updated.',
        duration: 4000
      })
      return updatedUdhar
    } catch (error: any) {
      console.error('Failed to update udhar:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update udhar',
        duration: 4000
      })
      throw error
    }
  }

  const deleteUdhar = async (id: string) => {
    try {
      await api.deleteUdhar(id)
      setUdhars(prev => prev.filter(u => u.id !== id))
      addNotification({
        type: 'success',
        title: 'Udhar Deleted',
        message: 'Udhar record has been successfully deleted.',
        duration: 4000
      })
    } catch (error: any) {
      console.error('Failed to delete udhar:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete udhar',
        duration: 4000
      })
      throw error
    }
  }

  useEffect(() => {
    fetchUdhars()
  }, [])

  return {
    udhars,
    loading,
    addUdhar,
    updateUdhar,
    deleteUdhar,
    refetch: fetchUdhars,
  }
}