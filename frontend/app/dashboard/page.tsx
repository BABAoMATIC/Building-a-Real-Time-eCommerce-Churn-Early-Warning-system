'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useRealTimeDashboard } from '@/hooks/useRealTimeDashboard'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RealTimeDashboardCards from '@/components/dashboard/RealTimeDashboardCards'
import CohortsSection from '@/components/cohorts/CohortsSection'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { 
  RefreshCw, 
  AlertTriangle, 
  Wifi,
  WifiOff,
  Activity
} from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Dashboard() {
  const { 
    dashboardData,
    loading,
    error,
    connectionStatus,
    isConnected,
    requestData,
    sendAction,
    refreshData
  } = useRealTimeDashboard()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshData()
      setLastRefresh(new Date())
      toast.success('Dashboard data refreshed successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Failed to refresh dashboard data', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Show connection status in toast
  useEffect(() => {
    if (connectionStatus === 'connected') {
      toast.success('Connected to real-time updates!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
      })
    } else if (connectionStatus === 'error') {
      toast.error('Connection lost - using offline mode', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
      })
    }
  }, [connectionStatus])

  // Loading state
  if (loading && !dashboardData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <Topbar />
          
          <main className="lg:ml-64 pt-20">
            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <LoadingSpinner 
                  size="xl" 
                  text="Loading real-time dashboard..." 
                  className="mb-4" 
                />
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-500 text-sm mt-2"
                >
                  Connecting to live data stream
                </motion.p>
              </motion.div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <Topbar />
          
          <main className="lg:ml-64 pt-20">
            <div className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
              >
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <WifiOff className="h-8 w-8 text-red-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Failed to Load Dashboard
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md">
                      {error || 'Unable to connect to the dashboard service. Please check your connection and try again.'}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Retrying...' : 'Retry'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50" data-testid="dashboard">
        <Sidebar />
        <Topbar />
        
        <main className="lg:ml-64 pt-20">
          <div className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-7xl mx-auto"
            >
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl font-bold text-gray-900"
                    >
                      Real-Time Dashboard
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-gray-600 mt-1"
                    >
                      Live churn prediction analytics and user insights
                    </motion.p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Connection Status */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                        isConnected 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {isConnected ? (
                        <Activity className="h-4 w-4" />
                      ) : (
                        <WifiOff className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">
                        {isConnected ? 'Live' : 'Offline'}
                      </span>
                    </motion.div>

                    {/* Refresh Button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </motion.button>
                  </div>
                </div>

                {/* Last Update Info */}
                {lastRefresh && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-gray-500 mt-2"
                  >
                    Last manual refresh: {lastRefresh.toLocaleTimeString()}
                  </motion.p>
                )}
              </div>

              {/* Dashboard Content */}
              {dashboardData ? (
                <div className="space-y-8">
                  <RealTimeDashboardCards 
                    data={dashboardData}
                    loading={loading}
                    isConnected={isConnected}
                    onRefresh={handleRefresh}
                  />
                  
                  {/* Cohorts Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <CohortsSection />
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-600 mb-4">
                    No dashboard data is currently available. This might be because you haven't uploaded any data yet.
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>

        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </ProtectedRoute>
  )
}