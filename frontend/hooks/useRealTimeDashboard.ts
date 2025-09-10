import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import socketService, { DashboardData } from '@/lib/socketService'
import authApi from '@/lib/authApi'

interface UseRealTimeDashboardReturn {
  dashboardData: DashboardData | null
  loading: boolean
  error: string | null
  connectionStatus: string
  isConnected: boolean
  requestData: () => void
  sendAction: (action: string, data?: any) => void
  refreshData: () => Promise<void>
}

export const useRealTimeDashboard = (): UseRealTimeDashboardReturn => {
  const { user, token } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected')
  const [isConnected, setIsConnected] = useState(false)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Socket.IO connection
  const initializeSocket = useCallback(async () => {
    if (!token || !user) {
      setError('No authentication token available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setConnectionStatus('connecting')

      // Set up Socket.IO callbacks
      socketService.setCallbacks({
        onDashboardUpdate: (data: DashboardData) => {
          setDashboardData(data)
          setLoading(false)
          setError(null)
        },
        onSystemAlert: (alert: any) => {
          console.log('System alert received:', alert)
          // You can add toast notifications here
        },
        onNewPrediction: (prediction: any) => {
          console.log('New prediction received:', prediction)
          // Refresh dashboard data when new prediction arrives
          requestData()
        },
        onConnected: (status: string) => {
          setConnectionStatus('connected')
          setIsConnected(true)
          setError(null)
          console.log('Socket.IO connected successfully')
        },
        onDisconnected: () => {
          setConnectionStatus('disconnected')
          setIsConnected(false)
          console.log('Socket.IO disconnected')
        },
        onError: (errorMessage: string) => {
          setError(errorMessage)
          setLoading(false)
          setConnectionStatus('error')
          console.error('Socket.IO error:', errorMessage)
        }
      })

      // Connect to Socket.IO
      await socketService.connect(token)
      
    } catch (error) {
      console.error('Failed to initialize Socket.IO:', error)
      setError('Failed to connect to real-time updates')
      setConnectionStatus('error')
      setLoading(false)
      
      // Fallback to API polling if Socket.IO fails
      await fetchInitialData()
    }
  }, [token, user])

  // Fetch initial data via API
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await authApi.getUserProfile()
      if (response.success) {
        // Convert profile data to dashboard format
        const profileData = response.data
        const dashboardData: DashboardData = {
          user_id: profileData.user.id,
          timestamp: new Date().toISOString(),
          metrics: {
            total_predictions: profileData.activity_summary.total_predictions,
            avg_churn_score: profileData.activity_summary.avg_churn_score,
            high_risk_predictions: profileData.activity_summary.high_risk_predictions,
            low_risk_predictions: 0, // Calculate from profile data
            medium_risk_predictions: 0, // Calculate from profile data
            engagement_score: 0.75, // Mock data
            retention_rate: 0.85, // Mock data
            active_users_today: 150, // Mock data
            new_predictions_today: profileData.recent_predictions.length
          },
          recent_activity: profileData.recent_predictions,
          trends: {
            churn_trend: profileData.churn_insights.trend,
            engagement_trend: 'stable',
            retention_trend: 'stable'
          },
          alerts: []
        }
        setDashboardData(dashboardData)
        setError(null)
      } else {
        setError('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching initial data:', error)
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Request dashboard data
  const requestData = useCallback(() => {
    if (isConnected) {
      socketService.requestDashboardData()
    } else {
      fetchInitialData()
    }
  }, [isConnected, fetchInitialData])

  // Send user action
  const sendAction = useCallback((action: string, data?: any) => {
    if (isConnected) {
      socketService.sendUserAction(action, data)
    } else {
      console.warn('Socket not connected, action not sent:', action)
    }
  }, [isConnected])

  // Refresh data manually
  const refreshData = useCallback(async () => {
    setLoading(true)
    if (isConnected) {
      socketService.requestDashboardData()
    } else {
      await fetchInitialData()
    }
  }, [isConnected, fetchInitialData])

  // Auto-reconnect logic
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isConnected && token && user) {
        console.log('Attempting to reconnect...')
        initializeSocket()
      }
    }, 5000) // Reconnect after 5 seconds
  }, [isConnected, token, user, initializeSocket])

  // Initialize on mount and when auth changes
  useEffect(() => {
    if (user && token) {
      initializeSocket()
    } else {
      setLoading(false)
      setError('User not authenticated')
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [user, token, initializeSocket])

  // Schedule reconnect when disconnected
  useEffect(() => {
    if (!isConnected && !loading && !error) {
      scheduleReconnect()
    }
  }, [isConnected, loading, error, scheduleReconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketService.disconnect()
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    dashboardData,
    loading,
    error,
    connectionStatus,
    isConnected,
    requestData,
    sendAction,
    refreshData
  }
}
