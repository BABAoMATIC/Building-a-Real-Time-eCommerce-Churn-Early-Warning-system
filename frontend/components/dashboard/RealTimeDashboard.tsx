'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, AlertTriangle, Activity, Wifi, WifiOff } from 'lucide-react'
import { useSocket } from '@/components/hooks/useSocket'
import Card from '@/components/ui/Card'

interface LiveData {
  total_users: number
  total_predictions: number
  avg_churn_score: number
  high_risk_users: number
  timestamp: string
  has_data: boolean
}

interface Prediction {
  id: string
  user_id: string
  churn_score: number
  risk_level: string
  timestamp: string
  file_name: string
  status: string
}

export default function RealTimeDashboard() {
  const { socket, connected } = useSocket()
  const [liveData, setLiveData] = useState<LiveData | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch initial data
    fetchLiveData()
    fetchPredictions()

    if (socket) {
      // Listen for real-time updates
      socket.on('live_data_update', (data: LiveData) => {
        setLiveData(data)
        setLoading(false)
      })

      socket.on('new_predictions', (data: { predictions: Prediction[] }) => {
        setPredictions(prev => [...prev, ...data.predictions])
      })

      // Request live data updates
      socket.emit('request_live_data')
    }

    // Set up polling as fallback
    const interval = setInterval(() => {
      if (!connected) {
        fetchLiveData()
      }
    }, 30000) // Poll every 30 seconds if not connected via socket

    return () => {
      clearInterval(interval)
    }
  }, [socket, connected])

  const fetchLiveData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/live-data')
      if (response.ok) {
        const data = await response.json()
        setLiveData(data)
      }
    } catch (error) {
      console.error('Error fetching live data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPredictions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/predictions')
      if (response.ok) {
        const data = await response.json()
        setPredictions(data.predictions || [])
      }
    } catch (error) {
      console.error('Error fetching predictions:', error)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  if (!liveData?.has_data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8"
      >
        <Card className="p-8">
          <div className="max-w-md mx-auto">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Activity className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-6">
              Upload your data files to start seeing churn predictions and analytics.
            </p>
            <motion.a
              href="/settings"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Data
            </motion.a>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gray-900">Real-Time Dashboard</h2>
        <div className="flex items-center space-x-2">
          {connected ? (
            <>
              <Wifi className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">Offline</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {liveData?.total_users.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Predictions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {liveData?.total_predictions.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Churn Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((liveData?.avg_churn_score || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {liveData?.high_risk_users.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions</h3>
          {predictions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No predictions available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Churn Score
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {predictions.slice(0, 10).map((prediction, index) => (
                    <motion.tr
                      key={prediction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prediction.user_id}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(prediction.churn_score * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(prediction.risk_level)}`}>
                          {prediction.risk_level}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(prediction.timestamp).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
