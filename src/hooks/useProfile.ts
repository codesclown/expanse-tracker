import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useNotification } from '@/contexts/NotificationContext'

export function useProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { addNotification } = useNotification()

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await api.getUserProfile()
      setProfile(data)
    } catch (error: any) {
      console.error('Failed to fetch profile:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to fetch profile',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: any) => {
    try {
      const updatedProfile = await api.updateUserProfile(data)
      setProfile(updatedProfile)
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.',
        duration: 4000
      })
      return updatedProfile
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update profile',
        duration: 4000
      })
      throw error
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.updatePassword(currentPassword, newPassword)
      addNotification({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been successfully changed.',
        duration: 4000
      })
    } catch (error: any) {
      console.error('Failed to update password:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update password',
        duration: 4000
      })
      throw error
    }
  }

  const generateMonthlyReport = async (year: number, month: number) => {
    try {
      const result = await api.generateMonthlyReport(year, month)
      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Report Generated',
          message: 'Monthly report has been sent to your email.',
          duration: 4000
        })
      } else {
        throw new Error(result.error)
      }
      return result
    } catch (error: any) {
      console.error('Failed to generate report:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to generate monthly report',
        duration: 4000
      })
      throw error
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    loading,
    updateProfile,
    updatePassword,
    generateMonthlyReport,
    refetch: fetchProfile,
  }
}