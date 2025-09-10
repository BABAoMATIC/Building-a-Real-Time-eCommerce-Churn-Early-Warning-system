'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useChurn } from '@/hooks/useChurn'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import EnhancedDashboardCards from '@/components/ui/EnhancedDashboardCards'
import ChurnDistributionChart from '@/components/charts/ChurnDistributionChart'
import { ChurnPredictionCard } from '@/components/ui/ChurnPredictionCard'
import { 
  RefreshCw, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  BarChart3,
  Loader2,
  Wifi,
  WifiOff,
  Sparkles,
  Zap,
  Target,
  Activity,
  Shield,
  Star,
  Rocket,
  Heart
} from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Dashboard() {
  const { 
    users, 
    usersLoading, 
    usersError, 
    refreshUsers 
  } = useChurn()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUsers()
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
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!usersLoading && !isRefreshing) {
        refreshUsers()
        setLastRefresh(new Date())
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [usersLoading, isRefreshing, refreshUsers])

  // Loading state
  if (usersLoading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            Loading dashboard...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (usersError && users.length === 0) {
    return (
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
                  <p className="text-gray-600 mb-6">
                    {usersError}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefresh}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Try Again</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        />
      </div>

      <Sidebar />
      <Topbar />
      
      <main className="lg:ml-64 pt-20 relative z-10">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
            >
              <div className="mb-4 sm:mb-0">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-3 mb-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg"
                  >
                    <Sparkles className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2"
                    >
                      ChurnGuard Pro
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-700 text-lg font-medium"
                    >
                      🚀 Advanced Customer Retention Intelligence
                    </motion.p>
                  </div>
                </motion.div>
                
                {lastRefresh && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center space-x-2 text-sm text-gray-600 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <span>Live • Last updated: {lastRefresh.toLocaleTimeString()}</span>
                  </motion.div>
                )}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                {/* Connection Status */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-2 text-sm bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Wifi className="h-4 w-4 text-green-500" />
                  </motion.div>
                  <span className="font-medium text-gray-700">Connected</span>
                </motion.div>
                
                {/* Refresh Button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefresh}
                  disabled={isRefreshing || usersLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline font-medium">
                    {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Dashboard Cards */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <EnhancedDashboardCards 
                users={users} 
                isLoading={usersLoading} 
              />
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Churn Distribution Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="xl:col-span-2"
              >
                <ChurnDistributionChart 
                  users={users} 
                  isLoading={usersLoading} 
                />
              </motion.div>

              {/* Churn Prediction Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="xl:col-span-1"
              >
                <ChurnPredictionCard 
                  userId={1}
                  eventType="page_view"
                  metadata={{ page: "/dashboard" }}
                  className="h-full"
                />
              </motion.div>
            </div>

            {/* Additional Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Quick Stats */}
              {[
                {
                  title: 'Active Cohorts',
                  value: new Set(users.map(u => u.cohort)).size,
                  icon: Users,
                  gradient: 'from-blue-500 to-cyan-500',
                  bgGradient: 'from-blue-50 to-cyan-50',
                  iconBg: 'bg-blue-100',
                  iconColor: 'text-blue-600',
                  description: 'Unique user cohorts',
                  emoji: '👥'
                },
                {
                  title: 'Engagement Score',
                  value: users.length > 0 
                    ? (users.reduce((sum, u) => sum + u.churn_score, 0) / users.length * 100).toFixed(1) + '%'
                    : '0%',
                  icon: TrendingUp,
                  gradient: 'from-green-500 to-emerald-500',
                  bgGradient: 'from-green-50 to-emerald-50',
                  iconBg: 'bg-green-100',
                  iconColor: 'text-green-600',
                  description: 'Average engagement score',
                  emoji: '📈'
                },
                {
                  title: 'Risk Alerts',
                  value: users.filter(u => u.churn_score > 0.8).length,
                  icon: AlertTriangle,
                  gradient: 'from-red-500 to-pink-500',
                  bgGradient: 'from-red-50 to-pink-50',
                  iconBg: 'bg-red-100',
                  iconColor: 'text-red-600',
                  description: 'Critical risk users',
                  emoji: '⚠️'
                },
                {
                  title: 'Data Points',
                  value: users.length,
                  icon: BarChart3,
                  gradient: 'from-purple-500 to-indigo-500',
                  bgGradient: 'from-purple-50 to-indigo-50',
                  iconBg: 'bg-purple-100',
                  iconColor: 'text-purple-600',
                  description: 'Total data entries',
                  emoji: '📊'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5, rotateY: 5 }}
                  className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group`}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-2 h-2 bg-gradient-to-r ${stat.gradient} rounded-full opacity-20`}
                        animate={{
                          x: [0, 100, 0],
                          y: [0, -50, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                        style={{
                          left: `${20 + i * 30}%`,
                          top: `${30 + i * 20}%`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative z-10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`p-3 rounded-xl ${stat.iconBg} shadow-md`}
                      >
                        <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                      </motion.div>
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="text-2xl"
                      >
                        {stat.emoji}
                      </motion.span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        {stat.title}
                      </p>
                      <motion.p 
                        className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                      >
                        {stat.value}
                      </motion.p>
                      <p className="text-xs text-gray-600 font-medium">
                        {stat.description}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <motion.div
                      className="mt-4 h-1 bg-white/50 rounded-full overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                    >
                      <motion.div
                        className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: "70%" }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Fun Interactive Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Achievement Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="h-8 w-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold">Achievement Unlocked!</h3>
                </div>
                <p className="text-yellow-100 mb-2">Data Master</p>
                <p className="text-sm text-yellow-200">Successfully processed {users.length} user records</p>
              </motion.div>

              {/* Performance Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                className="bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Rocket className="h-8 w-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold">System Performance</h3>
                </div>
                <p className="text-green-100 mb-2">Lightning Fast</p>
                <p className="text-sm text-green-200">Real-time processing with 99.9% uptime</p>
              </motion.div>

              {/* Health Card */}
              <motion.div
                whileHover={{ scale: 1.02, y: -3 }}
                className="bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart className="h-8 w-8" />
                  </motion.div>
                  <h3 className="text-xl font-bold">System Health</h3>
                </div>
                <p className="text-pink-100 mb-2">Excellent</p>
                <p className="text-sm text-pink-200">All systems running smoothly</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </div>
  )
}